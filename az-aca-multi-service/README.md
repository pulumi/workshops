# Todo Demo - Unified Inbox

A Kanban-style inbox UI demonstrating Azure Container Apps deployment with managed identity and Blob Storage integration.

## Features

- Drag-and-drop Kanban board (Inbox, Doing, Blocked, Done, Snoozed)
- Natural language chat commands
- Event simulation for webhook integration testing
- Persistent storage (Azure Blob Storage in production, local files in dev)

## Architecture

### Local Development
- **Frontend**: React 18 + TypeScript + Vite (port 5173)
- **Backend**: .NET 8 C# API (port 5000)
- **Storage**: File-based JSON (`api/Data/board.json`)
- **Config**: Pulumi ESC for environment variables

### Azure Production

Infrastructure deployed to Azure Container Apps with C# Pulumi:

- **Frontend**: Container App with external HTTPS ingress
- **Backend**: Container App with external HTTPS ingress
- **Storage**: Blob Storage accessed via managed identity (no connection strings)
- **Registry**: Azure Container Registry for image hosting

```
Internet → Frontend Container App
            ↓ HTTPS
          Backend Container App (+ Managed Identity)
            ↓ RBAC auth
          Azure Blob Storage (board-state/board.json)
```

Three infrastructure variants available in separate directories:
- `infra-basic/` - Simple public deployment
- `infra-native/` - Private backend with native ACA resiliency policies
- `infra-dapr/` - Service Bus pub/sub with Dapr integration

## Tech Stack

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- @dnd-kit (drag-and-drop)
- date-fns

**Backend:**
- .NET 8 (ASP.NET Core)
- File-based and Blob Storage persistence
- Swagger/OpenAPI documentation
- xUnit tests

**Infrastructure:**
- Azure Container Apps
- Azure Blob Storage with managed identity
- Azure Container Registry
- Pulumi IaC with C#
- Pulumi ESC for secrets management

## Getting Started

### Local Development (Native)

```bash
# Install dependencies
just install

# Run both frontend and backend
just dev

# Or run separately
just api        # Backend only (port 5000)
just frontend   # Frontend only (port 5173)
```

Open http://localhost:5173

### Local Development (Docker)

```bash
# Build and run containers
just docker-build
just docker-dev

# View logs
just docker-logs backend

# Stop containers
just docker-down
```

Open http://localhost:5174 (note: different port to avoid conflicts)

### Azure Deployment

Prerequisites: Azure CLI (`az login`), Pulumi CLI, Docker Desktop

```bash
just preview    # Preview infrastructure changes
just deploy     # Deploy to Azure (~3 minutes)
just outputs    # View URLs and resource names
just open-app   # Open frontend in browser

# Management
just logs backend       # View container logs
just restart backend    # Restart container
just destroy           # Remove all Azure resources
```

## Available Commands

### Local Development
```bash
just install      # Install npm + dotnet dependencies
just build        # Build both projects
just dev          # Run both services
just api          # Run backend only
just frontend     # Run frontend only
just test         # Run backend tests
just clean        # Clean build artifacts
just reset        # Reset board to initial state
just config       # Show Pulumi ESC configuration
```

### Docker
```bash
just docker-build   # Build Docker images
just docker-dev     # Run with docker-compose
just docker-down    # Stop containers
just docker-logs    # View container logs
just docker-clean   # Remove images and volumes
```

### Azure Deployment
```bash
just deploy       # Deploy infrastructure to Azure
just preview      # Preview infrastructure changes
just destroy      # Delete all Azure resources
just outputs      # View deployment outputs
just open-app     # Open frontend URL in browser
just logs [app]   # View container logs (backend/frontend)
just restart [app] # Restart container app
```

## Chat Commands

The chat interface supports natural language commands:

- `"move X to blocked"` - Set status to blocked
- `"mark as done"` / `"close"` - Set status to done
- `"start"` / `"in progress"` - Set status to doing
- `"snooze"` - Snooze for 2 days
- `"snooze for 1 week"` - Snooze for specific duration

Commands apply to the currently selected item, or specify an item in the command.

## API Endpoints

Backend API available at:
- Local: `http://localhost:5000`
- Azure: External HTTPS (get URL with `just outputs`)
- Swagger UI: `/swagger`

**Key endpoints:**
- `GET /api/board` - Get full board state
- `GET /api/items/{id}` - Get item with history
- `POST /api/items` - Create item (webhook simulation)
- `POST /api/items/{id}/status` - Update item status
- `POST /api/command` - Execute chat command
- `POST /api/board/reset` - Reset to initial state
- `GET /api/logs` - Get activity log
- `GET /health` - Health check

## Configuration

Configuration managed via Pulumi ESC. View with `just config`.

Key environment variables:
- `VITE_API_BASE_URL` - Frontend API endpoint
- `CORS_ORIGINS` - Backend CORS configuration
- `Azure__UseStorage` - Enable Blob Storage (true in production)
- `Azure__UseManagedIdentity` - Managed identity authentication

## Storage

Backend uses `IStorageService` abstraction:
- **Local**: File-based storage (`api/Data/board.json`)
- **Azure**: Blob Storage with managed identity authentication (no connection strings)

## Testing

### Backend Tests
```bash
just test
# Or: cd api && dotnet test Tests/TodoApi.Tests.csproj
```

### Deployment Tests
```bash
./test-deployment.sh
```

Tests verify:
- Frontend health endpoint
- Frontend HTML loads
- Backend provisioning status
- Blob storage container exists
- Managed identity configured

### Manual Testing
1. Open frontend URL
2. Drag items between columns
3. Use chat commands to move items
4. Create new items via "Simulate Event"
5. Reset board to initial state
6. Refresh page - data should persist

## Cost Estimation

**Azure resources (West US 2, running 24/7):**
- Container Apps Environment: $0 (included)
- Backend Container App (0.5 vCPU, 1GB): ~$30/month
- Frontend Container App (0.25 vCPU, 0.5GB): ~$15/month
- Storage Account (<1GB): ~$0.02/month
- Container Registry (Basic, <10GB): ~$5/month
- **Total: ~$50/month**

Use `just destroy` when not in use to minimize costs.

## Project Structure

```
todo-demo/
├── api/                      # .NET 8 backend
│   ├── Services/
│   │   ├── IBoardService.cs
│   │   ├── BoardService.cs
│   │   ├── IStorageService.cs      # Storage abstraction
│   │   ├── FileStorageService.cs   # Local file storage
│   │   └── BlobStorageService.cs   # Azure Blob Storage
│   ├── Models/              # Data models
│   ├── Data/                # Initial board state
│   ├── Tests/               # xUnit tests
│   ├── Dockerfile           # Multi-stage .NET build
│   └── Program.cs           # API configuration
├── frontend/                # React frontend (src/)
│   └── components/          # UI components
├── infra/                   # Pulumi infrastructure
│   ├── index.ts            # Azure resources
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile              # Frontend nginx image
├── docker-compose.yml      # Local container orchestration
├── justfile                # Task automation
├── test-deployment.sh      # Automated deployment tests
└── README.md               # This file
```

## Troubleshooting

**Local dev not working:**
```bash
lsof -i:5000  # Check if backend port in use
lsof -i:5173  # Check if frontend port in use
just reset    # Reset board data
```

**Azure deployment issues:**
```bash
just logs backend     # Check deployment logs
just restart backend  # Restart containers
just deploy          # Re-deploy
```

**Managed identity issues:**
- Wait 5-10 minutes after deployment for RBAC propagation
- Verify with: `az containerapp show --query identity`

## License

MIT
