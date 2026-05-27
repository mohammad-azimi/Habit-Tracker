# Habit Tracker

Habit Tracker is a full-stack personal productivity web application for tracking daily habits, reviewing progress, analyzing monthly performance, and receiving reminder notifications.

The project includes a modern React frontend, an Express backend, PostgreSQL database support through Prisma, account authentication, cloud sync, PWA support, and backend-powered push notifications.

> This project is publicly visible for portfolio and review purposes only. It is not open-source. See the [License](./LICENSE) file for usage restrictions.

---

## Live Demo

Frontend:

```text
https://mohammad-azimi.github.io/Habit-Tracker/
```

Backend:

```text
Hosted separately on Render
```

---

## Features

### Account System

- User registration and login
- JWT-based authentication
- Profile update support
- Password change
- Account export and import
- Account deletion

### Habit Tracking

- Monthly habit dashboard
- Daily habit completion grid
- Habit creation, update, archive, restore, and delete
- Monthly data synchronization with backend
- Deleted month backup and restore support
- Manual month navigation
- Local and cloud-based data handling

### Analytics

- Monthly progress summary
- Habit completion statistics
- Top habit tracking
- Streak and progress overview
- Yearly overview
- Dashboard preference controls

### Notes and Review

- Monthly notes
- Reflection and review sections
- Mood and motivation tracking

### Reminders and Notifications

- Today Focus reminder card
- Reminder on/off control
- Reminder time settings
- Browser notification permission support
- Backend push notification subscription
- Backend test notification
- Scheduled reminder notifications
- Reminder activity logs
- Reminder status overview
- Clear reminder activity logs

### PWA Support

- Web app manifest
- Service worker
- Install app card
- Mobile add-to-home-screen support
- PWA icons

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- Recharts
- GitHub Pages deployment

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT authentication
- bcryptjs
- web-push
- node-cron
- Render deployment

---

## Project Structure

```text
Habit Tracker
├── .github
│   └── workflows
├── public
│   ├── habit-tracker.webmanifest
│   ├── icon-192.png
│   ├── icon-512.png
│   └── sw.js
├── server
│   ├── prisma
│   │   └── schema.prisma
│   └── src
│       ├── jobs
│       ├── lib
│       ├── middleware
│       ├── routes
│       └── index.js
├── src
│   ├── components
│   ├── data
│   ├── lib
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── LICENSE
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/mohammad-azimi/Habit-Tracker.git
cd Habit-Tracker
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure backend environment variables

Create this file:

```text
server/.env
```

Example:

```env
DATABASE_URL="your-postgresql-database-url"
PORT=4000
CLIENT_URL=http://localhost:5173
PRODUCTION_CLIENT_URL=http://localhost:4173
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"
ENABLE_REMINDER_SCHEDULER=true
```

Never commit real `.env` files to GitHub.

### 5. Run Prisma migrations

Inside the `server` folder:

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start the backend

```bash
cd server
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

### 7. Start the frontend

In the root project folder:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173/Habit-Tracker/
```

---

## Testing Production Build Locally

For local production preview:

```bash
npm run build
npm run preview
```

For local preview, use:

```env
VITE_API_BASE_URL=/api
```

The Vite preview proxy forwards `/api` requests to the local backend.

---

## Deployment Notes

### Frontend

The frontend is deployed through GitHub Pages.

For production, the frontend must be built with the real backend API URL:

```env
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

Recommended setup:

```text
GitHub Repository → Settings → Secrets and variables → Actions → Variables
```

Create this variable:

```text
VITE_API_BASE_URL
```

Value:

```text
https://your-backend-service.onrender.com/api
```

### Backend

The backend can be deployed on Render.

Required Render environment variables:

```env
DATABASE_URL=your-production-postgres-url
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-email@example.com
ENABLE_REMINDER_SCHEDULER=true
CLIENT_URL=https://mohammad-azimi.github.io
PRODUCTION_CLIENT_URL=https://mohammad-azimi.github.io
```

For scheduled reminders on free hosting, an external uptime monitor can be used to ping:

```text
https://your-backend-service.onrender.com/api/health
```

This helps keep the backend awake so the reminder scheduler can run.

---

## Testing Checklist

Before deploying or presenting the project, use the full testing checklist:

[Testing Checklist](./TESTING_CHECKLIST.md)

---

## Security Notes

- Do not commit `.env` files.
- Do not commit `node_modules`.
- Do not commit production secrets.
- Rotate secrets immediately if they were ever pushed publicly.
- JWT payloads should stay small and should not include large base64 assets.
- Backend CORS should only allow trusted frontend origins in production.

---

## License

This project is proprietary software.

The source code is publicly visible for portfolio and review purposes only. No permission is granted to copy, reuse, modify, redistribute, deploy, sell, or claim this project or any part of it without written permission from the copyright owner.

See the [LICENSE](./LICENSE) file for full terms.

---

## Author

Created by Mohammad Azimi.