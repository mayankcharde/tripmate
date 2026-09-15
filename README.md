# TripMate

TripMate is an AI travel-planning workspace that combines a React interface, a LangGraph multi-agent planner, MCP integrations, and a human approval step. It turns a natural-language travel request into a researched draft itinerary, pauses for review, and then produces a final plan after approval or revision feedback.

## What it does

- Creates accounts and manages sessions with an Express, MongoDB, and JWT authentication service.
- Uses a LangGraph supervisor to validate travel-related requests and select specialist agents.
- Gathers flight, hotel, and weather information through MCP-connected tools.
- Estimates trip costs and produces a day-by-day itinerary.
- Persists graph checkpoints in PostgreSQL so a paused plan can be resumed by `thread_id`.
- Pauses before finalization for human approval or revision feedback.
- Provides a responsive React/Vite client with light and dark themes.

## Architecture

```mermaid
flowchart LR
  Browser[React + Vite frontend] -->|Auth with cookies| Auth[Express authentication API]
  Browser -->|Travel API| API[FastAPI planner API]
  Auth --> Mongo[(MongoDB)]
  API --> Graph[LangGraph supervisor]
  Graph --> MCP[MCP integrations]
  MCP --> Tavily[Tavily search]
  MCP --> Aviation[AviationStack]
  MCP --> Weather[OpenWeather MCP server]
  Graph --> Postgres[(PostgreSQL checkpoints)]
```

The repository contains three independently runnable applications:

| Directory | Purpose | Default address |
| --- | --- | --- |
| `TRIPMATE/` | FastAPI API, LangGraph workflow, MCP client, and legacy server-rendered UI assets | `http://127.0.0.1:8000` |
| `TRIPMATE FRONTEND/` | React/Vite application used as the main client | `http://localhost:5173` |
| `TRIPMATE AUTHENTICATION/` | Express authentication API backed by MongoDB | `http://localhost:4000` |

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer
- npm
- PostgreSQL database for LangGraph checkpoints
- MongoDB database for user accounts
- `uv`/`uvx` for the AviationStack MCP adapter
- API credentials for Groq, Tavily, AviationStack, and OpenWeather

## Configuration

### Planner API

Create `TRIPMATE/.env` with the following values. Keep this file local and never commit real credentials.

```dotenv
DATABASE_URL=postgresql://user:password@host:5432/database
GROQ_API_KEY=your-groq-api-key
TAVILY_API_KEY=your-tavily-api-key
AVIATIONSTACK_API_KEY=your-aviationstack-api-key
OPENWEATHER_API_KEY=your-openweather-api-key
DEFAULT_ORIGIN_IATA=DAC
```

`AVIATION_STACK_API_KEY` is also accepted by the MCP client. `DATABASE_URL` is automatically configured with `sslmode=require` when no SSL mode is present.

### Authentication API

Copy `TRIPMATE AUTHENTICATION/.env.example` to `TRIPMATE AUTHENTICATION/.env` and configure:

```dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/tripmate
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend

The Vite development proxy sends `/api` and `/health` requests to `http://127.0.0.1:8000` by default. Set these variables only when the services run elsewhere:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
VITE_AUTH_API_URL=http://localhost:4000
```

For a production deployment, set `VITE_API_URL` to the public planner API URL and `VITE_AUTH_API_URL` to the public authentication API URL.

## Local development

Run each service in its own terminal from the repository root.

### 1. Start the planner API

```powershell
cd TRIPMATE
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The API also starts with `python app.py`. The weather MCP server is launched automatically by `mcp_client.py` over stdio when weather tools are requested; it does not need a separate terminal.

### 2. Start the authentication API

```powershell
cd "TRIPMATE AUTHENTICATION"
npm install
npm run dev
```

The authentication service connects to MongoDB during startup. Make sure `MONGODB_URI` is reachable before starting it.

### 3. Start the React frontend

```powershell
cd "TRIPMATE FRONTEND"
npm install
npm run dev
```

Open `http://localhost:5173`, create an account, and submit a travel request. The frontend stores the active planner `thread_id` in local storage so the approval step can resume the same graph execution.

## Planner workflow

