# Product Management Application

A simple full-stack web application for managing products — built with React on the frontend and NestJS on the backend, using a local JSON file as the data store.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [API Endpoints](#api-endpoints)
- [Example Requests](#example-requests)
- [Environment Variables](#environment-variables)

---

## Project Overview

This application provides a clean interface to manage a list of products. It supports:

- **View** all products in a table
- **Add** a new product via a form dialog
- **Edit** an existing product
- **Delete** a product with confirmation
- **View** details of a product

There is no authentication, no database, and no external services. All product data is stored in `backend/data/products.json`. The app is intentionally kept simple so it is easy to understand and extend.

---

## Technologies

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool and dev server |
| **TypeScript** | Type safety |
| **Redux Toolkit (RTK)** | Global state management |
| **Material UI (MUI v5)** | Component library and styling |
| **Axios** | HTTP client for API calls |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Purpose |
|---|---|
| **NestJS** | Node.js framework |
| **TypeScript** | Type safety |
| **class-validator** | DTO validation |
| **class-transformer** | Object transformation |
| **Swagger (OpenAPI)** | API documentation |
| **Local JSON file** | Data storage |

---

## Project Structure

```
product-management/
├── README.md
├── ARCHITECTURE.md
├── DEVELOPMENT_PHASES.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductTable.tsx       # Main product list table
│   │   │   ├── ProductForm.tsx        # Add / Edit form dialog
│   │   │   ├── DeleteConfirmDialog.tsx# Delete confirmation dialog
│   │   │   ├── Notification.tsx       # Snackbar / Alert wrapper
│   │   │   └── LoadingSpinner.tsx     # Loading indicator
│   │   ├── pages/
│   │   │   └── ProductsPage.tsx       # Main products page
│   │   ├── store/
│   │   │   ├── store.ts               # Redux store setup
│   │   │   └── productSlice.ts        # Product state + async thunks
│   │   ├── services/
│   │   │   └── productApi.ts          # Axios API calls
│   │   ├── types/
│   │   │   └── product.ts             # Product interface / types
│   │   ├── App.tsx                    # Root app component + routing
│   │   └── main.tsx                   # Entry point
│   ├── .env                           # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/
    ├── src/
    │   ├── products/
    │   │   ├── dto/
    │   │   │   ├── create-product.dto.ts
    │   │   │   └── update-product.dto.ts
    │   │   ├── products.controller.ts  # REST endpoints
    │   │   ├── products.service.ts     # Business logic + JSON I/O
    │   │   └── products.module.ts      # NestJS module
    │   ├── app.module.ts               # Root module
    │   └── main.ts                     # Bootstrap + Swagger + CORS
    ├── data/
    │   └── products.json               # Local data store
    ├── test/
    │   ├── products.service.spec.ts    # Unit tests
    │   └── products.e2e.spec.ts        # E2E tests
    ├── package.json
    └── tsconfig.json
```

---

## Installation

### Prerequisites

- Node.js 18+ ([https://nodejs.org](https://nodejs.org))
- npm 9+ (comes with Node.js)

### 1. Clone / Open the project

```bash
cd product-management
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the Application

### Start the backend (NestJS)

```bash
cd backend
npm run start:dev
```

The backend starts at: **http://localhost:3000**

### Start the frontend (Vite + React)

Open a second terminal:

```bash
cd frontend
npm run dev
```

The frontend starts at: **http://localhost:5173**

Open your browser and navigate to **http://localhost:5173**.

---

## API Documentation (Swagger)

Once the backend is running, visit:

```
http://localhost:3000/api/docs
```

Swagger UI lets you:
- Browse all available endpoints
- See request/response schemas
- Test API calls directly from the browser

---

## API Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/products` | Get all products | `200` |
| `GET` | `/products/:id` | Get product by ID | `200` / `404` |
| `POST` | `/products` | Create a new product | `201` |
| `PUT` | `/products/:id` | Update a product | `200` / `404` |
| `DELETE` | `/products/:id` | Delete a product | `200` / `404` |

### Response: `GET /products`

```json
[
  {
    "id": 1,
    "name": "iPhone 17",
    "price": 79999,
    "category": "Electronics",
    "description": "Apple smartphone"
  },
  {
    "id": 2,
    "name": "Nike Air Max",
    "price": 5999,
    "category": "Footwear",
    "description": "Running shoes"
  }
]
```

### Response: `GET /products/:id`

```json
{
  "id": 1,
  "name": "iPhone 17",
  "price": 79999,
  "category": "Electronics",
  "description": "Apple smartphone"
}
```

---

## Example Requests

### Create a Product — `POST /products`

**Request body:**
```json
{
  "name": "MacBook Pro",
  "price": 150000,
  "category": "Electronics",
  "description": "Apple laptop with M3 chip"
}
```

**Response `201`:**
```json
{
  "id": 4,
  "name": "MacBook Pro",
  "price": 150000,
  "category": "Electronics",
  "description": "Apple laptop with M3 chip"
}
```

---

### Update a Product — `PUT /products/4`

**Request body:**
```json
{
  "name": "MacBook Pro M4",
  "price": 175000,
  "category": "Electronics",
  "description": "Apple laptop with M4 chip"
}
```

**Response `200`:**
```json
{
  "id": 4,
  "name": "MacBook Pro M4",
  "price": 175000,
  "category": "Electronics",
  "description": "Apple laptop with M4 chip"
}
```

---

### Delete a Product — `DELETE /products/4`

**Response `200`:**
```json
{
  "message": "Product with id 4 deleted successfully"
}
```

---

### Validation Error — `POST /products` (missing fields)

**Response `400`:**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "price must be a positive number",
    "category should not be empty"
  ],
  "error": "Bad Request"
}
```

---

### Not Found — `GET /products/999`

**Response `404`:**
```json
{
  "statusCode": 404,
  "message": "Product with id 999 not found",
  "error": "Not Found"
}
```

---

## Environment Variables

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

All API calls use this variable. Do not hardcode the backend URL anywhere else in the frontend code.

---

## Running Tests

### Backend unit tests

```bash
cd backend
npm run test
```

### Backend e2e tests

```bash
cd backend
npm run test:e2e
```

### Watch mode

```bash
cd backend
npm run test:watch
```

---

## Notes

- The `backend/data/products.json` file is the only data store. Deleting it resets all products. The backend recreates it automatically if it is missing.
- The backend runs on port **3000** and the frontend runs on port **5173** by default.
- CORS is enabled on the backend to allow the Vite dev server origin.
