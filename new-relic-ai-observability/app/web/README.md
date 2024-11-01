# Chat Application Web Front-End

## Description

This is a simple chat application that allows users to interact through a chat interface. The application is built using Flask for the backend and HTML for the frontend.

## Run

> [!IMPORTANT]
> **Recommended**  use the [`docker-compose.yml`](../docker-compose.yml).

```bash
docker compose up
```

## Endpoints

- **Home Page** (`/`):
  - Renders the home page.
  - Method: `GET`
  - Returns: Rendered HTML of the home page.

- **Activities** (`/activities`):
  - Handles GET requests for activities.
  - Method: `GET`
  - Returns: Rendered HTML of the activities page.

- **Chat** (`/chat`):
  - Handles the chat functionality.
  - Method: `POST`
  - Returns: None

- **Chat GUID** (`/chat_guid`):
  - Generates a unique identifier for a chat session.
  - Method: `GET`
  - Returns: A unique identifier for the chat session.

## Additional Notes

- Ensure that you have the `newrelic.ini` file configured if you are using New Relic for monitoring.
