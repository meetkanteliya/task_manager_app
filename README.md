# TaskFlow

TaskFlow is a professional, full-stack project and task management workspace built with Next.js, local PostgreSQL, Prisma ORM, and NextAuth.js.

## Core Features

- **Secure Session Authentication** — User registration and login flow powered by NextAuth.js credentials provider, with custom bcryptjs password encryption and secure route middleware checks.
- **Interactive Dashboard Analytics** — Instant statistics showing total tasks, pending count, and completed count, alongside weekly/monthly task completion totals and symmetrical h-380px grid elements.
- **List & Kanban Board Toggle** — Instantly switch between a structured backlog list and a Kanban Board view displaying Pending and Completed columns.
- **Auto-Saving Popup Details Editor** — Click on any task card to open an overlay editor. Edit fields (title, description, priority, due date) inline, with changes saved automatically to PostgreSQL on clicking outside the modal.
- **Bidirectional Checklist Sync Logic** — Custom database actions matching subtasks with the parent task status. Completing all subtasks completes the task; reopening the task resets all subtasks to pending.
- **Height-Bounded Checklists & Descriptions** — Compact task creation form with a detailed description textarea and nested checklist bounded to a `160px` container with custom scrollbar styling.
- **Chronological Audit logs** — Detailed workspace timeline logs showing creation, edit, completion, subtask actions, and deletion history.
- **Premium UI & Theme toggles** — Sleek responsive glassmorphic cards built with Tailwind CSS v4, supporting Light/Dark theme modes, micro-animations, animated loading skeletons, and custom brand logo tab favicons.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router with Turbopack) |
| **Frontend UI** | [React](https://react.dev/) 19 & [Tailwind CSS](https://tailwindcss.com/) 4 |
| **Database ORM** | [Prisma](https://www.prisma.io/) 7.8.0 |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) v4 |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- Local PostgreSQL instance (e.g. managed via pgAdmin 4)

### Local Configuration

1. Create a `.env` file in the project root:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/taskflow_db"
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

2. Sync the Prisma schema to your PostgreSQL database:
```bash
# Push schema definitions to database
npx prisma db push

# Generate client classes
npx prisma generate
```

3. Install dependencies and start the development server:
```bash
# Install NPM packages
npm install

# Start Next.js hot-reloaded development environment
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Project Structure

```
todo_application/
├── prisma/
│   └── schema.prisma        # Prisma DB models (User, Task, Subtask, Activity)
├── src/
│   ├── app/
│   │   ├── (main)/          # Protected workspace routes (dashboard, tasks, settings)
│   │   ├── api/auth/        # NextAuth API route endpoint
│   │   ├── page.tsx         # Public landing page with auth card
│   │   └── globals.css      # CSS imports and design tokens
│   ├── components/
│   │   ├── common/          # Shared elements (Logo, Loader, Skeletons)
│   │   ├── dashboard/       # OverviewCards, StatsCard, ActivityTimeline
│   │   └── tasks/           # TaskCard, TaskForm, TaskFilter
│   ├── hooks/
│   │   └── useTasks.ts      # Custom context hook connecting Server Actions
│   └── lib/
│       ├── actions/         # Next.js Server Actions (auth, tasks, stats, activities)
│       └── db.ts            # Client singleton wrapper using PrismaPg adapter
```

## Available Scripts

- `npm run dev` — Starts development server.
- `npm run build` — Generates optimized production build.
- `npm run start` — Runs compiled production build.
- `npm run lint` — Checks codebase for code quality.

