# 🧩 PuzzleDay – Daily Puzzle Logic Game
## Bluestock Fintech Capstone Project

---

## 🚀 QUICK START (Windows)

### Terminal 1 – Backend
```cmd
cd backend
npm install
copy .env.example .env
npm run dev
```

### Terminal 2 – Frontend
```cmd
cd frontend
npm install
copy .env.example .env
npm run dev
```

### Open browser: http://localhost:5173

---

## 🗃️ Database Setup (Optional - works without it)
Get free DB at https://neon.tech then:
```cmd
cd backend
:: Edit .env → set DATABASE_URL
npx prisma migrate dev --name init
npx prisma generate
```

---

## 🛠 Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- Storage: IndexedDB (idb)
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL

## 📁 Structure
```
daily-puzzle-game/
├── frontend/
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # React hooks
│       ├── lib/          # Core logic
│       └── test/         # Tests
└── backend/
    ├── prisma/           # DB schema
    └── src/
        ├── routes/       # API endpoints
        └── middleware/   # Auth middleware
```
