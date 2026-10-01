# 📄 Project Explanation Document
## Smart Canteen Pre-Order & Queue Management System (Backend)

### 📌 Project Overview
The **Smart Canteen Pre-Order & Queue Management System** is a full-featured backend application built for universities, offices, hostels, and factories to eliminate long canteen queues during peak break hours. It handles pre-ordering, digital token generation (`C-021`), live kitchen queue scheduling, token verification with QR security, and AI-powered sales & demand analytics.

---

## 📁 Directory & File Structure

```
canteen-backend/
├── server.js                   # Express application entry point & route registration
├── seed.js                     # Database seeder script for sample items, users & orders
├── API_DOCUMENTATION.md        # Comprehensive integration guide for Frontend developers
├── PROJECT_EXPLANATION.md      # Hackathon submission architecture & feature document
├── package.json                # Project dependencies & npm scripts
├── .env.example                # Environment variable configuration template
├── .env                        # Active environment variables
└── src/
    ├── config/
    │   └── firebase.js         # Firebase Admin SDK setup & Simulated Database fallback engine
    ├── middleware/
    │   ├── authMiddleware.js   # Auth token verification & Role-Based Access Control (RBAC)
    │   ├── errorHandler.js     # Global API error handler & error response formatter
    │   └── validate.js         # Request payload validation middleware
    ├── services/
    │   ├── queueService.js     # Smart Queue Prioritization & Dynamic Prep Time Calculator
    │   ├── aiAnalyticsService.js # Predictive AI: Demand forecasting, delay prediction, peak hours
    │   ├── tokenService.js     # Token generator (C-021) & signed QR Code verifier
    │   └── notificationService.js # Order status update push notification logger
    ├── controllers/
    │   ├── authController.js   # User registration, login & profile management
    │   ├── menuController.js   # Menu CRUD, availability toggle & stock control
    │   ├── orderController.js  # Order placement, status pipeline & cancellation
    │   ├── queueController.js  # Kitchen display queue (KDS) & pickup slot capacity
    │   ├── verifyController.js # QR / Token scanning verification & double-collection prevention
    │   ├── analyticsController.js # Manager dashboard metrics & AI insights
    │   └── adminController.js  # Admin user management & system logs
    └── routes/
        ├── authRoutes.js       # Routes for authentication (/api/auth)
        ├── menuRoutes.js       # Routes for menu operations (/api/menu)
        ├── orderRoutes.js      # Routes for pre-ordering (/api/orders)
        ├── queueRoutes.js      # Routes for kitchen queue (/api/queue)
        ├── verifyRoutes.js     # Routes for token verification (/api/verify)
        ├── analyticsRoutes.js  # Routes for analytics & AI (/api/analytics)
        └── adminRoutes.js      # Routes for administrative tasks (/api/admin)
```

---

## 🗄️ Database Architecture & Firebase Integration

The database is built on **Firebase Firestore**.

### Key Collections:
1. **`users`**: Stores user credentials, roles (`customer`, `kitchen staff`, `canteen manager`, `administrator`), and profile status.
2. **`menu_items`**: Stores food items, categories, pricing, stock quantity, estimated prep time, and status (`Available`, `Limited`, `Sold Out`, `Temporarily Unavailable`).
3. **`orders`**: Stores pre-orders, items list, total price, pickup slot, digital token (`C-021`), status (`Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Collected` ➔ `Completed`), signed QR code image data, and timestamps.

### Out-of-the-Box Simulated Fallback Mode:
To ensure immediate execution and seamless demo testing without requiring Firebase credentials setup upfront, `src/config/firebase.js` includes an in-memory **Simulated Firestore Engine**. When `serviceAccountKey.json` is provided or ENV keys are set, it connects live to Firebase Firestore seamlessly!

---

## 🧠 Smart Queue & Intelligent Features

### 1. Dynamic Preparation Time Calculator (`queueService.js`)
Calculates estimated preparation time based on:
$$\text{Prep Time} = \max(\text{item prep times}) + ((\text{total items} - 1) \times 1.5) + (\text{kitchen active orders} \times 2.0)$$

### 2. Smart Kitchen Queue Prioritization Algorithm (`queueService.js`)
Kitchen Display System (KDS) automatically sorts orders by priority score:
- **Base Score:** $+1.5$ points per minute waiting in queue.
- **Delayed Order Boost:** $+50$ points if order preparation exceeds estimated ready time.
- **Pickup Slot Proximity:** $+35$ points if target pickup time is within 15 minutes.
- **Far Pickup Penalty:** $-40$ points if pickup time is $>35$ mins away (prevents cooking food too early!).

### 3. Predictive AI Features (`aiAnalyticsService.js`)
- **Food Demand Forecast:** Predicts portion demand per item for upcoming peak hours.
- **Peak-Time Prediction:** Identifies hourly volume spikes (e.g. 1:00 PM - 2:00 PM).
- **Order Delay Risk Prediction:** Calculates delay probability based on kitchen workload and staff capacity.
- **Pre-Cook Portion Recommendations:** Recommends pre-preparing high-demand sides (e.g., Fries, Soda) to reduce peak wait times by up to 30%.

### 4. Digital Token & QR Code Collection Verification (`tokenService.js` / `verifyController.js`)
- Generates readable digital tokens (`C-021`).
- Generates HMAC-SHA256 signed QR codes to prevent token fraud.
- **Double Collection Prevention:** Ensures an order cannot be scanned or collected twice.

---

## 🚀 How to Run the Backend

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Seed Initial Data:**
   ```bash
   npm run seed
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   ```
