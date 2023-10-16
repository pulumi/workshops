package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	dapr "github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
	"github.com/go-chi/chi/v5"
	"github.com/skip2/go-qrcode"
	"log"
	"net/http"
	"os"
)

var sub = &common.Subscription{
	PubsubName: os.Getenv("PUBSUB_COMPONENT_NAME"),
	Topic:      os.Getenv("PUBSUB_TOPIC"),
	Route:      fmt.Sprintf("/%s", os.Getenv("PUBSUB_TOPIC")),
}

type Order struct {
	OrderId   string `json:"orderId"`
	Timestamp string `json:"timestamp"`
	Items     []struct {
		ItemId      string `json:"itemId"`
		Description string `json:"description"`
		Price       int    `json:"price"`
	} `json:"items"`
	Address struct {
		Street  string `json:"street"`
		City    string `json:"city"`
		State   string `json:"state"`
		Zipcode string `json:"zipcode"`
	} `json:"address"`
	CustomerId string `json:"customerId"`
}

func main() {

	appPort := os.Getenv("APP_PORT")
	if appPort == "" {
		appPort = "6005"
	}

	r := chi.NewRouter()
	r.HandleFunc("/health/{endpoints:liveness|readiness}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"ok": true})
	})

	s := daprd.NewServiceWithMux(fmt.Sprintf(":%s", appPort), r)

	err := s.AddTopicEventHandler(sub, eventHandler)
	if err != nil {
		log.Fatalf("error adding topic subscription: %v", err)
	}

	err = s.Start()
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("error listenning: %v", err)
	}
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (bool, error) {
	var order Order
	err := json.Unmarshal(e.RawData, &order)
	if err != nil {
		log.Printf("Error unmarshalling order: %v", err)
		return false, err
	}
	log.Printf("Received order %s", order.OrderId)

	qrCodeContent := fmt.Sprintf("Order ID: %s\n, Customer ID: %s\n, Address: %s, %s, %s, %s\n", order.OrderId, order.CustomerId, order.Address.Street, order.Address.City, order.Address.State, order.Address.Zipcode)

	qrCode, err := qrcode.Encode(qrCodeContent, qrcode.Medium, 256)
	if err != nil {
		return false, err
	}
	client, err := dapr.NewClient()
	if err != nil {
		log.Print("Error creating Dapr client")
		return false, err
	}

	bindingName := os.Getenv("BINDING_NAME")
	in := &dapr.InvokeBindingRequest{Name: bindingName, Operation: "create", Data: qrCode, Metadata: map[string]string{"key": order.OrderId + ".png"}}
	out, err := client.InvokeBinding(ctx, in)
	if err != nil {
		log.Printf("Error invoking output binding, %v\n", err)
		return false, err
	}
	log.Printf("Output binding response: %v\n", string(out.Data))
	log.Printf("Output binding metadata: %v\n", out.Metadata)

	return false, nil
}
