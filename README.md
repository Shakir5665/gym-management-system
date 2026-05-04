# 🏢 Smart Gym Management & Retention System

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-darkgreen.svg)](https://www.mongodb.com/atlas/database)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)]()
[![Clients](https://img.shields.io/badge/Clients-1%20Active-brightgreen.svg)]()

A high-performance, real-time, SaaS-ready gym management platform designed to automate operations and maximize member retention through behavioral intelligence.

> [!IMPORTANT]
> **Project Status:** This system is officially **Production-Ready** and has been successfully deployed and sold to its first commercial client.

---

## 🚀 Key Features

### 👤 Member Management
- **Smart Onboarding:** Detailed member registration with validation.
- **QR Identity:** Unique QR code generation for every member.
- **Profile Insights:** Comprehensive view of attendance, payments, and engagement.

### 📅 Attendance & Rules
- **Live Scanning:** Instant QR-based check-in with `html5-qrcode`.
- **Enforcement Engine:** Automatic validation of BANS, FINES, and Subscription status.
- **Event Logging:** Records both successful and blocked attempts for deep analytics.

### 🎮 Gamification (Retention Boost)
- **Points & Streaks:** Earn points for consistency; maintain streaks to stay motivated.
- **Engagement Scoring:** Track member activity levels in real-time.
- **Leaderboards:** Foster a competitive and healthy community environment.

### 🧠 Behavioral Intelligence
- **Retention Engine:** Automatically identifies "At-Risk" members based on inactivity.
- **Risk Levels:** Classification (Low, Medium, High) to trigger proactive engagement.
- **Real-Time Dashboard:** Instant visibility into gym health and member distribution.

### 💳 Financial Management
- **Payment Tracking:** Manage subscriptions, renewals, and overdue payments.
- **Expense Logging:** Track gym overheads for accurate ROI analysis.
- **Auto-Reminders:** Cron-based notifications for upcoming and overdue payments.

---

## 🛠️ Tech Stack

### Frontend
- **Core:** React 19 (Vite), React Router 7
- **Styling:** Tailwind CSS 4, Framer Motion (Animations)
- **Real-time:** Socket.io-client
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 22, Express 5
- **Database:** MongoDB (Mongoose 9)
- **Security:** JWT, bcryptjs
- **Scheduling:** node-cron
- **Storage:** Cloudinary (Image management)
- **Communication:** Nodemailer, Socket.io

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v22+)
- MongoDB Atlas Account
- Cloudinary Account (for images)

### 1. Clone the Repository
```bash
git clone https://github.com/Shakir5665/gym-management-system.git
cd gym-management-system
```

### 2. Server Setup
```bash
cd server
npm install
# Create .env file based on .env.example
npm run dev
```

### 3. Client Setup
```bash
cd client
npm install
# Create .env file based on .env.example
npm run dev
```

---

## 📂 Project Structure

```text
gym-management-system/
├── client/                # React (Vite) Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # View components
│   │   └── context/       # Global state (Auth, Theme)
├── server/                # Node.js/Express Backend
│   ├── controllers/       # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   └── services/          # External service integrations
└── PROJECT_DOCUMENTATION.md # Detailed technical docs
```

---

## 👨‍💻 Author

**Mohamed Shakir**
*BSc IT Undergraduate | Future Software Engineer*

- [LinkedIn](https://www.linkedin.com/in/mohamedshakir5665/)
- [Portfolio](https://shakir-portfolio-one-amber-87.vercel.app)

---

## 🏁 Conclusion
This system is not just a management tool; it's a **retention-focused business solution**. By combining operational efficiency with behavioral data, it empowers gym owners to build lasting relationships with their members.
