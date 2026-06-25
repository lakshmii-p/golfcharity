
# 🏌️ GolfCharity

> **Play. Win. Give Back.**

GolfCharity is a modern full-stack web application that combines golf score tracking, subscription management, monthly prize draws, and charitable giving into a single platform. Users can manage their golf performance, participate in monthly draws, and support charities through a clean and responsive interface.

---

## 🌐 Live Demo

**Application:**  
https://golfcharity-jwzs.vercel.app/

**GitHub Repository:**  
https://github.com/lakshmii-p/golfcharity

---

# 📖 Overview

GolfCharity is designed to provide an engaging experience for golfers while supporting meaningful causes. Users can securely register, manage subscriptions, record Stableford golf scores, participate in prize draws, and explore charitable organizations from a single platform.

The application also includes a dedicated admin dashboard for managing users, subscriptions, charities, draw operations, winner verification, and platform statistics.

---

## 🔑 Demo Credentials

### Admin

```text
Email: admin@golfcharity.com
Password: Admin@2026
```

### User

Create a new account using the **Sign Up** page to explore all user features.

---

# ✨ Features

### 👤 Authentication

- Secure user registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### 💳 Subscription Management

- Monthly and yearly subscription plans
- Subscription status management
- Payment gateway configuration prepared through environment variables

### ⛳ Golf Score Management

- Stableford score tracking
- Rolling last 5 scores
- Duplicate date validation
- Edit and delete scores

### 🎲 Draw System

- Monthly prize draws
- Random and algorithm-based draw modes
- Simulation mode
- Automatic prize distribution
- Jackpot rollover support

### ❤️ Charity Management

- Browse charities
- Search charities
- Featured charities
- Charity events
- Independent donations

### 🏆 Winner Verification

- Upload proof of winning scores
- Admin approval and rejection workflow
- Payment status tracking

### 📊 Dashboards

**User Dashboard**

- Subscription details
- Score history
- Charity information
- Draw participation
- Winnings overview

**Admin Dashboard**

- User management
- Subscription management
- Charity management
- Draw management
- Winner verification
- Platform analytics

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React, Vite, JavaScript, HTML5, CSS3 |
| Backend | Node.js, Express.js |
| Database | Supabase (PostgreSQL) |
| Authentication | JWT, bcrypt |
| Payment | Payment gateway ready (configurable via environment variables) |
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

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# ⚙️ Configuration

### Supabase

- Create a Supabase project.
- Run `backend/supabase_schema.sql` in the SQL Editor.
- Update the backend `.env` file with your Supabase credentials.

### Payment Gateway

The project includes placeholder environment variables for payment gateway integration. Configure your preferred payment provider by updating the required environment variables before enabling online payment functionality.

---

# 📱 Highlights

- Responsive, mobile-first design
- Secure authentication and authorization
- Golf score management
- Monthly draw engine
- Charity contribution workflow
- Winner verification system
- Comprehensive admin dashboard
- Clean and modern user interface

---

# 👩‍💻 Author

**Lakshmi P**

GitHub: https://github.com/lakshmii-p

---

# 📄 License

This project is available for educational and portfolio purposes.
````





