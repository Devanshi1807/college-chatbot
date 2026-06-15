# BIET Fresher Chatbot

A chatbot for BIET fresher students to get information about college admission, documents, fees, hostel, and campus — with an admin panel to add, edit, and delete content from the database.

## What's built

- **Chat UI** — Students ask questions, get answers from the FAQ database
- **Admin Panel** — Staff can CRUD FAQs, categories, contacts, and important dates
- **Node.js Backend** — Express API with JWT auth
- **SQLite Database** — Prisma ORM (easy to switch to PostgreSQL later)

## Quick start

### 1. Backend

```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```

Backend runs at **http://localhost:5000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Admin login (default)

- **Email:** admin@biet.ac.in
- **Password:** admin123

Change this password before deploying to production.

## Project structure

```
bietbot/
├── backend/          # Node.js + Express + Prisma
│   ├── prisma/       # Database schema & seed
│   └── src/          # API routes & controllers
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Chat, Admin, Login
        └── api.js    # API client
```

## API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/chat | No | Send a message |
| GET | /api/faqs | No | List FAQs |
| POST | /api/faqs | Yes | Create FAQ |
| PUT | /api/faqs/:id | Yes | Update FAQ |
| DELETE | /api/faqs/:id | Yes | Delete FAQ |
| POST | /api/auth/login | No | Admin login |

## Switch to PostgreSQL (production)

1. Change `provider` in `backend/prisma/schema.prisma` from `sqlite` to `postgresql`
2. Set `DATABASE_URL=postgresql://user:pass@host:5432/bietbot` in `.env`
3. Run `npm run db:push && npm run db:seed`
