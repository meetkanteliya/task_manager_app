# Task Manager

A modern, client-side task management application built with Next.js and React. Create, organize, and track your to-dos in the browser—with tasks persisted automatically via `localStorage`.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## Features

- **Add tasks** — Enter a title in the text area and click **Add** (empty input is ignored).
- **Complete / reopen** — Toggle completion with a checkbox; completed tasks show a strikethrough style.
- **Edit tasks** — Inline editing with **Edit** and **Save** for quick title updates.
- **Delete tasks** — Remove individual tasks with one click.
- **Filter views** — Switch between **All**, **Completed**, and **Pending** to focus on what matters.
- **Task counter** — See how many tasks match the current filter out of your total list.
- **Persistent storage** — Tasks are saved to `localStorage` and restored when you return.
- **Responsive UI** — Mobile-friendly layout with a clean card design, gradients, and smooth transitions.
- **Empty state** — Helpful message when no tasks match the current filter.

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Framework    | [Next.js](https://nextjs.org/) 16   |
| UI Library   | [React](https://react.dev/) 19      |
| Language     | [TypeScript](https://www.typescriptlang.org/) |
| Styling      | [Tailwind CSS](https://tailwindcss.com/) 4  |
| Persistence  | Browser `localStorage`              |

## Project Structure

```
todo_application/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout and fonts
│   │   ├── page.tsx        # Main page: state, filters, persistence
│   │   └── globals.css     # Global styles and Tailwind imports
│   ├── components/
│   │   ├── TaskForm.tsx    # Task input and add button
│   │   └── TaskList.tsx    # Task list with edit, toggle, delete
│   ├── types/
│   │   └── task.ts         # Task type definition
│   └── utils/
│       └── localStorage.ts # Task load/save helpers
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later (20+ recommended)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository (replace with your repo URL)
git clone <repository-url>
cd todo_application

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the app.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Usage

1. Type a task in the input field and click **Add**.
2. Check the box next to a task to mark it complete or pending.
3. Use **Edit** / **Save** to change a task title.
4. Click **Delete** to remove a task.
5. Use **All**, **Completed**, or **Pending** to filter the list.

Tasks are stored under the `tasks` key in `localStorage` and sync automatically whenever the list changes.

## Data Model

Each task is represented as:

```ts
type Task = {
  id: number;       // Unique ID (timestamp-based)
  title: string;    // Task description
  completed: boolean;
};
```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Start development server       |
| `npm run build`| Create optimized production build |
| `npm start`    | Run production server          |
| `npm run lint` | Run ESLint                     |

## License

This project is private and intended for personal or educational use unless otherwise specified.
