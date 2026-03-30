# SLIIT EventHub

<div align="center">

<img src="client/public/SLIIT.jpg" alt="SLIIT Logo" width="120"/>

### A Real-Time Campus Event Management System



[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE.md)

</div>

---



---

## 📌 Project Overview

**SLIIT EventHub** is a full-stack web application that enables SLIIT students,
event organisers, and administrators to manage campus events end-to-end.

The platform provides:

- Smart **event scheduling** with automatic campus-wide conflict detection
- **Real-time announcements** via Socket.IO broadcast
- **Role-based access control** — Participant / Organiser / Admin
- **Image upload** for event cover photos
- **Interactive calendar** showing events with day-click detail view
- **Admin approval workflow** with conflict flagging
- **Google OAuth** one-click sign-in

---

## ✨ Features

### 🗓️ Event Lifecycle 
- Create events with title, description, category, date, start time, duration, venue, capacity, image and tags
- **Campus-wide conflict detection** — warns organiser if any event overlaps the selected time slot
- **Interactive event calendar** — dots on days with events, click to see day schedule
- Event **status lifecycle**: `Pending → Approved → Completed / Cancelled`
- Organiser dashboard with **bar chart** showing event status breakdown
- Event detail page with registration stats, spots remaining, participant count
- Admin **approve / reject** with required rejection reason
- **Soft conflict warning** — organiser can still submit, admin makes final call
- Events stored with `hasConflict` flag visible to admin during review

### 🔐 Authentication — 
- User registration (first name, last name, email, password)
- Login with email and password
- **Google OAuth** one-click sign-in (no college prompt)
- JWT access token + refresh token
- Forgot password → email reset link (30 min expiry)
- Reset password page
- Profile page — view and edit name
- Protected routes with role-based guards

### 🎫 Tickets & Merchandise 
- *(Module in development by team member)*

### 🛡️ Admin Dashboard —
- Pending event approval queue with conflict indicators
- Approve or reject events with optional rejection reason
- **User Management** — list all users, search, filter by role
- Change user roles (Participant / Organiser / Admin)
- Activate or deactivate user accounts
- Platform statistics overview

### 📢 Announcements (Shared)
- Create announcements with priority levels (Low / Normal / High / Urgent)
- **Real-time broadcast** via Socket.IO — all connected users see new announcements instantly
- Live toast notification banner when new announcement arrives
- Delete announcements (owner or admin)

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) + TailwindCSS + Redux Toolkit |
| Backend | Node.js + Express.js |
| Notification Service | Node.js + Express.js + Socket.IO |
| Database | MongoDB Atlas + Mongoose |
| Real-time | Socket.IO 4.x |
| Authentication | JWT (Access + Refresh) + Google OAuth 2.0 |
| Image Upload | Multer (local storage) |
| Email | Nodemailer (Gmail) |
| Forms | Formik + Yup validation |
| HTTP Client | Axios |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               React Frontend  :5173                         │
│   NavBar (mega dropdown) · No sidebar · Role-based nav      │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / Axios
          ┌────────────┴────────────┐
          │                         │
   ┌──────▼──────┐          ┌───────▼───────┐
   │   server/   │          │notification-  │
   │  :5000      │          │service/ :5001 │
   │             │          │               │
   │ auth routes │          │ Socket.IO     │
   │ event routes│          │ announcement  │
   │ admin routes│          │ routes        │
   └──────┬──────┘          └───────┬───────┘
          │                         │
   ┌──────▼─────────────────────────▼───────┐
   │           MongoDB Atlas                  │
   │  sliit_eventhub  · sliit_announcements  │
   └─────────────────────────────────────────┘
```

### Service Ports

| Service | Port | Responsibility |
|---------|------|---------------|
| React Frontend (Vite) | `:5173` | User interface |
| server (main API) | `:5000` | Auth, Events, Admin |
| notification-service | `:5001` | Announcements + Socket.IO |

---

## 📁 Project Structure

```
SLIIT-EventHub/
│
├── client/                          ← React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                     ← Axios API call modules
│   │   │   ├── authApi.js
│   │   │   ├── eventApi.js
│   │   │   ├── announcementApi.js   ← includes Socket.IO
│   │   │   └── adminApi.js
│   │   ├── components/
│   │   │   ├── auth/                ← SignInForm, SignUpForm
│   │   │   ├── events/              ← EventCard, EventForm,
│   │   │   │                           EventCalendar, ConflictWarning
│   │   │   ├── shared/              ← NavBar, AppShell, AuthGuard
│   │   │   └── ui/                  ← InputField, Button
│   │   ├── hooks/
│   │   │   └── useAuth.js           ← custom auth hook
│   │   ├── pages/
│   │   │   ├── SignInPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── EventDetailPage.jsx
│   │   │   ├── EventCreatePage.jsx
│   │   │   ├── EventEditPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── OrganizerDashboardPage.jsx
│   │   │   ├── AnnouncementsPage.jsx
│   │   │   ├── UserManagementPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── store/
│   │   │   ├── index.js             ← Redux store
│   │   │   └── slices/
│   │   │       ├── userSlice.js
│   │   │       └── eventSlice.js
│   │   ├── App.jsx                  ← all routes
│   │   ├── main.jsx                 ← Redux Provider entry
│   │   └── index.css                ← Tailwind import
│   ├── .env                         ← frontend env vars
│   ├── index.html
│   └── vite.config.js
│
├── server/                          ← Main backend API
│   ├── uploads/                     ← uploaded event images
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                ← MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    ← JWT protect + restrictTo
│   │   ├── models/
│   │   │   ├── UserAccount.js       ← user schema (no college)
│   │   │   └── CampusEvent.js       ← event schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js       ← includes multer upload
│   │   │   └── adminRoutes.js
│   │   └── utils/
│   │       ├── tokenUtils.js        ← JWT helpers
│   │       └── emailUtils.js        ← Nodemailer
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── notification-service/            ← Real-time service
    ├── src/
    │   ├── controllers/
    │   │   └── announcementController.js
    │   ├── middleware/
    │   │   └── authMiddleware.js
    │   ├── models/
    │   │   └── Announcement.js
    │   └── routes/
    │       └── announcementRoutes.js
    ├── .env
    ├── server.js                    ← Express + Socket.IO
    └── package.json
