# Students Time Management Application Documentation

## Overview
A full-featured MERN stack (MongoDB, Express, React, Node.js) time management app for students, featuring authentication, task management, Pomodoro timer, calendar, summaries, notifications, and a modern responsive UI.

---

## Technologies & Libraries Used

### Backend (be/)
- **Node.js 22**: JavaScript runtime for server-side logic.
- **TypeScript**: Type safety and better developer experience.
- **Express**: Web framework for RESTful APIs.
- **Prisma**: Type-safe ORM for MongoDB.
- **MongoDB**: NoSQL database for storing users and tasks.
- **Passport.js**: Authentication middleware.
- **passport-jwt**: JWT strategy for stateless authentication.
- **bcrypt**: Password hashing for security.
- **jsonwebtoken**: JWT creation and verification.
- **body-parser, cors**: Middleware for JSON parsing and CORS support.
- **nodemon, ts-node**: Dev tools for live reload and TypeScript execution.

### Frontend (fe/)
- **React 19**: UI library for building interactive interfaces.
- **TypeScript**: Type safety and better developer experience.
- **Vite**: Fast build tool and dev server.
- **Zustand**: State management for auth and tasks.
- **Ant Design (AntD)**: UI component library for forms, layout, modals, etc.
- **TailwindCSS**: Utility-first CSS for rapid, responsive design.
- **React Router v7**: Routing and protected routes.
- **Axios**: HTTP client for API requests.
- **React-Quill**: Rich text editor for task notes.
- **Recharts**: Data visualization for progress charts.

---

## Features

### Authentication & User Management
- JWT-based authentication (register, login, logout)
- Password hashing (bcrypt)
- Protected API routes (Passport.js)
- User profile page (edit name, email, password)

### Task Management
- Full CRUD for tasks (create, read, update, delete)
- Task prioritization (High, Medium, Low)
- Task categorization (Study, Personal, Work, Other)
- Rich text notes for each task (React-Quill)
- Due date and completion status
- Filtering by priority and category
- Responsive Ant Design cards and modals for task input

### Productivity & Visualization
- Pomodoro timer (floating widget, linked to tasks)
- Pomodoro session logging (backend + frontend)
- Daily/weekly summary and progress charts (Recharts)
- Calendar view of tasks (Ant Design Calendar)
- Browser notifications for Pomodoro and task reminders

### UI/UX
- Responsive layout (TailwindCSS + Ant Design)
- Modern navigation (header, sidebar, protected routes)
- Clean, accessible forms and feedback (AntD)
- Mobile-friendly design

---

## Application Pages

### Landing Page
- App introduction, features, and CTA buttons for login/signup.

### Auth Pages
- **Login**: AntD form, Zustand state, JWT login.
- **Signup**: AntD form, auto-login after registration.

### Dashboard
- Task list (CRUD, filter, edit, delete)
- Task creation modal (AntD + React-Quill)
- Filtering by priority/category
- Calendar view (AntD Calendar)
- Daily/weekly summary cards and charts (Recharts)
- Pomodoro timer widget (floating, linked to tasks)

### Profile
- Edit name, email, password
- View daily/weekly progress charts

### Pomodoro Widget
- Floating button, modal timer
- Linked to selected task
- Logs sessions to backend
- Sends browser notifications for session/break

### NotFound
- 404 fallback for undefined routes

---

## API Endpoints (Backend)
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/user/profile` — Get user profile
- `PUT /api/user/profile` — Update user profile
- `GET /api/tasks` — List all user tasks
- `POST /api/tasks` — Create new task
- `GET /api/tasks/:id` — Get single task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task
- `POST /api/tasks/:id/pomodoro` — Log Pomodoro session
- `GET /api/tasks/summary?range=daily|weekly` — Get daily/weekly summary

---

## Impact of Technologies & Libraries
- **Prisma**: Type-safe, easy-to-maintain database access, rapid schema changes.
- **Passport.js/JWT**: Secure, stateless authentication for modern SPAs.
- **Ant Design**: Rapid UI development, consistent look, accessible components.
- **TailwindCSS**: Fast, responsive, and maintainable styling.
- **Zustand**: Simple, scalable state management for auth/tasks.
- **Recharts**: Easy, beautiful data visualization.
- **React-Quill**: Rich text editing for enhanced task notes.
- **React Router**: Clean navigation and route protection.
- **Axios**: Reliable, promise-based HTTP requests.
- **Browser Notification API**: Real-time reminders and productivity nudges.

---

## How to Run
1. **Backend**
   - Set up your MongoDB connection string in `be/.env` as `DATABASE_URL`.
   - Install dependencies: `cd be && npm install`
   - Generate Prisma client: `npx prisma generate`
   - Push schema: `npx prisma db push`
   - Start dev server: `npm run dev`

2. **Frontend**
   - Install dependencies: `cd fe && npm install`
   - Start dev server: `npm run dev`

---

## Notes
- All features are mobile-friendly and responsive.
- All API endpoints are protected by JWT except for register/login.
- Pomodoro and task reminders require browser notification permission.
- For further customization, see the code comments and modular structure.
