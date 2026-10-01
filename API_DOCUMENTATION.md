# 🚀 Smart Canteen Pre-Order & Queue Management System - API Documentation

Welcome to the **Smart Canteen Backend API**. This document contains all endpoints, authentication procedures, payload structures, and example responses for integrating your frontend application.

---

## 🌐 Server Base URL
- **Local Dev Base URL:** `http://localhost:5000/api`
- **Health Check Endpoint:** `GET http://localhost:5000/api/health`

---

## 🔑 Authentication & Roles

### Header Requirement:
Include the authorization token in your requests for protected endpoints:
```http
Authorization: Bearer <YOUR_JWT_OR_FIREBASE_ID_TOKEN>
Content-Type: application/json
```

### Supported User Roles:
1. `customer` / `Student / Employee`
2. `kitchen staff` / `staff`
3. `canteen manager` / `manager`
4. `administrator` / `admin`

---

## 1️⃣ Auth Endpoints (`/api/auth`)

### 🔹 1. Register User
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex@university.edu",
  "role": "customer" 
}
```
*(Roles: `customer`, `kitchen staff`, `canteen manager`, `administrator`)*

- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "user_id": "usr_1727732941",
    "name": "Alex Johnson",
    "email": "alex@university.edu",
    "role": "customer",
    "account_status": "active"
  }
}
```

---

### 🔹 2. User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Body:**
```json
{
  "email": "customer@canteen.com"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "user_id": "usr_cust1",
    "name": "Alex Johnson",
    "email": "customer@canteen.com",
    "role": "customer"
  }
}
```

---

### 🔹 3. Get User Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`

---

## 2️⃣ Menu & Stock Endpoints (`/api/menu`)

### 🔹 1. Get All Menu Items
- **Method:** `GET`
- **Endpoint:** `/api/menu?category=Burgers&available_only=true`
- **Query Params (Optional):**
  - `category`: Filter by category (`Burgers`, `Beverages`, `Snacks`, `Meals`)
  - `search`: Search by name or description
  - `available_only`: `true` / `false`
- **Response `200 OK`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "item_id": "item_burger_1",
      "item_name": "Classic Chicken Burger",
      "category": "Burgers",
      "price": 450,
      "available_quantity": 12,
      "preparation_time": 8,
      "status": "Available",
      "image": "https://images.unsplash.com/...",
      "description": "Grilled chicken patty with fresh lettuce and spicy sauce."
    }
  ]
}
```

---

### 🔹 2. Create Menu Item *(Manager/Admin)*
- **Method:** `POST`
- **Endpoint:** `/api/menu`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "item_name": "Triple Cheese Pizza Slice",
  "category": "Meals",
  "price": 300,
  "available_quantity": 20,
  "preparation_time": 6,
  "description": "Crispy baked pizza with mozzarella, cheddar, and parmesan."
}
```

---

### 🔹 3. Update Menu Item / Stock *(Manager/Admin)*
- **Method:** `PUT`
- **Endpoint:** `/api/menu/item_burger_1`
- **Body:**
```json
{
  "price": 480,
  "available_quantity": 15
}
```

---

### 🔹 4. Quick Toggle Item Status *(Staff/Manager/Admin)*
- **Method:** `PATCH`
- **Endpoint:** `/api/menu/item_burger_1/status`
- **Body:**
```json
{
  "status": "Sold Out"
}
```
*(Status options: `Available`, `Limited`, `Sold Out`, `Temporarily Unavailable`)*

---

## 3️⃣ Pre-Ordering & Order Pipeline (`/api/orders`)

### 🔹 1. Place Pre-Order
- **Method:** `POST`
- **Endpoint:** `/api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "items": [
    { "item_id": "item_burger_1", "quantity": 1, "special_instruction": "No pickles please" },
    { "item_id": "item_fries_1", "quantity": 1 }
  ],
  "pickup_time": "12:30 - 12:45 PM",
  "payment_method": "Online"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "order_id": "ord_1727733500",
    "customer_id": "usr_cust1",
    "token_number": "C-024",
    "items": [ ... ],
    "total_amount": 650,
    "order_time": "2026-10-01T07:00:00.000Z",
    "pickup_time": "12:30 - 12:45 PM",
    "estimated_prep_time": 10,
    "estimated_ready_time": "2026-10-01T07:10:00.000Z",
    "order_status": "Placed",
    "payment_status": "Paid",
    "qr_code_image": "data:image/png;base64,iVBORw0KGgoAAA...",
    "qr_raw_data": {
      "order_id": "ord_1727733500",
      "token_number": "C-024",
      "customer_id": "usr_cust1",
      "signature": "a8f3...d92"
    }
  }
}
```

