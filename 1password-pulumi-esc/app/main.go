package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"regexp"
	"strings"
	"unicode"

	"github.com/google/generative-ai-go/genai"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/option"
)

func New() http.Handler {
	mux := http.NewServeMux()
	// Root
	mux.Handle("/", http.FileServer(http.Dir("templates/")))

	// OAuth with Google
	mux.HandleFunc("/auth/google/login", oauthGoogleLogin)
	mux.HandleFunc("/auth/google/callback", oauthGoogleCallback)

	// App endpoint
	mux.HandleFunc("/submit", submitEndpoint)

	return mux
}

func getEnvOrDefault(envVarName, defaultValue string) string {
	value := os.Getenv(envVarName)
	if value == "" {
		log.Printf("Environment variable %s not set, using default value %s", envVarName, defaultValue)
		return defaultValue
	}
	return value
}

const (
	PORT      = "8000"
	ADDR      = ":" + PORT
	OAUTH_API = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="
)

var HOST = getEnvOrDefault("REDIR", "http://localhost:8000")
var REDIRECT = HOST  + "/auth/google/callback"

func parseResponse(resp *genai.GenerateContentResponse) (string, error) {

	var formattedContent string

	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				formattedContent += fmt.Sprintf("%s\n", part)
			}
		} else {
			return "", fmt.Errorf("no content found in response")
		}
	}
	return formattedContent, nil
}

func cleanInput(input string) string {
	// Define a regex pattern to match non-alphanumeric characters and diacritics
	pattern := regexp.MustCompile(`[^a-zA-Z\\s]+`)

	// Replace non-alphanumeric characters and diacritics with an empty string
	cleaned := pattern.ReplaceAllStringFunc(input, func(s string) string {
		var result []rune
		for _, r := range s {
			// Check if the rune is alphanumeric or whitespace
			if unicode.IsLetter(r) || unicode.IsSpace(r) {
				result = append(result, r)
			}
		}
		return string(result)
	})

	// Remove extra whitespaces
	cleaned = strings.Join(strings.Fields(cleaned), " ")
	return cleaned
}

// main is the entry point for the application.
func main() {

	// Create a new server and set the handler.
	server := &http.Server{
		Addr:    ADDR,
		Handler: New(),
	}

	log.Printf("Starting HTTP Server. Listening at %q", server.Addr)

	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Printf("%v", err)
	} else {
		log.Println("Server closed!")
	}
}

var googleOauthConfig = &oauth2.Config{
	RedirectURL:  REDIRECT,
	ClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
	Endpoint:     google.Endpoint,
}

func validateToken(accessToken string) (bool, error) {
	// Construct the tokeninfo URL with the access token
	tokeninfoURL := fmt.Sprintf("https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=%s", accessToken)

	// Make a GET request to the tokeninfo endpoint
	resp, err := http.Get(tokeninfoURL)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, err
	}

	// Parse the JSON response
	var tokenInfo map[string]interface{}
	err = json.Unmarshal(body, &tokenInfo)
	if err != nil {
		return false, err
	}

	// Check if the token is valid
	if resp.StatusCode == http.StatusOK {
		return true, nil
	} else {
		errorDescription := tokenInfo["error_description"].(string)
		return false, fmt.Errorf("token validation failed: %s", errorDescription)
	}
}

type BuzzForm struct {
	A string `json:"a"`
	P string `json:"p"`
}

func submitEndpoint(w http.ResponseWriter, r *http.Request) {

	// Read the request body
	var data BuzzForm
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
		return
	}

	// Get the values from the parsed JSON
	a := data.A
	p := data.P

	input := cleanInput(p)
	log.Print(input)

	// // Validate the access token
	_, err := validateToken(a)
	if err != nil {
		log.Printf("invalid access token: %s", a)
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	// Initialize the AI client
	var ctx = context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()
	model := client.GenerativeModel("gemini-pro")

	resp, err := model.GenerateContent(ctx, genai.Text("Use the NATO phonetic alphabet to spell out this phrase: "+input+". Give me the response as an HTML table such that the first column is the letter and the second column is the word from the NATO phonetic alphabet."))
	if err != nil {
		log.Fatal(err)
	}
	html, err := parseResponse(resp)
	if err != nil {
		log.Fatal(err)
	}

	// w.Header().Set("Content-Type", "text/html")
	fmt.Fprint(w, ` <div class="centered">`+html+`</div>`)

}

func oauthGoogleLogin(w http.ResponseWriter, r *http.Request) {
	oauthState := generateStateOauthCookie(w)

	u := googleOauthConfig.AuthCodeURL(oauthState)
	http.Redirect(w, r, u, http.StatusTemporaryRedirect)
}

func oauthGoogleCallback(w http.ResponseWriter, r *http.Request) {
	// Read oauthState from Cookie
	oauthState, _ := r.Cookie("oauthstate")

	if r.FormValue("state") != oauthState.Value {
		log.Println("invalid oauth google state")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}
	data, err := getUserDataFromGoogle(r.FormValue("code"))
	if err != nil {
		log.Println(err.Error())
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	// call AI -- TODO
	w.Write(data)

}

func generateStateOauthCookie(w http.ResponseWriter) string {
	var expiration = time.Now().Add(20 * time.Minute)

	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	cookie := http.Cookie{Name: "oauthstate", Value: state, Expires: expiration}
	http.SetCookie(w, &cookie)

	return state
}

func getUserDataFromGoogle(code string) ([]byte, error) {
	// Use code to get token and get user info from Google.

	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange wrong: %s", err.Error())
	}

	// Extract the OAuth2 token
	accessToken := token.AccessToken
	// refreshToken := token.RefreshToken/
	expiry := token.Expiry

	log.Printf("Access Token: %s\n", accessToken)
	// log.Printf( "Refresh Token: %s\n", refreshToken)
	log.Printf("Expiry: %s\n", expiry)

	response, err := http.Get(OAUTH_API + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %s", err.Error())
	}
	defer response.Body.Close()
	contents, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("failed read response: %s", err.Error())
	}
	return contents, nil
}
