# 🏢 Smart Gym Management & Retention System

[![Version](https://img.shields.io/badge/Version-1.1.0--PRO-blue.svg)](https://github.com/Shakir5665/gym-management-system)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.5--Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/atlas/database)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Status](https://img.shields.io/badge/Status-Production--Ready-success.svg)]()
[![Clients](https://img.shields.io/badge/Clients-1%20Active-brightgreen.svg)]()

A high-performance, real-time, SaaS-ready gym management platform designed to automate operations and maximize member retention through behavioral intelligence.

> [!IMPORTANT]
> **Project Status:** This system is officially **Production-Ready** (v1.1.0 PRO) and has been successfully deployed and sold to its first commercial client. It is no longer just a project; it is a live business solution.

---

## 🌟 Key Features

### 👤 Member Management
- **Smart Onboarding:** Detailed member registration with validation (Age, Email, Phone).
- **QR Identity:** Automatic unique QR code generation for every member.
- **Profile Insights:** Comprehensive view of attendance history, payments, and engagement metrics.

### 📅 Attendance & Rule Enforcement
- **Live Scanning:** Instant QR-based check-in using `html5-qrcode`.
- **Enforcement Engine:** Automatic validation of **BANS**, **FINES**, and **Subscription** status.
- **Event Logging:** Records both successful and blocked attempts for deep behavioral analytics.

### 🎮 Gamification (Retention Boost)
- **Points & Streaks:** Members earn 10 points per successful check-in; maintain streaks for consistency.
- **Engagement Scoring:** Track member activity levels in real-time.
- **Leaderboards:** Foster a competitive and healthy community environment with top-member rankings.

### 🧠 Behavioral Intelligence (The "Smart" Edge)
- **Retention Engine:** Automatically identifies "At-Risk" members based on inactivity days.
- **Risk Classification:** 
  - 🟢 **LOW:** < 5 days inactive
  - 🟡 **MEDIUM:** 5-10 days inactive (Potential Churn)
  - 🔴 **HIGH:** > 10 days inactive (Critical Churn Risk)
- **Real-Time Dashboard:** Instant visibility into gym health, revenue trends, and member distribution.

### 💳 Financial & Accounting
- **Payment Tracking:** Manage subscriptions, renewals, and overdue payments.
- **Expense Management:** Detailed logging of gym overheads for accurate ROI analysis.
- **Auto-Reminders:** Cron-based email notifications for upcoming and overdue payments.

---

## 🛠️ Advanced Tech Stack

### Frontend (Client)
- **Framework:** React 19.2 + Vite 8.0 (Lightning-fast builds)
- **Styling:** Tailwind CSS 4.2 + Framer Motion (Glassmorphism UI & smooth animations)
- **Routing:** React Router 7.1
- **Real-time:** Socket.io-client 4.8
- **Icons:** Lucide React 1.11

### Backend (Server)
- **Runtime:** Node.js 22.x + Express 5.2 (High-performance API)
- **Database:** MongoDB Atlas (Mongoose 9.5)
- **Real-time:** Socket.io 4.8 (WebSocket communication)
- **Security:** JWT 9.0 + bcryptjs 3.0
- **Scheduling:** node-cron 4.2 (Automated financial tasks)
- **Storage:** Cloudinary (Image management)

---

## 🔐 SaaS & Multi-Tenancy
The system is built with a **Multi-Tenant Architecture** in mind:
- **Data Isolation:** Every record is linked to a `gymId`, ensuring strict data separation between different gym owners.
- **Role-Based Access (RBAC):** Distinct permissions for **Owners**, **Staff**, and **Members**.
- **Scalable Infrastructure:** Designed to be deployed as a SaaS platform with minimal configuration.

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v22+)
- MongoDB Atlas Account
- Cloudinary Account (for member profile images)

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
│   │   ├── components/    # Atomic UI components
│   │   ├── pages/         # View components (Accounting, Members, etc.)
│   │   └── context/       # Global state (Auth, Theme, Notifications)
├── server/                # Node.js/Express Backend
│   ├── controllers/       # Business logic & Rule enforcement
│   ├── models/            # Mongoose schemas (Multi-tenant ready)
│   ├── routes/            # API endpoints
│   └── services/          # External integrations (Cloudinary, Cron)
└── PROJECT_DOCUMENTATION.md # Comprehensive technical specifications
```

---

## 🚀 Recent Updates (v1.1.0 PRO)
- ✅ **Socket.io Integration:** Real-time updates for check-ins, payments, and dashboard stats.
- ✅ **Accounting Module:** Added expense tracking and ROI analysis features.
- ✅ **Advanced Rule Engine:** Priority-based check-in validation (Ban > Fine > Subscription).
- ✅ **Enhanced UI:** Fully implemented Glassmorphism design system across all pages.
- ✅ **Mobile-First Navigation:** Optimized bottom navigation bar for mobile users.

---

## 👨‍💻 Author

**Mohamed Shakir**
*BSc IT Undergraduate | Future Software Engineer*

- [LinkedIn](https://www.linkedin.com/in/mohamedshakir5665/)
- [Portfolio](https://shakir-portfolio-one-amber-87.vercel.app)

---

## 🏁 Conclusion
This system is not just a management tool; it's a **retention-focused business solution**. By combining operational efficiency with behavioral data, it empowers gym owners to build lasting relationships with their members.
