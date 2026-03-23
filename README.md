# Rok-N-Rolls Breakfast Menu

Репозиторий содержит два приложения:
- `backend/` - Laravel 10 (PHP API + web-слой)
- `frontend/` - React 19 + Vite 8 (клиентская часть)

## Технологии

- Бэкенд: PHP 8.1+, Laravel 10, Sanctum
- Фронтенд: React 19, Vite 8, ESLint
- База данных: MySQL (по умолчанию в `backend/.env.example`)

## Структура репозитория

```text
Rok-N-Rolls-BreakfastMenu/
|- backend/
|- frontend/
|- .gitignore
`- README.md
```

## Требования

- PHP >= 8.1
- Composer
- Node.js >= 20.19
- npm
- MySQL (или другой драйвер БД после настройки Laravel)

## Установка

### 1) Клонирование репозитория

```bash
git clone https://github.com/Squ8sh/Rok-N-Rolls-BreakfastMenu.git
cd Rok-N-Rolls-BreakfastMenu
```

### 2) Настройка бэкенда (Laravel)

```bash
cd backend
composer install
```

Создай `.env` из шаблона:

Linux/macOS:
```bash
cp .env.example .env
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Сгенерируй ключ приложения и выполни миграции:

```bash
php artisan key:generate
php artisan migrate
```

Установи зависимости Vite для бэкенда:

```bash
npm install
```

### 3) Настройка фронтенда (React)

```bash
cd ../frontend
npm install
```

## Запуск в разработке

Используй 2-3 терминала.

### Терминал 1: Laravel бэкенд

```bash
cd backend
php artisan serve
```

URL по умолчанию: `http://127.0.0.1:8000`

### Терминал 2: Vite бэкенд (опционально, для Blade-ассетов Laravel)

```bash
cd backend
npm run dev
```

### Терминал 3: React фронтенд

```bash
cd frontend
npm run dev
```

Если порт `5173` занят, запусти фронтенд на другом порту:

```bash
npm run dev -- --port 5174
```

## Связка Фронтенд <-> Бэкенд

Фронтенд настроен на вызовы Laravel API через Vite proxy:

- запросы фронтенда: `/api/*`
- прокси-цель: `VITE_BACKEND_URL` (по умолчанию `http://127.0.0.1:8000`)

Настрой переменные фронтенда:

Linux/macOS:

```bash
cd frontend
cp .env.example .env.local
```

Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env.local
```

Если бэкенд работает на другом хосте/порте, измени `VITE_BACKEND_URL` в `frontend/.env.local`.

## API маршруты

- `GET /api/health` - проверка API
- `POST /api/auth/register` - регистрация и получение токена
- `POST /api/auth/login` - вход и получение токена
- `GET /api/auth/me` - текущий пользователь (нужен токен Bearer)
- `POST /api/auth/logout` - выход (нужен токен Bearer)
- `GET /api/user` - стандартный Sanctum маршрут (нужен токен Bearer)

## Важные переменные бэкенда

Минимум для локального запуска (`backend/.env`):

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

После изменения `.env` можно очистить кеш конфигурации:

```bash
php artisan config:clear
```

## Проверки

Тесты бэкенда:

```bash
cd backend
php artisan test
```

Проверка lint фронтенда:

```bash
cd frontend
npm run lint
```
