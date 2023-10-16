package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"time"

	dapr "github.com/dapr/go-sdk/client"
	"github.com/labstack/echo/v4"
)

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

type CustomContext struct {
	echo.Context
	DaprClient dapr.Client
}

func DaprClientMiddleware(daprClient dapr.Client) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := &CustomContext{
				Context:    c,
				DaprClient: daprClient,
			}
			return next(cc)
		}
	}
}

func main() {
	e := echo.New()

	daprClient, err := dapr.NewClient()
	if err != nil {
		log.Fatalf("failed to create dapr client: %v", err)
	}
	defer daprClient.Close()

	e.Use(DaprClientMiddleware(daprClient))

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}

	e.POST("/neworder", func(c echo.Context) error {
		cc := c.(*CustomContext)
		order := new(Order)
		if err := cc.Bind(&order); err != nil {
			return err
		}

		log.Println("Got a new order! Order ID:", order.OrderId)
		// add timestamp
		order.Timestamp = time.Now().String()

		pubsubComponentName := os.Getenv("PUBSUB_COMPONENT_NAME")
		pubsubTopic := os.Getenv("PUBSUB_TOPIC")

		err = cc.DaprClient.PublishEvent(context.Background(), pubsubComponentName, pubsubTopic, order)
		if err != nil {
			log.Println("Error publishing event:", err)
			return cc.JSON(http.StatusInternalServerError, map[string]string{"message": "Could not publish event."})
		}

		return cc.String(http.StatusOK, "OK")
	})

	e.GET("/health/liveness", func(c echo.Context) error {
		return c.String(200, "OK")
	})
	e.GET("/health/readiness", func(c echo.Context) error {
		return c.String(200, "OK")
	})

	err = e.Start(":" + port)
	if err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("error listenning: %v", err)
	}
}
