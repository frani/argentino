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
- Modern, responsive UI with Tailwind CSS.