```

---

## 🚀 Installation & Setup

### Prerequisites

| Tool | Version | Download |
|------|---------|---------|
| Node.js | v18 or higher | [nodejs.org](https://nodejs.org) |
| npm | v9 or higher | Included with Node.js |
| Git | Any | [git-scm.com](https://git-scm.com) |
| MongoDB Atlas | Cloud (free tier) | [mongodb.com/atlas](https://mongodb.com/atlas) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Hirush98/SLIIT-EventHub.git
cd SLIIT-EventHub
```

---

### Step 2 — Create Environment Files

#### `server/.env`
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sliit_eventhub?appName=Cluster0

JWT_SECRET=your_jwt_secret_here_minimum_32_chars
JWT_EXPIRE=1d
JWT_REFRESH_SECRET=your_refresh_secret_here_minimum_32_chars
JWT_REFRESH_EXPIRE=7d

NODE_ENV=development
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_oauth_client_id

EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=SLIIT EventHub <your_gmail@gmail.com>
```

#### `notification-service/.env`
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/sliit_announcements?appName=Cluster0

# Must be the same JWT_SECRET as server/.env
JWT_SECRET=your_jwt_secret_here_minimum_32_chars

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

#### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_NOTIF_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> ⚠️ **Never commit `.env` files to GitHub.** They are listed in `.gitignore`.
> Share real values with teammates privately (WhatsApp / direct message).

---

### Step 3 — Install Dependencies

Open **three separate terminals**:

**Terminal 1 — Main Server**
```bash
cd server
npm install
```

**Terminal 2 — Notification Service**
```bash
cd notification-service
npm install
```

**Terminal 3 — Frontend**
```bash
cd client
npm install
npm install socket.io-client
```

---

### Step 4 — Start the Project

**Terminal 1**
```bash
cd server
npm run dev
# Expected: SLIIT EventHub server running on port 5000
# Expected: MongoDB connected: cluster0.xxxxx.mongodb.net
```

**Terminal 2**
```bash
cd notification-service
npm run dev
# Expected: Notification service running on port 5001
# Expected: Notification service: MongoDB connected
```

**Terminal 3**
```bash
cd client
npm run dev
# Expected: VITE ready — Local: http://localhost:5173
```

---

### Step 5 — Open in Browser

```
http://localhost:5173
```

You should see the **SLIIT EventHub Sign In** page.

---

### Step 6 — Set Up Google OAuth (for Google Login)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → `SLIIT-EventHub`
3. **APIs & Services** → **OAuth Consent Screen** → Select **External**
4. Fill in app name and email → Save
5. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth Client ID**
6. Application type: **Web application**
7. Authorised JavaScript origins: `http://localhost:5173`
8. Copy the **Client ID** → paste into `client/.env` and `server/.env`

---

### MongoDB Atlas Setup

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** → **Add IP Address** → **Allow from Anywhere** `0.0.0.0/0`
3. Copy your connection string → paste into both `.env` files
4. Replace `<password>` with your actual database password

---

## 🔌 API Reference

### Auth Service — `localhost:5000/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `POST` | `/register` | Register new user | No |
| `POST` | `/login` | Login with email + password | No |
| `GET` | `/me` | Get current user profile | Yes |
| `PUT` | `/profile` | Update first/last name | Yes |
| `POST` | `/google` | Google OAuth login | No |
| `POST` | `/forgot-password` | Send password reset email | No |
| `POST` | `/reset-password/:token` | Reset password with token | No |
| `POST` | `/refresh` | Refresh access token | No |
| `POST` | `/logout` | Logout | Yes |