1. The supervisor applies a travel-domain guardrail.
2. The supervisor selects the required flight, hotel, weather, budget, and itinerary agents.
3. Selected MCP tools and the Groq model provide planning inputs.
4. The itinerary agent creates a draft.
5. LangGraph interrupts execution and returns the draft for human review.
6. Approval finalizes the plan; rejection resumes the same thread with feedback.

Requests outside travel planning, or requests involving harmful or illegal instructions, are rejected by the guardrail. Temporary failures in individual live-data integrations are reported as unavailable data so the planner can still provide clearly labeled general guidance where possible.

## API reference

### Planner API (`TRIPMATE`)

#### `POST /api/travel`

Starts a new planning thread or continues an existing one.

```json
{
  "message": "Plan a five-day cultural trip to Kyoto with a moderate budget",
  "thread_id": "optional-existing-thread-id"
}
```

The response includes `thread_id`, the current `answer`, specialist results, selected agents, constraints, and `requires_approval`. When `requires_approval` is `true`, review the returned `itinerary` before submitting approval.

#### `POST /api/travel/approve`

Resumes a paused thread.

```json
{
  "thread_id": "user-thread-id",
  "approved": false,
  "feedback": "Reduce the number of activities on day three"
}
```

Revision requests must include non-empty `feedback`.

#### `GET /health`

Returns the planner service status and enabled workflow features.

### Authentication API (`TRIPMATE AUTHENTICATION`)

- `POST /api/auth/register` creates an account and sets an HTTP-only session cookie.
- `POST /api/auth/login` authenticates a user.
- `GET /api/auth/me` returns the current authenticated user.
- `POST /api/auth/logout` clears the session cookie.
- `GET /health` checks service availability.

Passwords are hashed with bcrypt and are never returned in API responses. The authentication service applies security headers, credentialed CORS, and rate limiting to auth routes.

## Useful commands

```powershell
# Frontend production build
cd "TRIPMATE FRONTEND"
npm run build

# Frontend lint
npm run lint

# Preview the production frontend build
npm run preview

# Run the Python API in the supplied container configuration
cd ..\TRIPMATE
docker build -t tripmate-api .
docker run --env-file .env -p 8000:8000 tripmate-api
```

## Troubleshooting

- **Missing `GROQ_API_KEY` or database errors:** verify `TRIPMATE/.env` and confirm the PostgreSQL URL is reachable.
- **AviationStack MCP errors:** install `uv`, confirm `uvx --version` works in the active terminal, and verify the AviationStack key.
- **Authentication CORS or cookie errors:** set `CLIENT_ORIGIN` to the exact frontend origin and use matching `localhost`/`127.0.0.1` hostnames during development.
- **Frontend cannot reach the planner:** start FastAPI on port 8000 or set `VITE_API_URL` to the correct API URL.
- **Frontend cannot sign in:** start the authentication API on port 4000 or set `VITE_AUTH_API_URL` accordingly.

## Project layout

```text
TRIPMATE/
  app.py                         FastAPI routes and web entry point
  backend.py                     LangGraph workflow and PostgreSQL checkpointing
  mcp_client.py                  Tavily, AviationStack, and weather MCP clients
  custom_weather_mcp_server.py   OpenWeather MCP server
  requirements.txt               Python dependencies
  Dockerfile                     Container image for the planner API
  templates/ static/             Legacy server-rendered frontend assets

TRIPMATE FRONTEND/
  src/App.jsx                    Authenticated application shell and workflow state
  src/components/                Auth, planner, navigation, and result views
  src/services/                  Planner and authentication API clients
  package.json                   Vite scripts and frontend dependencies

TRIPMATE AUTHENTICATION/
  server.js                      Express routes, JWT cookies, and MongoDB access
  .env.example                   Authentication configuration template
```

## Security notes

- Do not commit `.env` files or API keys.
- Use a long, random `JWT_SECRET` outside local development.
- Serve the frontend and APIs over HTTPS in production.
- Set an exact production `CLIENT_ORIGIN`; avoid permissive CORS configuration.
- Treat live flight, hotel, and weather results as time-sensitive information and verify them before booking.

## License

See [LICENSE](TRIPMATE/LICENSE).
