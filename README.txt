# Simplify

An AI task-breakdown and rewards app for neurodivergent K–12 students — built for the **IncludAI Neurodiversity Hackathon** (Track 1: AI for Learners Who Think Differently).

Simplify takes an overwhelming school task — an essay, a worksheet, studying for a test, a group project — and uses AI to break it into small, concrete, manageable steps. Completing steps earns points students can spend on a personal, self-defined reward menu, encouraging a healthy, non-punishing form of motivation instead of generic gamification or one-size-fits-all sticker charts.

## Why

Most classroom and productivity tools assume a "typical" student. Simplify starts from a different question: what does actually *starting* and *following through* on schoolwork look like for a student with ADHD, autism, or other executive-function differences — and builds around that, instead of adapting the student to the tool.

## Features

- **AI task breakdown** — a student describes any assignment (e.g. "write a 5-paragraph essay on the water cycle," "study for tomorrow's quiz"); Gemini splits it into 3–7 small, ordered steps, each with an AI-assigned point value. The first step gets a slight point bump, since starting is often the hardest part for students with executive-function challenges.
- **Split further** — if a step still feels too big, a student can split it into 2–4 smaller pieces. A step can only be split once, and points from a split are redistributed from the original step's value rather than inflating the total.
- **Personal reward menu** — students define their own rewards and point costs (a real token economy, not a fixed shop). AI can suggest a fair point cost for a new reward based on the student's own earning history.
- **Task timer** — an optional start/pause/stop timer per assignment, which stops automatically once every step is completed.
- **Similar-task matching** — opt-in visibility lets students find classmates working on similar assignments (matched by shared keywords in the task title — e.g. two students both tackling "water cycle," one writing an essay, one studying for a quiz) and open a lightweight study-buddy chat that closes automatically after 60 minutes of inactivity.
- **Calm, low-sensory design** — muted color palette, generous spacing, large tap targets, no streaks, no urgency-driven UI, and no punishing mechanics for missed days.

Simplify's step-breakdown and reward engine aren't limited to schoolwork under the hood — the same logic works for any task a student wants to tackle, in or out of the classroom.

## Tech stack

- **Backend:** Django + Django REST Framework, JWT auth (`djangorestframework-simplejwt`), PostgreSQL (via [Neon](https://neon.tech))
- **AI:** Google Gemini (`gemini-2.5-flash`) for task breakdown and reward point suggestions
- **Frontend:** React + TypeScript (Vite), Tailwind CSS v4, React Router
- **Deployment:** Backend on [Render](https://render.com), frontend on [Vercel](https://vercel.com)

## Live app

- Frontend: _add your Vercel production URL here_
- Backend API: `https://includeai.onrender.com`

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` file in the same directory as `manage.py`:

```
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

Then:

```bash
python manage.py migrate
python manage.py runserver
```

By default this uses `config.settings.development` (SQLite, `DEBUG=True`). Production settings (`config.settings.production`) expect `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` for a Postgres connection.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```
VITE_API_URL=http://localhost:8000
```

Then:

```bash
npm run dev
```

## Project structure

```
backend/
  config/          # Django project settings, root urls
  account/         # registration, JWT auth, user profile / matching preference
  tasks/           # Task, Subtask models — AI breakdown, splitting, timer
  reward/          # RewardItem, PointTransaction — token economy, redemption
  matching/        # similar-task matching, chat sessions and messages

frontend/
  src/
    components/    # feature-organized: tasks/, rewards/, matching/, layout/
    pages/         # one file per screen, routed in App.tsx
    api.ts         # all backend calls in one place
    types.ts       # shared TypeScript types
```

## Designed with neurodivergent students

Every core interaction — task breakdown granularity, the "starting is hardest" point bonus, the self-defined reward system, and the calm visual language — was shaped around feedback from testing with a neurodivergent user, per the hackathon's "designed WITH, not just FOR" requirement.

## Team

_Add your name(s) / chapter info here._