### Event Service — `localhost:5000/api/events`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `GET` | `/` | List all events (search + filter) | No |
| `POST` | `/` | Create event with image upload | Organiser / Admin |
| `GET` | `/calendar` | Calendar dots for a month | No |
| `GET` | `/check-conflict` | Check time slot conflicts | Yes |
| `GET` | `/my-events` | Organiser's own events | Yes |
| `GET` | `/my-registrations` | User's registered events | Yes |
| `GET` | `/:id` | Get single event | No |
| `PUT` | `/:id` | Update event | Owner / Admin |
| `DELETE` | `/:id` | Delete event | Owner / Admin |
| `PUT` | `/:id/status` | Approve / Reject / Complete | Admin |
| `POST` | `/:id/register` | Register for event | Yes |
| `DELETE` | `/:id/register` | Cancel registration | Yes |

### Admin Service — `localhost:5000/api/admin`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `GET` | `/users` | List all users | Admin |
| `GET` | `/stats` | Platform statistics | Admin |
| `PUT` | `/users/:id/role` | Change user role | Admin |
| `PUT` | `/users/:id/status` | Activate / Deactivate user | Admin |

### Announcement Service — `localhost:5001/api/announcements`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| `GET` | `/` | List all announcements | No |
| `GET` | `/latest` | Latest 5 announcements | No |
| `GET` | `/:id` | Single announcement | No |
| `POST` | `/` | Create + broadcast in real-time | Organiser / Admin |
| `PUT` | `/:id` | Update announcement | Owner / Admin |
| `DELETE` | `/:id` | Remove announcement | Owner / Admin |

---

## 🌿 Branch Strategy

| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | | Production-ready. Protected — do not push directly |
| `develop` | | Integration branch — all PRs merge here first |
| `feature/kavinda-events` | | Event lifecycle, conflict detection, calendar |
| `feature/monal-auth` | | Auth, Google OAuth, QR, feedback |
| `feature/even-tickets` | | Ticket booking, merchandise |
| `feature/venura-admin` | | Admin dashboard, user management |

---

## 📋 Daily Git Workflow

### 1. Start of day — pull latest
```bash
git checkout feature/your-branch
git pull origin feature/your-branch
```

### 2. Make changes — commit often
```bash
git add .
git commit -m "feat: describe what you built"
```

### 3. Push your work
```bash
git push origin feature/your-branch
```

### 4. When feature is complete — open a Pull Request
- Go to GitHub → Pull Requests → New Pull Request
- Base: `develop` ← Compare: `feature/your-branch`
- Add description → Submit
- Hirusha reviews and merges

---

## 📝 Commit Message Convention

```
feat:      new feature or functionality
fix:       bug fix
refactor:  code restructure without behaviour change
chore:     config, packages, tooling
docs:       documentation only
test:       adding or updating tests
```

**Examples:**
```bash
git commit -m "feat: add venue conflict detection to event creation"
git commit -m "fix: resolve login redirect after Google OAuth"
git commit -m "refactor: clean up event controller response format"
git commit -m "docs: update README with API reference"
```

---

## 📸 Screenshots

> Screenshots will be added after UI completion.

| Page | Description |
|------|-------------|
| Sign In | Two-panel login with Google OAuth |
| Sign Up | Registration form with validation |
| Home | Stats + upcoming events + announcements |
| Events | Searchable grid with category filters |
| Create Event | Form + calendar + conflict detection |
| Event Detail | Full info + registration + admin actions |
| Organiser Dashboard | Event list + bar chart |
| Admin Dashboard | Pending approval queue + user management |
| Announcements | Real-time list with priority indicators |

---

## 🔒 Security Notes

- All passwords are hashed with **bcrypt** (salt rounds: 10)
- JWTs expire after **1 day** (access) and **7 days** (refresh)
- Password reset tokens expire after **30 minutes**
- `.env` files are **never committed** to GitHub
- Google OAuth tokens are verified server-side using `google-auth-library`
- File uploads are validated by type (JPG/PNG/WEBP) and size (max 5MB)

---

## 🐛 Troubleshooting

**MongoDB connection error**
```
Check: server/.env — MONGODB_URI is correct
Check: MongoDB Atlas → Network Access → 0.0.0.0/0 is whitelisted
Check: Your cluster is not paused (Atlas free tier pauses after inactivity)
```

**Port already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac / Linux
lsof -ti:5000 | xargs kill -9
```

**Google login not working**
```
Check: VITE_GOOGLE_CLIENT_ID in client/.env matches Google Console
Check: http://localhost:5173 is added to Authorised JavaScript origins
Check: Your Gmail is added as a Test User in OAuth consent screen
```

**Real-time announcements not working**
```
Check: notification-service is running on port 5001
Check: VITE_NOTIF_URL=http://localhost:5001 in client/.env
Check: JWT_SECRET in notification-service/.env matches server/.env
```

**Images not uploading**
```
Check: server/uploads/ folder exists (auto-created on first run)
Check: File is JPG, PNG or WEBP and under 5MB
```

---


---

## 📄 License

This project is original work by SLIIT ITPM Group 279, built from scratch as part of the IT3040 module assessment.

MIT License — Copyright © 2026 Hirush98.

<div align="center">
  <sub>SLIIT EventHub · IT3040 ITPM 2026 · Group 279 · Sri Lanka Institute of Information Technology</sub>
</div>
