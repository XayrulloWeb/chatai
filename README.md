# AI Qo'llanma MVP

Sun'iy intellektdan to'g'ri, xavfsiz va samarali foydalanish bo'yicha ta'limiy platforma.

## Deploy qo'llanma

To'liq Netlify + backend (Render) instruksiya:
- [`DEPLOY.md`](./DEPLOY.md)

## Ishga tushirish

```bash
npm install
npm run dev
```

## Backend (Auth)

Oddiy auth backend qo'shildi. U quyidagilarni beradi:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/chat/messages`
- `PUT /api/chat/messages`

Ishga tushirish:

```bash
npm run server
```

Server default `http://localhost:4000` da ishlaydi.
Frontend auth API default `VITE_AUTH_API_URL=http://localhost:4000` dan foydalanadi.

### PostgreSQL ishlatish

`DATABASE_URL` berilsa backend avtomatik PostgreSQL ga o'tadi va kerakli jadvallarni o'zi yaratadi:
- `users`
- `chat_messages`

Misol:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_qollanma
DATABASE_SSL=false
DATABASE_AUTO_CREATE=true
MIGRATE_FILE_DATA=true
```

`DATABASE_URL` bo'lmasa backend avtomatik fayl (`backend/data/*.json`) rejimida ishlaydi.
`MIGRATE_FILE_DATA=true` bo'lsa (default), eski `users.json` va `chat-messages.json` dagi ma'lumotlar Postgres ga ko'chiriladi.

### Misol so'rovlar

Ro'yxatdan o'tish:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ali\",\"email\":\"ali@mail.com\",\"password\":\"123456\"}"
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ali@mail.com\",\"password\":\"123456\"}"
```

## Build

```bash
npm run build
npm run preview
```

## Muhit o'zgaruvchilari (ixtiyoriy)

Demo chatbot default holatda ishlaydi. Keyinroq real API ulash uchun `.env` faylda:

```bash
VITE_AI_PROVIDER=demo
VITE_AUTH_API_URL=http://localhost:4000
# yoki: gemini / openai

VITE_GEMINI_API_KEY=...
VITE_OPENAI_API_KEY=...
VITE_OPENAI_MODEL=gpt-4o-mini
```

Backend uchun ixtiyoriy `.env` (yoki terminal env):

```bash
AUTH_PORT=4000
AUTH_TOKEN_SECRET=change-this-secret
AUTH_TOKEN_TTL_SECONDS=604800
AUTH_CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ai_qollanma
DATABASE_SSL=false
DATABASE_AUTO_CREATE=true
MIGRATE_FILE_DATA=true
```

Eslatma: backend `./.env` yoki `./backend/.env` fayllarni avtomatik o'qiydi.
