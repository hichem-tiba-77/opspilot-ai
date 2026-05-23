# OpsPilot AI

AI-powered DevOps incident platform — monitor logs, detect incidents, and get AI-driven root cause analysis.

## Architecture

```
opspilot-ai/
├── apps/
│   ├── backend/      # FastAPI + SQLAlchemy + MySQL
│   └── frontend/     # Next.js 16 + React 19 + Tailwind CSS 4
└── docker-compose.yml
```

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

## Quick Start (Docker)

```bash
# Copy and configure secrets
cp apps/backend/.env.example apps/backend/.env
# Edit .env and add your ANTHROPIC_API_KEY

# Start all services (MySQL + backend + frontend)
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Local Development

### Backend

```bash
cd apps/backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start MySQL (or use Docker for just the DB)
docker run -d -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root_secret \
  -e MYSQL_DATABASE=opspilot \
  -e MYSQL_USER=opspilot \
  -e MYSQL_PASSWORD=opspilot_secret \
  mysql:8.0

# Run the backend
uvicorn app.main:app --reload
```

### Frontend

```bash
cd apps/frontend

npm install

# Configure environment
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

## Environment Variables

### Backend (`apps/backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `mysql` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `opspilot` |
| `DB_PASSWORD` | MySQL password | `opspilot_secret` |
| `DB_NAME` | Database name | `opspilot` |
| `JWT_SECRET` | JWT signing secret | *(change this!)* |
| `JWT_EXPIRE_MINUTES` | Token expiry | `60` |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI analysis | *(optional — falls back to mock)* |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:3000` |

### Frontend (`apps/frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

## API Overview

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login |
| `GET` | `/api/v1/auth/me` | Get current user |
| `GET` | `/api/v1/projects` | List projects |
| `POST` | `/api/v1/projects` | Create project |
| `GET` | `/api/v1/projects/{id}` | Get project details |
| `GET` | `/api/v1/projects/{id}/logs` | List logs (paginated) |
| `POST` | `/api/v1/projects/{id}/logs` | Upload logs |
| `GET` | `/api/v1/projects/{id}/incidents` | List incidents |
| `POST` | `/api/v1/projects/{id}/incidents` | Create incident |
| `POST` | `/api/v1/projects/{id}/analysis` | AI log analysis |
| `GET` | `/api/v1/incidents` | All incidents (global) |
| `GET` | `/api/v1/dashboard/stats` | Dashboard stats |
| `GET` | `/api/v1/dashboard/recent-incidents` | Recent incidents |

Full interactive docs: http://localhost:8000/docs
