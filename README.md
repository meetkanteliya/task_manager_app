# TaskFlow

A professional, full-stack task management and productivity workspace built with Next.js App Router, Prisma, and PostgreSQL.

## Tech Stack

*   **Framework:** Next.js (v16.2.6, App Router)
*   **Library:** React (v19.2.4)
*   **Language:** TypeScript (v5)
*   **Styling:** Tailwind CSS (v4)
*   **Database ORM:** Prisma (v7.8.0)
*   **Database:** PostgreSQL
*   **Authentication:** NextAuth.js (v4.24.14 with JWT & Credentials Provider)
*   **Data Validation:** Zod (v4.4.3)
*   **Toast Notifications:** Sonner (v2.0.7)

---

## Features

*   **Secure Authentication & Route Protection:**
    *   Credentials-based user registration and login with safe password hashing via `bcryptjs`.
    *   Next.js route middleware protection via [middleware.ts](file:///c:/Users/om/Desktop/todo_application/src/middleware.ts) protecting the dashboard, task, and setting panels from unauthorized access.
*   **Advanced Task & Subtask Management:**
    *   Create, view, update, and delete tasks with priorities (`low`, `medium`, `high`), description, and optional due dates.
    *   Nested checklist subtasks support with transactional database creation.
    *   *Auto-completion sync:* Completing all subtasks automatically resolves the parent task. Conversely, adding a new subtask or reopening an existing checklist item transitions the parent task back to a pending state.
*   **Aggregated Analytics Dashboard:**
    *   Real-time overview analytics counting total, pending, completed, weekly completed, monthly completed, high priority pending, and overdue tasks.
    *   Interactive completion rate progress indicator using SVG radial displays.
*   **Persistent Activity logs:**
    *   Chronological audit log tracking application-wide events like task creation, updates, toggles, deletions, and checklist changes.
    *   Real-time Activity Timeline viewable inside the dashboard.
*   **Settings Panel & Purge Commands:**
    *   Safe interactive triggers to purge all activities or wipe the entire task database using secure server action transactions.
*   **Modern Responsive UX:**
    *   Custom dark/light mode toggling utilizing `next-themes`.
    *   Inline modal-based detail views with auto-save functionality.
    *   Consistent toast notifications for all backend mutations.

---

## Project Structure

```
todo_application/
├── prisma/
│   ├── migrations/          # Database schema migrations
│   └── schema.prisma        # Database schema definitions (User, Task, Subtask, Activity)
├── src/
│   ├── app/
│   │   ├── (main)/          # Authenticated routes
│   │   │   ├── dashboard/   # Dashboard page with statistics & activity log
│   │   │   ├── settings/    # Account deletion & clear actions
│   │   │   ├── tasks/       # Task manager board & detail modals
│   │   │   ├── error.tsx    # App shell error boundary
│   │   │   └── layout.tsx   # Sidebar app navigation layout
│   │   ├── api/
│   │   │   └── auth/        # NextAuth API route setup
│   │   ├── globals.css      # Core Tailwind CSS imports & theme configurations
│   │   ├── layout.tsx       # Root document layout with providers (Theme, Auth, Toast)
│   │   └── page.tsx         # Welcome screen, signup, and login forms
│   ├── components/
│   │   ├── dashboard/       # ActivityTimeline, OverviewCards, StatsCard, RecentTask
│   │   ├── tasks/           # TaskCard, TaskFilter, TaskForm
│   │   ├── ui/              # Interactive primitives (dialog, dropdown, tooltip, select)
│   │   ├── app-header.tsx   # Top layout bar with user menu
│   │   ├── app-shell.tsx    # Main interface structure handler
│   │   └── app-sidebar.tsx  # Sidebar navigation components
│   ├── hooks/
│   │   ├── useDebounce.ts   # Event callback debouncing
│   │   ├── useSidebarState.ts# Sidebar open/close controls
│   │   └── useTasks.ts      # Custom task state management using Next.js Server Actions
│   ├── lib/
│   │   ├── actions/         # Server-side operations (auth, tasks, stats, activities)
│   │   ├── validations/     # Zod input validation schemas (auth.ts, task.ts)
│   │   ├── auth.ts          # NextAuth callbacks & credentials provider logic
│   │   ├── db.ts            # Prisma client adapter setup
│   │   └── session.ts       # Server session helper utilities
│   ├── middleware.ts        # NextAuth route protection middleware
│   └── types/               # TypeScript declarations & interfaces
```

---

## Getting Started

Follow these steps to run TaskFlow locally.

### Prerequisites

*   [Node.js](https://nodejs.org/) v18.18 or later
*   Running [PostgreSQL](https://www.postgresql.org/) database instance

### 1. Install Dependencies

Clone the repository and install all required packages:

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory and define the required variables (see the table below):

```bash
# Example .env configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow_db"
NEXTAUTH_SECRET="your-32-character-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Prisma Migrations

Sync the database schema with your local PostgreSQL database:

```bash
npx prisma migrate dev
```

This will run outstanding migrations and generate the Prisma client interface target inside `src/generated/prisma`.

### 4. Run the Development Server

Start the local server with hot reloading enabled:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) inside your web browser to explore the dashboard.

---

## Environment Variables

The application relies on the following configurations:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string including credentials, host, and database name. | `postgresql://postgres:password@localhost:5432/taskflow_db` |
| `NEXTAUTH_SECRET` | A secure, random token used to sign NextAuth tokens and session cookies. | `f39b6e3f22c549618c7e9dbab17cbe3d3170701c40212abecfdf...` |
| `NEXTAUTH_URL` | The base URL of the site, used to resolve redirection logic during login. | `http://localhost:3000` |

---

## Screenshots

*Screenshots illustrating the TaskFlow workspace interface will be placed here.*

| Dashboard Page | Tasks Board |
| :---: | :---: |
| *[Screenshot Placeholder]* | *[Screenshot Placeholder]* |
