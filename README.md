# Rok-N-Rolls Breakfast Menu

This repository contains a split-stack project with two applications:
- `backend/` - Laravel 10 app (PHP API + web layer)
- `frontend/` - React 19 + Vite 8 app (client UI)

At the moment, the repo is a ready-to-extend starter base for future Breakfast Menu features.

## Tech Stack

- Backend: PHP 8.1+, Laravel 10, Sanctum
- Frontend: React 19, Vite 8, ESLint
- Database: MySQL (default in `backend/.env.example`)

## Repository Structure

```text
Rok-N-Rolls-BreakfastMenu/
|- backend/
|- frontend/
|- .gitignore
`- README.md
```

## Requirements

Install these tools before running locally:
- PHP >= 8.1
- Composer
- Node.js >= 20.19 (recommended: current LTS)
- npm
- MySQL (or another DB driver if you reconfigure Laravel)

## Installation

### 1) Clone repository

```bash
git clone https://github.com/Squ8sh/Rok-N-Rolls-BreakfastMenu.git
cd Rok-N-Rolls-BreakfastMenu
```

### 2) Setup backend (Laravel)

```bash
cd backend
composer install
```

Create `.env` from template:

Linux/macOS:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Generate app key and run migrations:

```bash
php artisan key:generate
php artisan migrate
```

Install backend Vite dependencies:

```bash
npm install
```

### 3) Setup frontend (React)

```bash
cd ../frontend
npm install
```

## Run in Development

Use 2-3 terminals.

### Terminal 1: Laravel backend

```bash
cd backend
php artisan serve
```

Default URL: `http://127.0.0.1:8000`

### Terminal 2: Backend Vite (optional, for Laravel Blade assets)

```bash
cd backend
npm run dev
```

### Terminal 3: React frontend

```bash
cd frontend
npm run dev
```

If `5173` is already used (for example by backend Vite), run frontend on another port:

```bash
npm run dev -- --port 5174
```

## Available Scripts

### `backend/package.json`

- `npm run dev` - start Vite dev server
- `npm run build` - build production assets

### `frontend/package.json`

- `npm run dev` - start Vite dev server
- `npm run build` - build production bundle
- `npm run lint` - run ESLint
- `npm run preview` - preview production build locally

## Current Routes

### Backend Web

- `GET /` - default Laravel `welcome` view

### Backend API

- `GET /api/user` - protected by `auth:sanctum`

Custom business endpoints are not implemented yet.

## Important Backend Environment Variables

Minimum values for local run (`backend/.env`):

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

After editing `.env`, you can clear config cache:

```bash
php artisan config:clear
```

## Quality Checks

Backend tests:

```bash
cd backend
php artisan test
```

Frontend lint:

```bash
cd frontend
npm run lint
```

## Current Project Status

The repo is currently a clean starter foundation:
- backend and frontend apps are split and configured
- local development scripts are ready
- build and lint tooling is in place

Next step is implementing domain logic (models, API endpoints, UI screens, and backend/frontend integration).