---

### 🔹 2. Get Orders / Order History
- **Method:** `GET`
- **Endpoint:** `/api/orders?status=Preparing`
- **Headers:** `Authorization: Bearer <token>`

---

### 🔹 3. Update Order Status *(Kitchen Staff / Manager)*
- **Method:** `PATCH`
- **Endpoint:** `/api/orders/ord_1727733500/status`
- **Body:**
```json
{
  "status": "Preparing" 
}
```
*(Status Pipeline: `Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Collected` ➔ `Completed`)*

---

### 🔹 4. Cancel Pre-Order *(Customer)*
- **Method:** `POST`
- **Endpoint:** `/api/orders/ord_1727733500/cancel`
- **Body:**
```json
{
  "reason": "Class schedule changed"
}
```

---

## 4️⃣ Live Digital Queue & Pickup Slots (`/api/queue`)

### 🔹 1. Get Live Kitchen Queue (KDS) *(Staff/Manager)*
- **Method:** `GET`
- **Endpoint:** `/api/queue`
- **Headers:** `Authorization: Bearer <token>`
- **Description:** Returns live active orders automatically sorted by smart priority engine (taking into account waiting duration, scheduled pickup slot proximity, quick prep bonus, and delay boosts).

---

### 🔹 2. Get Scheduled Pickup Slots Availability
- **Method:** `GET`
- **Endpoint:** `/api/queue/slots`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "slot_name": "12:00 - 12:15 PM",
      "max_limit": 20,
      "current_orders": 5,
      "available_slots": 15,
      "status": "Available"
    },
    {
      "slot_name": "12:30 - 12:45 PM",
      "max_limit": 20,
      "current_orders": 20,
      "available_slots": 0,
      "status": "Full"
    }
  ]
}
```

---

## 5️⃣ Token Verification & Collection (`/api/verify`)

### 🔹 1. Verify Digital Token or QR Code Payload *(Staff)*
- **Method:** `POST`
- **Endpoint:** `/api/verify/token`
- **Body:**
```json
{
  "token_number": "C-021"
}
```
*OR with scanned QR payload:*
```json
{
  "qr_data": {
    "order_id": "ord_demo_21",
    "token_number": "C-021",
    "customer_id": "usr_cust1",
    "signature": "a8f3..."
  }
}
```

---

### 🔹 2. Confirm Handover / Collection *(Staff)*
- **Method:** `POST`
- **Endpoint:** `/api/verify/collect`
- **Body:**
```json
{
  "token_number": "C-021"
}
```
- **Description:** Marks order status as `Completed` and records `collected_at` timestamp. Prevents duplicate collection!

---

## 6️⃣ Analytics & AI Insights (`/api/analytics`)

### 🔹 1. Canteen Executive Dashboard *(Manager/Admin)*
- **Method:** `GET`
- **Endpoint:** `/api/analytics/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total_orders_today": 186,
    "current_active_orders": 12,
    "orders_preparing": 8,
    "orders_ready": 4,
    "completed_orders": 155,
    "cancelled_orders": 15,
    "total_sales_amount": 42500,
    "average_prep_time_minutes": 11,
    "most_ordered_food": "Classic Chicken Burger (84 sold)",
    "least_ordered_food": "Zesty Chicken Wrap (12 sold)",
    "peak_ordering_time": "1:00 PM - 2:00 PM"
  }
}
```

---

### 🔹 2. AI Predictive Analytics & Insights *(Manager/Admin)*
- **Method:** `GET`
- **Endpoint:** `/api/analytics/predictions`
- **Headers:** `Authorization: Bearer <token>`
- **Returns:**
  - Peak-Time predictions & hourly load
  - Food demand forecasts & pre-cook portion recommendations
  - Order delay probability predictions
  - AI executive insights summary

---

## 7️⃣ Admin Management (`/api/admin`)

- `GET /api/admin/users`: View all registered users
- `PATCH /api/admin/users/:id/role`: Change user role (`customer`, `staff`, `manager`, `admin`)
- `GET /api/admin/logs`: System logs & notification history
