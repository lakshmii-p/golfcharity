
# 🏌️ GolfCharity

> **Play. Win. Give Back.**

GolfCharity is a modern full-stack web application that brings together golf, community engagement, and charitable giving. Players can track their golf performance, subscribe to monthly or yearly plans, participate in monthly prize draws, and support charitable organizations—all through a clean and intuitive platform.

---

## 🌐 Live Demo

**Live Application:**  
https://golfcharity-jwzs.vercel.app/

**GitHub Repository:**  
https://github.com/lakshmii-p/golfcharity

---

## 🔑 Demo Credentials

### Admin Access

```text
Email: admin@golfcharity.com
Password: Admin@2026
```

### User Access

Create a new account using the **Sign Up** page to explore all user features.

---

# 📖 Overview

GolfCharity is designed to provide an engaging experience for golfers while supporting meaningful causes. Users can securely register, manage subscriptions, record Stableford golf scores, participate in monthly reward draws, and contribute to charities through a single platform.

The application also includes a powerful admin dashboard for managing users, subscriptions, charities, draw operations, winner verification, and overall platform activity.

---

# ✨ Features

### 👤 Authentication

- Secure user registration and login
- JWT-based authentication
- Password encryption using bcrypt
- Role-based access control

### 💳 Subscription Management

- Monthly and yearly plans
- Stripe Checkout integration
- Billing portal
- Subscription status management

### ⛳ Golf Score Management

- Stableford score entry
- Rolling last 5 scores
- Duplicate date validation
- Edit and delete scores

### 🎲 Monthly Draw System

- Random draw generation
- Algorithm-based draw mode
- Draw simulation
- Jackpot rollover
- Automatic prize distribution

### ❤️ Charity Management

- Browse charities
- Search charities
- Featured charity section
- Charity events
- Independent donations

### 🏆 Winner Verification

- Proof upload
- Admin approval/rejection
- Payment status tracking

### 📊 Dashboards

**User Dashboard**

- Subscription details
- Score history
- Charity information
- Draw participation
- Winnings summary

**Admin Dashboard**

- User management
- Subscription management
- Charity management
- Draw management
- Winner verification
- Platform statistics

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React, Vite, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Authentication | JWT, bcrypt |
| Payments | Stripe Checkout, Stripe Webhooks |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

# 📂 Project Structure

```text
golfcharity/
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env.example
│
├── backend/
│   ├── src/
│   ├── supabase_schema.sql
│   └── .env.example
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/lakshmii-p/golfcharity.git
cd golfcharity
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# ⚙️ Configuration

### Supabase

- Create a new Supabase project.
- Run the `backend/supabase_schema.sql` script in the SQL Editor.
- Add your Supabase credentials to the backend `.env` file.

### Stripe

Configure Stripe in **Test Mode** by adding:

- Secret Key
- Publishable Key
- Monthly Price ID
- Yearly Price ID
- Webhook Secret

Update the environment variables before running the application.

---

# 📱 Highlights

- Modern responsive UI
- Mobile-first design
- Secure authentication
- Stripe payment integration
- Golf score management
- Monthly prize draw engine
- Charity contribution system
- Winner verification workflow
- Comprehensive admin dashboard

---

# 👩‍💻 Author

**Lakshmi P**

GitHub: https://github.com/lakshmii-p

---

# 📄 License

This project is available for educational and portfolio purposes.
````




