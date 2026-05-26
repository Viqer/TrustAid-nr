# TrustAid Docker Guide

This guide shows how to build and run the TrustAid stack with Docker Compose, even if you have never used Docker before.

## What Runs In Docker

The Compose file starts 4 services:

- `mongodb` - MongoDB 7 database on port `27017`
- `blockchain` - Hardhat node on port `8545`
- `backend` - Node.js / Express API on port `5000`
- `frontend` - Vite React app on port `5173`

## Prerequisites

Before running the project, make sure:

1. Docker Desktop is installed on your machine.
2. Docker Desktop is running.
3. `docker` works in a terminal.

You can check with:

```powershell
docker --version
docker compose version
```

If those commands work, you are ready.

## Project Layout

Important folders in this repo:

- `frontend/` contains the Dockerfile for the React app
- `backend/` contains the API and its Dockerfile
- `blockchain/` contains the Hardhat node and its Dockerfile
- `docker-compose.yml` is in the project root

## Start The Full Stack

Open a terminal in the project root folder:

```powershell
cd "D:\TrustAid Code"
```

Then build and start everything:

```powershell
docker compose up --build
```

This command will:

- build the frontend, backend, and blockchain images
- start MongoDB in a container
- start the Hardhat node
- start the backend API
- start the frontend dev server

## Open The App

After the containers are running, open:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Hardhat node: localhost:8545

## Start Only The Backend Stack

If the frontend is already running separately, you can start just the backend-related services:

```powershell
docker compose up --build backend mongodb blockchain
```

## Seed Demo Data

This project includes a seed script that creates demo users, including an admin account.

Run it after the backend container is up:

```powershell
docker compose exec backend node scripts/seed.js
```

Demo login details created by the seed script:

- Admin: `admin@test.com`
- Password: `password123`
- Donor: `donor@test.com`
- NGO: `ngo@test.com`

## Stop The Stack

To stop all running containers:

```powershell
docker compose down
```

To stop everything and also remove the MongoDB volume data:

```powershell
docker compose down -v
```

Use `-v` only if you want to erase the saved database data.

## View Logs

If something goes wrong, logs are usually the fastest way to find the problem.

```powershell
docker compose logs -f
```

To view only one service:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
docker compose logs -f blockchain
```

## Common Commands

Build without starting containers:

```powershell
docker compose build
```

Rebuild one service:

```powershell
docker compose build backend
```

Restart one service:

```powershell
docker compose restart backend
```

Remove stopped containers and unused local resources for this project:

```powershell
docker compose down --remove-orphans
```

## Troubleshooting

### Docker is not recognized

- Open Docker Desktop first
- Close and reopen PowerShell
- Check `docker --version`

### Backend starts but the site shows an error

- Make sure `docker compose up --build` completed without errors
- Check backend logs with `docker compose logs -f backend`
- Check that MongoDB and the blockchain service are running

### Frontend cannot reach the backend

- Make sure the backend is listening on port `5000`
- The frontend uses `VITE_API_URL=http://localhost:5000`
- Rebuild the frontend after code changes with `docker compose up --build`

### Database keeps resetting

- Your MongoDB data is stored in the named volume `mongodb_data`
- Do not run `docker compose down -v` unless you want to clear it

## Notes

- The backend reads both `MONGODB_URI` and `MONGO_URI`
- The frontend Docker build uses the existing `client/` source folder
- Campaign creation currently requires an NGO account, not an admin account
