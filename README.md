# Digital Q&A Book Application

A decoupled full-stack interactive "Digital Q&A Book" application built with **Express.js**, **PostgreSQL**, **Angular Standalone**, and **Tailwind CSS**.

---

## Architecture

- **Backend** (`/backend`):
  - Node.js & Express.js REST API on port `3000`
  - JWT Authentication with `bcryptjs` and `jsonwebtoken`
  - PostgreSQL connection pool via `pg` with `users`, `chapters`, and `qa_items` tables
  - Automated schema migration & seed script (`schema.sql`, `npm run db:init`)
  - Full CRUD operations on Q&A pairs and chapter querying
  - CORS enabled for `http://localhost:4200`

- **Frontend** (`/frontend`):
  - Angular 21 Standalone Components with modern reactivity (`signal`, `computed`, `effect`)
  - Tailwind CSS with parchment styling, leather book bindings, and deep spine crease effects
  - `ApiService` powered by `HttpClient` pointing to `http://localhost:3000/api/v1`
  - Dynamic **Theme Dropdown Selector** (Antique Parchment, Midnight Scholar, Emerald Codex, Warm Coffee).
  - Dynamic **Font Dropdown Selector** (Merriweather Serif, Inter Sans, Lora Bookish, Playfair Editorial, Fira Code Monospace) that automatically updates the entire application typography in real-time.
  - Interactive Chapter Management: Create, update, and delete chapters directly from the Table of Contents.
  - Two-page spread Digital Book View with expanded dimensions (`max-w-[1440px]`, `min-h-[700px]`).
  - High-contrast pure white Keyboard Controls footer pill (`← Previous Page | Next Page →`).
  - Dedicated "Login First" closed-book cover with 1-click demo accounts and session persistence.

---

## Quick Start

### 1. Backend (`/backend`)
```bash
cd backend
npm install
npm run db:init   # Creates qa_book_db and seeds 3 chapters & 12 Q&A pairs
npm start         # Runs Express server on http://localhost:3000
```

### 2. Frontend (`/frontend`)
```bash
cd frontend
npm install
npm start         # Runs Angular on http://localhost:4200
```

### 3. Demo Credentials
| Role | Email / Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@qabook.com` (`admin`) | `Admin@123` |
| **Reader** | `reader@qabook.com` (`bookworm`) | `Reader@123` |

*(You can also click the quick 1-click demo buttons directly inside the Sign In modal in the UI!)*

### 4. End-to-End Validation
Open [http://localhost:4200](http://localhost:4200) in your web browser.
