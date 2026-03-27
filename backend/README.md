# Бэкенд (Laravel)

Бэкенд-часть проекта Rok-N-Rolls на Laravel.

## Быстрый старт

1. Установи зависимости:
```bash
composer install
```
2. Создай `.env` из `.env.example`, затем сгенерируй ключ:
```bash
php artisan key:generate
```
3. Выполни миграции:
```bash
php artisan migrate
```
4. Запусти сервер:
```bash
php artisan serve
```

## API маршруты авторизации

- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход пользователя
- `GET /api/auth/me` - получить текущего пользователя (токен Bearer)
- `POST /api/auth/logout` - выход (токен Bearer)
- `GET /api/health` - проверка доступности API

Подробная документация по общему запуску проекта находится в корневом `README.md`.
