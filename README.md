# finargentina

A full-stack application for financial analysis in Argentina, featuring a Go backend and a React/Vite frontend.

## Project Structure

- `backend/`: Go-based API handling data processing and business logic.
- `frontend/`: React application built with Vite and Tailwind CSS.
- `docker-compose.yml`: Orchestrates the backend and frontend services.

## Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Go](https://golang.org/) (for local backend development)
- [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) (for local frontend development)

## Getting Started

### Using Docker Compose (Recommended)

To run the entire stack:

```bash
docker-compose up --build
```

### Local Development

#### Backend
```bash
cd backend
go mod download
go run cmd/main.go
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

- Financial data aggregation for Argentine entities.
- Interactive market overview and entity analysis.
## Configuration

This project uses environment variables for configuration. See `.env.example` in both `frontend/` and `backend/` directories.

### Local Variables
- **Backend**: `DATABASE_URL`, `PORT`.
- **Frontend**: `VITE_API_URL`.

## Deployment on Render.com

### Backend (Web Service)
1. Create a **PostgreSQL** database on Render.
2. Create a **Web Service** for the backend.
3. Configure the **Build Command**: `cd backend && go build -o bin/server cmd/server/main.go`
4. Configure the **Start Command**: `./backend/bin/server`
5. Add **Environment Variables**:
   - `DATABASE_URL`: Your Render PostgreSQL connection string.
   - `PORT`: 8080 (or any other port, Render will map it).

### Frontend (Static Site)
1. Create a **Static Site** for the frontend.
2. Configure the **Build Command**: `cd frontend && npm install && npm run build`
3. Configure the **Publish Directory**: `frontend/dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: The public URL of your backend Service (e.g., `https://backend.onrender.com`).
