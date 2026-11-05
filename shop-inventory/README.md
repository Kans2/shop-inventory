# Shop Inventory: Full Stack App

Stock management for small shops. **Next.js 14** frontend, **Node.js + Express + MongoDB (Mongoose)** backend in **MVC** structure, JWT authentication.

## Features
- Register / login (each shop only sees its own data)
- Product CRUD with SKU (unique per shop), category, price, low-stock alert level
- Stock in / stock out with notes; stock can never go below zero (atomic update)
- Full stock movement history
- Dashboard: total products, units, stock value, low-stock list, recent changes, value by category (MongoDB aggregation)
- Search + category + "low stock only" filters

## Run it

### Backend
```bash
cd backend
npm install
cp .env.example .env     # set MONGO_URI and a long random JWT_SECRET
npm run seed             # optional demo data: demo@shop.com / demo123
npm run dev              # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev              # http://localhost:3000
```
Currency is Indian rupees; change it in `frontend/lib/format.js` (and the "Price (₹)" label in `ProductForm.js`).

## Backend structure (MVC)
```
backend/
├── server.js
├── seed.js
└── src/
    ├── app.js
    ├── config/db.js
    ├── models/            # M: User, Product, StockMovement
    ├── controllers/       # C: auth, product (+stock), dashboard
    ├── routes/            # URL -> controller mapping
    ├── middleware/        # auth (JWT), errorHandler
    └── utils/             # asyncHandler, httpError
```

## API
All routes except register/login need `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create shop account |
| POST | /api/auth/login | Log in, returns token |
| GET | /api/auth/me | Current user |
| GET | /api/products?q=&category=&lowStock=true | List / filter products |
| GET | /api/products/categories | Distinct categories |
| POST | /api/products | Create product (optional opening `quantity`) |
| GET / PUT / DELETE | /api/products/:id | Read / update / delete |
| POST | /api/products/:id/stock | `{ type: "in"\|"out", quantity, note }` |
| GET | /api/products/:id/movements | Stock history for a product |
| GET | /api/dashboard | Stats, low-stock items, recent changes |
