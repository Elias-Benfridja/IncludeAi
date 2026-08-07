# FocusFlow

A task-breakdown and rewards app for neurodivergent learners — built for the **IncludAI Neurodiversity Hackathon** (Track 1: AI for Learners Who Think Differently).

FocusFlow takes an overwhelming task — schoolwork, chores, anything — and uses AI to break it into small, concrete, manageable steps. Completing steps earns points that can be spent on a personal, self-defined reward menu, encouraging a healthy, non-punishing form of motivation rather than generic gamification.

## Why

Most productivity tools assume a "normal" user. FocusFlow starts from a different question: what does task initiation and follow-through actually look like for someone with ADHD, autism, or other executive-function differences — and builds around that, not around a neurotypical default.

## Features

- **AI task breakdown** — describe any task; Gemini splits it into 3–7 small, ordered steps, each with an AI-assigned point value. The first step gets a slight point bump, since starting is often the hardest part.
- **Split further** — if a step still feels too big, split it into 2–4 smaller pieces. A step can only be split once, and the points from a split are redistributed from the original step's value rather than adding new points to the system.
- **Personal reward menu** — users define their own rewards and point costs (a real token economy, not a fixed shop). AI can suggest a fair point cost for a new reward based on the user's own earning history.
- **Task timer** — an optional start/pause/stop timer per task, which stops automatically once every step is completed.
- **Similar-task matching** — opt-in visibility lets users find others working on similar tasks (matched by shared keywords in the task title) and open a lightweight chat that closes automatically after 60 minutes of inactivity.
- **Calm, low-sensory design** — muted color palette, generous spacing, large tap targets, no streaks, no urgency-driven UI, and no punishing mechanics for missed days.

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

## Designed with neurodivergent users

Every core interaction — task breakdown granularity, the "starting is hardest" point bonus, the self-defined reward system, and the calm visual language — was shaped around feedback from testing with a neurodivergent user, per the hackathon's "designed WITH, not just FOR" requirement.

## Team

_Add your name(s) / chapter info here._