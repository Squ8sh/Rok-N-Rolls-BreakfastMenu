# Фронтенд (React + Vite)

Приложение фронтенда для проекта Rok-N-Rolls.

## Команды

- `npm run dev` - запуск сервера разработки
- `npm run build` - production-сборка
- `npm run lint` - проверка ESLint
- `npm run preview` - локальный просмотр production-сборки

## Переменные окружения

Создай файл `.env.local` по примеру `.env.example`:

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_API_BASE_URL=/api
```

`VITE_BACKEND_URL` используется в `vite.config.js` как цель прокси для запросов `/api/*`.
