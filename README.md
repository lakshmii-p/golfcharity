# GolfCharity — Full Stack App

> Play. Win. Give Back.

A subscription-driven golf charity platform with prize draws, score tracking, and charity contributions.

---

## 🚀 Quick Start (Local)

### 1. Prerequisites
- Node.js 18+
- A Supabase account (free tier works)
- A Stripe account (test mode)

---

### 2. Supabase Setup
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste contents of `backend/supabase_schema.sql` → Run
3. Copy your **Project URL** and **service_role key** from Settings → API

---

### 3. Stripe Setup
1. Go to [stripe.com](https://stripe.com) → Dashboard
2. Create two products:
   - **Monthly Plan** → ₹9.99/month → copy price ID
   - **Yearly Plan** → ₹89.99/year → copy price ID
3. Copy your **Secret Key** and **Publishable Key** from Developers → API Keys
4. For webhooks (optional for local): use [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

### 4. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your values in .env
npm install
npm run dev
```

Backend runs on **http://localhost:5000**

---

### 5. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in:
# VITE_API_URL=http://localhost:5000/api
# VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

### 6. Admin Access
- Email: `admin@golfcharity.com`
- Password: `Admin@123`
- URL: `/admin`

---

## 🌐 Deploy to Vercel

### Backend
1. Create new Vercel project → import `backend/` folder
2. Set all env vars from `.env.example` in Vercel dashboard
3. Framework: **Other** (uses `vercel.json`)
4. Copy your deployed backend URL (e.g. `https://golfcharity-api.vercel.app`)

### Frontend
1. Create new Vercel project → import `frontend/` folder
2. Set env vars:
   - `VITE_API_URL=https://your-backend.vercel.app/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Framework: **Vite**

### Stripe Webhook (after deploy)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-backend.vercel.app/api/subscriptions/webhook`
3. Events to listen: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copy webhook signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 📁 Project Structure

```
golfcharity/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API routes
│   │   └── utils/           # Supabase, email
│   ├── supabase_schema.sql  # DB schema + seed data
│   ├── vercel.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, Admin layout
│   │   ├── contexts/        # Auth context
│   │   ├── pages/           # All pages + admin pages
│   │   └── utils/           # API client
│   ├── vercel.json
│   └── .env.example
└── README.md
```

---

## ✅ Features Implemented

- **Auth**: JWT-based register/login, role-based access (subscriber/admin)
- **Subscriptions**: Stripe Checkout (monthly/yearly), billing portal, webhook lifecycle
- **Scores**: 5-score rolling system, date deduplication, 1–45 Stableford validation
- **Draw Engine**: Random + algorithmic (score-frequency weighted), simulation mode, jackpot rollover
- **Prize Pool**: Auto-split (40/35/25%), multi-winner equal split
- **Charities**: CRUD, search, featured spotlight, upcoming events
- **Winner Verification**: Proof upload → Admin approve/reject → Mark paid
- **Email Notifications**: Welcome, draw results, winner alerts, payment confirmation
- **User Dashboard**: Scores, winnings, subscription, charity, participation summary
- **Admin Panel**: Stats, user management, draw management, charity management, winner verification
- **Public Pages**: Homepage, charities directory, draw results
- **Mobile-first responsive design**
- **Dark, modern UI** (no golf clichés)
