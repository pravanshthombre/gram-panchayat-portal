# 🏛️ Smart Gram Panchayat Portal

A comprehensive full-stack solution designed to bridge the gap between village administration (Gram Panchayat) and citizens (Villagers). This portal streamlines complaint management, village analytics, and administrative transparency.

## 🚀 Live Demo
- **Frontend (Vercel):** [Your Vercel URL Here]
- **Backend API (Render):** [Your Render URL Here]

---

## ✨ Features

### 👤 Villager Module
- **Submit Complaints:** Raise issues related to infrastructure, water supply, electricity, etc.
- **Track Status:** Real-time updates on submitted complaints.
- **Village Feed:** View public notifications and updates from the Panchayat.
- **Personal Dashboard:** Summary of personal complaints and activity.

### 🛠️ Admin Module
- **Centralized Dashboard:** Overview of all village activities and pending issues.
- **Complaint Management:** Assign, respond to, and resolve citizen complaints.
- **Village Analytics:** Visual charts (Chart.js) showing complaint distribution and resolution rates.
- **Manage Villages:** Add and manage multiple village jurisdictions.

---

## 💻 Tech Stack

- **Frontend:** React (Vite), React Router, Lucide Icons, Chart.js, Vanilla CSS (Glassmorphism design).
- **Backend:** Node.js, Express.js.
- **Database:** Supabase (PostgreSQL) for production, SQLite support for local dev.
- **Authentication:** JWT (JSON Web Tokens) with secure password hashing (Bcrypt).
- **Hosting:** Vercel (Frontend) & Render (Backend).

---

## 📁 Project Structure

```
├── client/          # React Frontend (Vite)
├── server/          # Node.js Express Backend
├── render.yaml      # Render Deployment Configuration
├── README.md        # Project Documentation
└── package.json     # Root scripts for monorepo management
```

---

## 🛠️ Local Setup

1. **Clone the repository**
2. **Install all dependencies** (from the root directory):
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   - Create `server/.env` with:
     ```env
     PORT=5000
     JWT_SECRET=your_secret_key
     DATABASE_URL=your_supabase_postgresql_url
     ```
   - `JWT_SECRET` is mandatory. Backend startup will fail if it is missing.
4. **Run the application:**
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:3000`
   - Backend runs on: `http://localhost:5000`

---

## 🚢 Deployment Configuration

### Frontend (Vercel)
- **Root Directory:** `client`
- **Build Command:** `vite build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL` (points to your Render URL + `/api`)

### Backend (Render)
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | Set your own admin user in your database | Set your own password |
| **Villager** | Set your own villager user in your database | Set your own password |

---

## 📄 License
This project is open-source and available for educational purposes.
