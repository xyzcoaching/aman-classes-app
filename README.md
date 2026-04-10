# 🎓 Aman Classes – Coaching Management System

A full-stack web application for managing a coaching institute (Classes 6–10). Built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
aman-classes/
├── backend/
│   ├── middleware/
│   │   └── auth.js              # JWT auth middleware
│   ├── models/
│   │   ├── User.js              # Admin & student user accounts
│   │   ├── Student.js           # Student profiles
│   │   ├── Attendance.js        # Daily attendance records
│   │   ├── Fee.js               # Monthly fee payments
│   │   ├── Material.js          # Study material metadata
│   │   ├── Announcement.js      # Class announcements
│   │   └── Schedule.js          # Weekly timetable
│   ├── routes/
│   │   ├── auth.js              # Login, /me
│   │   ├── students.js          # CRUD students
│   │   ├── attendance.js        # Mark & view attendance
│   │   ├── fees.js              # Record & track fees
│   │   ├── materials.js         # Upload & list materials
│   │   ├── announcements.js     # Post & view announcements
│   │   ├── schedule.js          # Weekly timetable
│   │   └── dashboard.js         # Aggregated dashboard stats
│   ├── seed/
│   │   └── seed.js              # Demo data seeder
│   ├── uploads/                 # Uploaded PDF files
│   ├── server.js                # Express entry point
│   ├── .env                     # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.js    # Sidebar + mobile nav
    │   │   └── ui/
    │   │       └── index.js     # Shared UI components
    │   ├── context/
    │   │   └── AuthContext.js   # Auth state & login/logout
    │   ├── pages/
    │   │   ├── Login.js         # Login page
    │   │   ├── Dashboard.js     # Admin dashboard
    │   │   ├── Students.js      # Student management
    │   │   ├── Attendance.js    # Attendance marking
    │   │   ├── Fees.js          # Fee management
    │   │   ├── OtherPages.js    # Materials, Announcements, Schedule
    │   │   └── StudentPortal.js # Student-facing pages
    │   ├── utils/
    │   │   ├── api.js           # Axios instance with auth header
    │   │   └── helpers.js       # Formatting, constants, print receipt
    │   ├── App.js               # Routes & auth guards
    │   ├── index.js             # React entry point
    │   └── index.css            # Tailwind + custom styles
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → https://nodejs.org
- **MongoDB** (local) → https://www.mongodb.com/try/download/community
- **npm** v9+

---

## 🚀 Quick Start

### Step 1 – Clone / download the project

```bash
# If using git:
git clone <your-repo-url>
cd aman-classes

# Or unzip the downloaded folder and cd into it
```

---

### Step 2 – Setup Backend

```bash
cd backend
npm install
```

Create your `.env` file (already included, edit if needed):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aman-classes
JWT_SECRET=amanclasses_super_secret_jwt_key_2024
NODE_ENV=development
```

Start MongoDB on your machine (if not running):
```bash
# macOS (with Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows: Start MongoDB from Services or run mongod.exe
```

Seed demo data:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev     # development (with auto-reload via nodemon)
# or
npm start       # production
```

Backend runs at: **http://localhost:5000**

---

### Step 3 – Setup Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

The frontend proxies all `/api` requests to the backend automatically (configured in `package.json`).

---

## 🔐 Demo Login Credentials

| Role    | Email                        | Password     |
|---------|------------------------------|--------------|
| Admin   | admin@amanclasses.com        | admin123     |
| Student | student1@amanclasses.com     | student123   |
| Student | student2@amanclasses.com     | student123   |
| Student | student3@amanclasses.com     | student123   |

---

## 🌟 Features

### Admin Panel
| Feature              | Description |
|----------------------|-------------|
| Dashboard            | Stats, today's schedule, recent announcements |
| Student Management   | Add / edit / delete / search / filter students |
| Attendance           | Mark present/absent per class & subject, calendar view |
| Fee Management       | Record payments, track monthly status, print receipts |
| Study Materials      | Upload PDFs, filter by subject |
| Announcements        | Post updates by class or all, set priority |
| Schedule             | Weekly timetable with today highlighted |

### Student Portal
| Feature              | Description |
|----------------------|-------------|
| Dashboard            | Attendance summary, fee status, announcements |
| My Attendance        | Monthly stats (present/absent/percentage) |
| My Fees              | Month-by-month payment history |
| Materials            | Browse & download notes by subject |
| Announcements        | Class-specific announcements |

---

## 🗄️ Database Schema Summary

### Student
```js
{ name, class, subjects[], parentPhone, admissionDate, monthlyFee, feeStatus, rollNumber, address }
```

### Attendance
```js
{ date, class, subject, records: [{ student, status }], markedBy }
```

### Fee
```js
{ student, month, year, amount, paidAmount, status, paidDate, receiptNumber }
```

### Announcement
```js
{ title, body, targetClass, subject, priority, postedBy, isActive }
```

### Schedule
```js
{ class, day, subject, startTime, endTime, teacher }
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/login        Login (returns JWT token)
GET    /api/auth/me           Get current user
```

### Students
```
GET    /api/students          List (filter: class, search, feeStatus)
POST   /api/students          Add student
PUT    /api/students/:id      Update student
DELETE /api/students/:id      Soft delete
```

### Attendance
```
GET    /api/attendance        Get records (date, class, subject)
POST   /api/attendance        Mark attendance (upsert)
GET    /api/attendance/today  Today's summary
GET    /api/attendance/student/:id   Monthly stats per student
```

### Fees
```
GET    /api/fees              List (month, year, status, studentId)
POST   /api/fees              Record payment
GET    /api/fees/summary      Monthly totals
GET    /api/fees/:id/receipt  Receipt data
```

### Materials, Announcements, Schedule
```
GET/POST/DELETE  /api/materials
GET/POST/DELETE  /api/announcements
GET/POST/DELETE  /api/schedule
```

### Dashboard
```
GET    /api/dashboard         Aggregated stats + today's schedule + announcements
```

---

## 🛠️ Production Deployment

### Build frontend
```bash
cd frontend
npm run build
```

### Serve with Express (optional)
Add to `server.js`:
```js
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

### Environment (production)
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/aman-classes
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
```

---

## 📱 Mobile Support

The UI is fully responsive:
- Collapsible sidebar on mobile
- Touch-friendly buttons and inputs
- Stacked layouts on small screens

---

## 🙏 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, React Router v6, Tailwind CSS |
| Backend   | Node.js, Express 4 |
| Database  | MongoDB, Mongoose |
| Auth      | JWT (jsonwebtoken), bcryptjs |
| UI Icons  | Lucide React |
| Dates     | date-fns |
| Toasts    | react-hot-toast |
| HTTP      | Axios |

---

Built with ❤️ for **Aman Classes** – Class 6 to 10 Coaching
