# 📚 College Notes & PYQ Platform

A full-stack platform where college students can browse study materials, take AI-generated quizzes, and track their performance.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + Vite, Tailwind CSS 3 + DaisyUI 5, Redux Toolkit, react-router-dom 6, react-hot-toast, react-icons (Feather) |
| **Backend** | Node.js + Express 4, Mongoose 8, JWT (httpOnly cookies), bcryptjs, Nodemailer, Multer |
| **AI** | Groq SDK (Llama 3.3-70b-versatile) — quiz generation, subjective evaluation, summary, topics, Q&A |
| **Database** | MongoDB Atlas |
| **Auth** | Email/password + Google OAuth |
| **File Parsing** | pdf-parse, mammoth (DOCX), tesseract.js (OCR for scanned PDFs) |

---

## Features

### Authentication & Users
- Email/password registration with bcrypt hashing
- Email verification via Nodemailer (verification token link)
- Google OAuth one-click sign-in/sign-up
- JWT stored in httpOnly cookie + Bearer header fallback
- Profile setup wizard for new users (college selection)
- Inline name editing, avatar upload (images, max 5MB)
- Role-based access: `student` / `admin`

### Academic Hierarchy Browsing
- **Colleges** — list with type filters (IIT/NIT/IIIT/Other) and search
- **Branches** — per college (6 defaults: CSE, IT, ECE, EE, ME, CE)
- **Semesters** — per branch (8 semesters, years 1–4)
- **Subjects** — per semester with search
- Breadcrumb navigation throughout

### Resource Management (Notes & PYQs)
- Upload PDF/DOCX files (max 20MB) via Multer
- Resource types: `notes` and `pyq` (Previous Year Questions)
- View counter, download counter, like/unlike toggle, save/bookmark toggle
- Full-screen PDF preview with embedded viewer
- Search by title
- Delete own resources (admin can delete any)

### AI-Powered Quiz System
- **On-demand Quiz Generation** — AI (Groq/Llama 3.3) generates mixed MCQ + subjective questions from all PYQs of a subject
- **Resource-based Quiz** — take quizzes on existing questions attached to a resource
- **Configurable** — difficulty (easy/medium/hard), question count (5–30)
- **Quiz Timer** — 10-minute countdown with warning pulse under 60s
- **Question Navigation** — numbered indicators showing answered/current/unanswered
- **AI Subjective Evaluation** — Groq scores subjective answers 0–100 with feedback; falls back to Jaccard similarity if API is down
- **Grade Calculation** — A+ (≥90%), A (≥75%), B (≥60%), C (≥40%), F (<40%)
- **Detailed Review** — per-question breakdown: correct answer, your answer, marks awarded, AI feedback, explanation
- **Attempt History** — revisit past attempts with full review

### AI Study Assistant
Sliding sidebar on the preview page:
- **Extract Text** — parse PDF/DOCX text (one-time, cached)
- **Generate Summary** — AI condenses key concepts, formulas, takeaways
- **Extract Topics** — AI identifies 5–10 key topics with importance indicators
- **Ask AI** — Q&A about the study material (3-tier answering: from PDF, from PDF + model knowledge, from model knowledge)
- **Quiz Time** — one-click navigation to the subject quiz page

### Gamification & Leaderboard
- **Rating System** — 0–5 stars (Bronze → Diamond) based on accuracy × quiz count
- **Global Leaderboard** — top 50 users sorted by total score → average accuracy → quiz count
- **Profile Stats** — quizzes taken, total score (float with subjective partial marks), questions answered, average accuracy

### Admin Panel
Protected by `adminOnly` middleware:
- CRUD for colleges, branches, semesters, and subjects
- **Quiz Migration Tool** — batch re-evaluates subjective answers in historical attempts, recalculates all user stats and leaderboard
- Cascading deletes (removing a branch removes its semesters, subjects, resources, and questions)

### Seeder
- 79 Indian engineering colleges (23 IITs + 31 NITs + 25 IIITs)
- 5 branches, 8 semesters per college
- Full subject data for IIT Bombay + common first-year subjects for all colleges
- Demo accounts: `admin@cheatsheet.com` / `admin123` and `student@cheatsheet.com` / `student123`

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)
- Groq API key (free at console.groq.com)
- Gmail App Password (for email verification)

### Installation

```bash
# Clone
git clone <repo-url>
cd cheat-sheet

# Backend
cd backend
npm install
cp .env.example .env   # fill in your env vars
npm run seed            # seed 79 colleges + demo users
npm run dev             # http://localhost:5000

# Frontend
cd ../frontend
npm install
npm run dev             # http://localhost:5173
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `GROQ_API_KEY` | Groq API key for AI features |
| `SMTP_HOST` | SMTP host (default `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (default `587`) |
| `SMTP_USER` | Gmail address for sending verification emails |
| `SMTP_PASS` | Gmail App Password |
| `FROM_EMAIL` | Sender email address |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLIENT_URL` | Frontend URL (default `http://localhost:5173`) |
| `NODE_ENV` | `development` or `production` |

