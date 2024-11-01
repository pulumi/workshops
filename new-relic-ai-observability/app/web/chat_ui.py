"""
Frontend for the chatbot application
"""

# import the New Relic Python Agent
import os
import urllib.parse
import json
import requests
import newrelic.agent
from flask import Flask, render_template, request, session
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8081")

# initialize the New Relic Python agent
newrelic.agent.initialize('newrelic.ini')

@app.route("/")
def home():
    """
    Render the home page.

    Returns:
        Response: Rendered HTML of the home page.
    """
    return render_template("index.html")

@app.route("/activities", methods=["GET"])
def activities():
    """
    Handle GET requests for activities.

    Returns:
        Response: Rendered HTML of the activities page.
    """
    response = requests.get(f"{BACKEND_URL}/activities", timeout=30)
    session['games'] = response.text
    return render_template("index.html", outputGames=response.text)

@app.route("/activities/search", methods=["POST"])
def activities_search():
    """
    Perform a search for activities.

    This function handles the logic for searching activities based on user input.
    It retrieves the search parameters, queries the database or data source, and
    returns the search results.

    Returns:
        list: A list of activities that match the search criteria.
    """
    input_prompt = request.form.get("input")
    activity = urllib.parse.quote(input_prompt.encode('UTF-8'))
    response = requests.get(
        url=f"{BACKEND_URL}/activities/search?activity={activity}",
        timeout=30
        )
    json_object = json.loads(response.text)
    session['game_input'] = input_prompt
    session['game_prompt'] = json_object["prompt"]
    return render_template(
        "index.html",
        outputGamePrompt=json_object["prompt"],
        outputGames=input_prompt
        )

@app.route("/chat", methods=["POST"])
def chat():
    """
    Handle the chat functionality.

    This function manages the chat interactions, processing user inputs,
    generating responses, and updating the chat interface accordingly.

    Returns:
        None
    """
    # for key, value in request.form.items():
    #     print(f"{key}: {value}")
    input_prompt = request.form.get("inputGamePrompt")
    print(f"input_prompt: {input_prompt}")
    body = {"message": input_prompt}
    response = requests.post(url=f"{BACKEND_URL}/chat", data=body, timeout=30)
    json_object = json.loads(response.text)
    if "guid" in json_object:
        guid = json_object["guid"]
        session['guid'] = guid
    else:
        print("GUID does not exist.")
    if (
    "messages" in json_object and
    isinstance(json_object["messages"], list) and
    len(json_object["messages"]) > 1 and
    isinstance(json_object["messages"][1], dict) and
    "content" in json_object["messages"][1]
    ):
        chat_content = json_object["messages"][1]["content"]
        session['chat_content'] = chat_content
        return render_template("index.html",
                           outputChatGuid=guid,
                           outputChatContent=chat_content,
                           outputGamePrompt=input_prompt)
    else:
        print("Chat content does not exist.")
        print(json.dumps(json_object))
        return render_template("error.html")

@app.route("/chat/guid", methods=["POST"])
def chat_guid():
    """
    Generate a unique identifier for a chat session.

    This function creates and returns a unique identifier that can be used
    to track and manage individual chat sessions.

    Returns:
        str: A unique identifier for the chat session.
    """
    input_prompt = request.form.get("inputGameInteraction")
    body = {"message": input_prompt}
    guid = None
    if "guid" in session:
        guid = session["guid"]
    else:
        print("GUID does not exist.")
        return render_template("error.html")
    response = requests.put(
    url=f"{BACKEND_URL}/chat/{guid}",
        data=body,
        timeout=30
    )
    json_object = json.loads(response.text)
    # result = None
    # if isinstance(json_object.get("messages"), list):
    message_length = len(json_object["messages"])
    #     # Check if there is at least one message and if the last message contains "content"
    #     if message_length > 0 and isinstance(json_object["messages"][message_length - 1], dict):
    result = json_object["messages"][message_length - 1].get("content", None)
    #         if result is None:
    #             return render_template("error.html")
    #     else:
    #         return render_template("error.html")
    # else:
    #     return render_template("error.html")
    # Check if session contains the required keys
    content = session.get('chat_content', "")
    # if content is None:
    #     return render_template("error.html")
    game_input = session.get('game_input', "")
    # if game_input is None:
    #     return render_template("error.html")
    prompt = session.get('game_prompt', "")
    # if prompt is None:
    #     return render_template("error.html")
    return render_template("index.html",
                           outputChatInteraction=result,
                           outputChatGuid=guid,
                           outputChatContent=content,
                           outputGamePrompt=prompt,
                           outputGames=game_input)

if __name__ == '__main__':
    WEB_PORT= os.getenv("WEB_PORT", "8888")
    WEB_HOST= os.getenv("WEB_HOST", "0.0.0.0")
    app.run(host=WEB_HOST, port=WEB_PORT, debug=False)
