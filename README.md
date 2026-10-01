# Chez Gourmet - Smart Canteen Pre-Order & Queue Management System

A full-stack, enterprise-grade Smart Canteen Pre-Order and Kitchen Queue Management System built with **Node.js, Express, Firebase Admin SDK (Firestore & Authentication)**, dynamic real-time pickup scheduling, signed HMAC-SHA256 digital tokens, and AI-powered executive analytics.

---

## 🌟 Key Features

1. **Artisanal Menu & Live Stock Control**:
   - Dynamic category filtering (Harvest Bowls, Grill Stacks, Pizzas, Desserts, Artisanal Drinks).
   - Real-time stock decrementing with automatic status updates (`Available`, `Limited`, `Sold Out`).

2. **Real-Time Dynamic Pickup Slot Scheduler**:
   - Generates 15-minute pickup slots dynamically based on system local time.
   - Enforces slot capacity limits (maximum 20 orders per 15-minute window) to prevent kitchen bottlenecks.

3. **Smart Kitchen Display System (KDS)**:
   - Workload-aware prep time estimation based on dish complexity and active queue size.
   - Smart priority scoring engine balancing customer pickup urgency and prep requirements.

4. **Digital Token & QR Code Pass System**:
   - Auto-generates unique sequential tokens (`C-001` through `C-999`).
   - Generates cryptographically signed HMAC-SHA256 QR code passes to prevent food counter double-collection fraud.

5. **Counter Token Verification & Dispatch Tool**:
   - Dedicated counter tool for kitchen staff/managers to scan or verify digital tokens before food handover.

6. **Executive Dashboard & Predictive AI Insights**:
   - Live metrics: Total Orders, Active Kitchen Queue, Completed Orders, Daily Revenue.
   - Predictive AI insights forecasting peak rush hours, delay risks, and demand trends.

7. **Role-Based Access Control (RBAC) & Privacy Protection**:
   - **Customer**: Browses menu, places pre-orders, and views **only their own tokens & order status**.
   - **Kitchen Staff**: Manages live queue, updates order status (`Placed` -> `Preparing` -> `Ready`), and verifies counter handover.
   - **Canteen Manager**: Accesses capacity controls, inventory overrides, staff shifts, and executive dashboards.
   - **Administrator**: Governs central system settings and enterprise access matrix.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database & Auth**: Firebase Admin SDK (Firestore & Firebase Auth) with simulated database fallback
- **Security**: JWT (JSON Web Tokens), bcryptjs password hashing, HMAC-SHA256 signatures
- **Frontend**: Vanilla HTML5, Modern CSS (Design System tokens), Responsive UI
- **Deployment**: Vercel Serverless / Node.js Engine

---

## 🚀 Quick Start (Local Setup)

### 1. Prerequisites
- Node.js `v18.x` or higher
- Git

### 2. Installation
```bash
# Clone repository
git clone https://github.com/your-username/chez-gourmet.git
cd chez-gourmet

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_chez_gourmet_jwt_key_2026
USE_SIMULATED_DB=false
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

*(Note: If no Firebase `serviceAccountKey.json` is provided, the system automatically falls back to Simulated DB mode for instant testing.)*

### 4. Seed Database (Populate 28 Menu Items, 23 Users & 35 Orders)
```bash
npm run seed
```

### 5. Start Application
```bash
# Start development server
npm run dev

# Or standard start
npm start
```
Visit `http://localhost:5000` in your web browser.

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer@chezgourmet.com` | `password123` |
| **Kitchen Staff** | `staff@chezgourmet.com` | `password123` |
| **Canteen Manager** | `manager@chezgourmet.com` | `password123` |
| **Administrator** | `admin@chezgourmet.com` | `password123` |

---

## ☁️ Deployment on Vercel

This repository includes a pre-configured `vercel.json` file for 1-click deployment on Vercel.

### Deployment Steps:
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Project**.
3. Select your `chez-gourmet` GitHub repository.
4. Add Environment Variables in Vercel settings:
   - `JWT_SECRET`: your secret key
   - `FIREBASE_PROJECT_ID`: your firebase project id
   - `FIREBASE_CLIENT_EMAIL`: your firebase client email
   - `FIREBASE_PRIVATE_KEY`: your firebase private key
5. Click **Deploy**. Vercel will instantly host your serverless API and static frontend!

---

## 📁 Project Structure

```
Chez Gourmet/
├── html/                          # Administrator governance panel
├── images/                        # High-res transparent logos & dish graphics
├── manager/                       # Canteen Manager setup & dashboards
├── public/                        # Public frontend application (index.html)
├── src/
│   ├── config/                    # Firebase Admin SDK & DB initialization
│   ├── controllers/               # Auth, Menu, Order, Queue, Verify, Analytics controllers
│   ├── middleware/                # JWT Auth & Role-based Authorization middleware
│   ├── routes/                    # API Endpoints (/api/auth, /api/orders, /api/queue...)
│   └── services/                  # AI analytics, queue prioritization & token service
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules (protects credentials & secrets)
├── package.json                   # Dependencies & scripts
├── README.md                      # Project documentation
├── seed.js                        # Live Firestore database seeder
├── server.js                      # Express application entry point
└── vercel.json                    # Vercel deployment configuration
```

---

## 📄 License
Licensed under the [ISC License](LICENSE).