---

## Project Structure

```
backend/
├── config/db.js              # MongoDB connection
├── controllers/              # Route handlers
│   ├── authController.js
│   ├── collegeController.js
│   ├── branchController.js
│   ├── semesterController.js
│   ├── subjectController.js
│   ├── resourceController.js
│   ├── quizController.js
│   └── assistantController.js
├── middleware/
│   └── authMiddleware.js     # protect + adminOnly
├── models/                   # Mongoose schemas
│   ├── User.js
│   ├── College.js
│   ├── Branch.js
│   ├── Semester.js
│   ├── Subject.js
│   ├── Resource.js
│   ├── Question.js
│   └── QuizAttempt.js
├── routes/                   # Express routers
├── utils/
│   ├── aiQuizGenerator.js    # Groq quiz generation
│   ├── aiEvaluator.js        # Groq subjective scoring
│   ├── aiAssistant.js        # Groq summary/topics/Q&A
│   ├── fileParser.js         # PDF/DOCX/OCR parsing
│   ├── sendEmail.js          # Nodemailer
│   └── generateToken.js      # JWT helpers
├── uploads/                  # File storage
├── seeder.js                 # Database seeder
└── server.js

frontend/
├── src/
│   ├── components/           # Reusable UI (Navbar, PageHero, ResourceCard, QuizCard, AiSidebar, Timer, RatingBadge, ProtectedRoute, AdminRoute)
│   ├── pages/                # Route pages (24 pages)
│   │   ├── admin/            # Admin CRUD pages (5)
│   │   └── quiz/             # Quiz flow pages (4)
│   ├── redux/                # Redux Toolkit slices (auth + quiz)
│   ├── services/             # Axios API wrappers
│   └── styles/               # index.css (Tailwind + custom classes)
└── ...
```

---

## API Overview

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/users/register` | Public |
| GET | `/api/users/verify/:token` | Public |
| POST | `/api/users/login` | Public |
| POST | `/api/users/google` | Public |
| POST | `/api/users/logout` | Auth |
| GET | `/api/users/me` | Auth |
| PUT | `/api/users/profile` | Auth |
| PUT | `/api/users/quiz-stats` | Auth |

### Colleges / Branches / Semesters / Subjects
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/colleges` | Public |
| POST | `/api/colleges` | Admin |
| GET | `/api/branches?college=` | Public |
| POST | `/api/branches` | Auth |
| GET | `/api/semesters?branch=` | Public |
| POST | `/api/semesters` | Auth |
| GET | `/api/subjects?semester=` | Public |
| POST | `/api/subjects` | Auth |

Full CRUD (GET by id, PUT, DELETE) available for each. Admin-only for destructive operations.

### Resources
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/resources?subject=&type=` | Public |
| GET | `/api/resources/user/bookmarks` | Auth |
| POST | `/api/resources` | Auth |
| PUT | `/api/resources/:id/view` | Auth |
| PUT | `/api/resources/:id/download` | Auth |
| PUT | `/api/resources/:id/like` | Auth |
| PUT | `/api/resources/:id/save` | Auth |
| DELETE | `/api/resources/:id` | Auth |
| POST | `/api/upload` | Auth |
| POST | `/api/upload/avatar` | Auth |

### Quizzes
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/quizzes/questions?resource=` | Public |
| POST | `/api/quizzes/questions` | Admin |
| POST | `/api/quizzes/generate` | Auth |
| POST | `/api/quizzes/generate-subject` | Auth |
| POST | `/api/quizzes/submit` | Auth |
| POST | `/api/quizzes/migrate` | Admin |
| GET | `/api/quizzes/attempts` | Auth |
| GET | `/api/quizzes/attempts/:id` | Auth |
| GET | `/api/quizzes/leaderboard` | Public |

### AI Assistant
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/assistant/:id/extract-text` | Auth |
| GET | `/api/assistant/:id/summary` | Auth |
| GET | `/api/assistant/:id/topics` | Auth |
| POST | `/api/assistant/:id/ask` | Auth |

---

## Quiz Flow

```
Select Branch → Select Semester → Select Subject
                                    ↓
                      Configure: Difficulty + Question Count
                                    ↓
                         AI Generates Quiz (MCQ + Subjective)
                                    ↓
                         Take Quiz (Timer: 10 min)
                                    ↓
                         Submit → AI Evaluates Subjective Answers
                                    ↓
                    Result: Grade, Breakdown, Answer Review, AI Feedback
                                    ↓
                    Stats Updated → Leaderboard Recalculated
```

---

## Deployment

| Service | Used For |
|---------|----------|
| **Render** | Backend API |
| **Vercel** | Frontend SPA |
| **MongoDB Atlas** | Database |
| **Gmail SMTP** | Verification emails |
| **Groq Cloud** | AI inference |

---

## License

MIT
