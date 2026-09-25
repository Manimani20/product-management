# Development Phases — Product Management Application

This document breaks the full implementation into **10 incremental phases**. Each phase builds on the previous one and produces a working, testable result. Follow the phases in order.

---

## Overview

```
Phase 1  ──► Project scaffolding (monorepo, folder structure)
Phase 2  ──► NestJS backend bootstrap (module, CORS, Swagger)
Phase 3  ──► Product data model + JSON storage layer
Phase 4  ──► REST API endpoints (CRUD)
Phase 5  ──► DTO validation + error handling
Phase 6  ──► React frontend scaffold (Vite, MUI, Router)
Phase 7  ──► Redux Toolkit store + productSlice
Phase 8  ──► Frontend UI — product list, add, edit, delete
Phase 9  ──► Frontend ↔ Backend integration + loading & error states
Phase 10 ──► Backend tests + final polish + README verification
```

---

## Phase 1 — Project Scaffolding

**Goal:** Create the monorepo folder structure with both projects initialized.

### Tasks

- [ ] Create root folder `product-management/`
- [ ] Create `README.md`, `ARCHITECTURE.md`, `DEVELOPMENT_PHASES.md` at root
- [ ] Scaffold NestJS backend using the NestJS CLI or manually:
  - `npm install -g @nestjs/cli`
  - `nest new backend` inside `product-management/`
  - Select `npm` as package manager
- [ ] Scaffold React frontend using Vite:
  - `npm create vite@latest frontend -- --template react-ts`
- [ ] Verify both projects start independently without errors
- [ ] Create `backend/data/` folder
- [ ] Create initial `backend/data/products.json` with empty array `[]`

### Deliverables

```
product-management/
├── README.md
├── ARCHITECTURE.md
├── DEVELOPMENT_PHASES.md
├── frontend/           ← Vite React TypeScript app (default template)
└── backend/            ← NestJS app (default Hello World template)
```

### Verification

```bash
# Backend should print "Application is running on: http://localhost:3000"
cd backend && npm run start:dev

# Frontend should open http://localhost:5173 with default Vite page
cd frontend && npm run dev
```

---

## Phase 2 — NestJS Backend Bootstrap

**Goal:** Configure the NestJS app with CORS, Swagger, ValidationPipe, and global prefix.

### Tasks

- [ ] Install Swagger dependencies:
  ```bash
  npm install @nestjs/swagger swagger-ui-express
  ```
- [ ] Install validation dependencies:
  ```bash
  npm install class-validator class-transformer
  ```
- [ ] Update `main.ts`:
  - Enable CORS (allow origin: `http://localhost:5173`)
  - Set global prefix (optional — keep it clean at root)
  - Register global `ValidationPipe` with:
    - `whitelist: true` (strip unknown properties)
    - `forbidNonWhitelisted: true` (reject unknown properties)
    - `transform: true` (auto-convert types)
  - Configure Swagger:
    - Title: `Product Management API`
    - Description: `REST APIs for managing products`
    - Version: `1.0`
    - Mount at `/api/docs`
- [ ] Verify Swagger UI is accessible at `http://localhost:3000/api/docs`

### Deliverables

```
backend/src/
└── main.ts    ← CORS + ValidationPipe + Swagger configured
```

### Verification

```bash
cd backend && npm run start:dev
# Open http://localhost:3000/api/docs → Swagger UI should load
```

---

## Phase 3 — Product Data Model + JSON Storage Layer

**Goal:** Define the Product type and implement the JSON read/write helpers inside the service.

### Tasks

- [ ] Create `backend/data/products.json` with sample data:
  ```json
  [
    { "id": 1, "name": "iPhone 17", "price": 79999, "category": "Electronics", "description": "Apple smartphone" },
    { "id": 2, "name": "Nike Air Max", "price": 5999, "category": "Footwear", "description": "Running shoes" },
    { "id": 3, "name": "Kindle Paperwhite", "price": 12999, "category": "Electronics", "description": "E-reader by Amazon" }
  ]
  ```
- [ ] Create `backend/src/products/` folder
- [ ] Create `backend/src/products/products.module.ts`
- [ ] Create `backend/src/products/products.service.ts` with:
  - `Product` interface (id, name, price, category, description)
  - `readJson()` private method — reads and parses `products.json`; returns `[]` if file doesn't exist
  - `writeJson(products: Product[])` private method — writes back to `products.json` with pretty-print
- [ ] Register `ProductsModule` in `AppModule`
- [ ] Write a quick manual test by calling `service.findAll()` in the constructor (remove after test)

### Deliverables

```
backend/
├── src/
│   ├── products/
│   │   ├── products.module.ts
│   │   └── products.service.ts   ← Product interface + readJson/writeJson
│   └── app.module.ts             ← ProductsModule imported
└── data/
    └── products.json             ← Sample data
```

### Verification

- NestJS starts without errors
- `data/products.json` is readable

---

## Phase 4 — REST API Endpoints (CRUD)

**Goal:** Implement all five REST endpoints and wire them into the controller.

### Tasks

- [ ] Create `backend/src/products/products.controller.ts` with routes:
  - `GET /products` → `findAll()`
  - `GET /products/:id` → `findOne(id)`
  - `POST /products` → `create(dto)`
  - `PUT /products/:id` → `update(id, dto)`
  - `DELETE /products/:id` → `remove(id)`
- [ ] Implement service methods:
  - `findAll()` → return all products
  - `findOne(id: number)` → find by id, throw `NotFoundException` if missing
  - `create(dto)` → auto-generate new id (max id + 1), push, write
  - `update(id, dto)` → find, merge fields, write, return updated product
  - `remove(id)` → find, filter out, write, return success message
- [ ] Register controller in `ProductsModule`
- [ ] Add `@ApiTags('Products')` and `@ApiOperation` decorators to document endpoints in Swagger
- [ ] Use correct HTTP decorators: `@HttpCode(204)` or return message for DELETE

### Deliverables

```
backend/src/products/
├── products.controller.ts   ← All 5 routes
├── products.service.ts      ← All 5 service methods + JSON helpers
└── products.module.ts       ← Controller + Service registered
```

### Verification

```bash
cd backend && npm run start:dev

# Test using curl or Swagger UI at http://localhost:3000/api/docs
curl http://localhost:3000/products
curl http://localhost:3000/products/1
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":100,"category":"Test","description":"Test item"}'
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price":89999}'
curl -X DELETE http://localhost:3000/products/4
```

---

## Phase 5 — DTO Validation + Error Handling

**Goal:** Add proper input validation using DTOs and ensure consistent error responses.

### Tasks

- [ ] Create `backend/src/products/dto/create-product.dto.ts`:
  - `@IsString() @IsNotEmpty() name`
  - `@IsNumber() @IsPositive() price`
  - `@IsString() @IsNotEmpty() category`
  - `@IsString() @IsOptional() description`
  - Add `@ApiProperty` decorators for Swagger
- [ ] Create `backend/src/products/dto/update-product.dto.ts`:
  - Use `PartialType(CreateProductDto)` from `@nestjs/swagger`
- [ ] Apply DTOs in the controller (`@Body() dto: CreateProductDto`)
- [ ] Verify `ValidationPipe` rejects:
  - Missing required fields → `400`
  - Unknown fields → `400`
  - Negative price → `400`
  - Non-existent product id → `404`
- [ ] Add `@ApiResponse` decorators on all controller methods (200, 201, 400, 404)

### Deliverables

```
backend/src/products/dto/
├── create-product.dto.ts   ← Validated + Swagger-documented
└── update-product.dto.ts   ← PartialType of create
```

### Verification

```bash
# Should return 400
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"price":-1}'

# Should return 404
curl http://localhost:3000/products/9999
```

---

## Phase 6 — React Frontend Scaffold

**Goal:** Set up the React frontend with MUI theme, routing, and project structure.

### Tasks

- [ ] Install frontend dependencies:
  ```bash
  cd frontend
  npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
  npm install axios react-router-dom
  npm install @reduxjs/toolkit react-redux
  ```
- [ ] Create `.env` file:
  ```
  VITE_API_BASE_URL=http://localhost:3000
  ```
- [ ] Create folder structure:
  ```
  src/
  ├── components/
  ├── pages/
  ├── store/
  ├── services/
  └── types/
  ```
- [ ] Create `src/types/product.ts` with `Product` interface
- [ ] Set up MUI theme in `App.tsx` (use default theme for simplicity)
- [ ] Set up React Router in `App.tsx` with a single route `/` → `ProductsPage`
- [ ] Create a skeleton `ProductsPage.tsx` that renders "Products Page coming soon"
- [ ] Verify the frontend starts and shows the skeleton page

### Deliverables

```
frontend/
├── .env                     ← VITE_API_BASE_URL
├── src/
│   ├── types/product.ts     ← Product interface
│   ├── pages/ProductsPage.tsx ← Skeleton
│   └── App.tsx              ← MUI ThemeProvider + Router
```

### Verification

```bash
cd frontend && npm run dev
# Browser shows "Products Page coming soon" at http://localhost:5173
```

---

## Phase 7 — Redux Toolkit Store + productSlice

**Goal:** Set up the Redux store and implement all async thunks for product CRUD.

### Tasks

- [ ] Create `src/services/productApi.ts`:
  - `getAll()` → `GET /products`
  - `getById(id)` → `GET /products/:id`
  - `create(data)` → `POST /products`
  - `update(id, data)` → `PUT /products/:id`
  - `remove(id)` → `DELETE /products/:id`
  - Create Axios instance using `import.meta.env.VITE_API_BASE_URL`
- [ ] Create `src/store/productSlice.ts`:
  - `ProductState` interface
  - `initialState`
  - `createAsyncThunk` for: `fetchProducts`, `addProduct`, `updateProduct`, `deleteProduct`
  - `extraReducers` handling `pending` / `fulfilled` / `rejected` for each thunk
- [ ] Create `src/store/store.ts`:
  - Configure Redux store with `productSlice` reducer
  - Export `RootState` and `AppDispatch` types
  - Export typed `useAppSelector` and `useAppDispatch` hooks
- [ ] Wrap app in `<Provider store={store}>` in `main.tsx`
- [ ] Verify no TypeScript errors

### Deliverables

```
frontend/src/
├── services/productApi.ts     ← Axios calls
└── store/
    ├── store.ts               ← Redux store
    └── productSlice.ts        ← State + thunks
```

### Verification

- TypeScript compiles without errors
- Redux DevTools (browser extension) shows the `products` state slice

---

## Phase 8 — Frontend UI Components

**Goal:** Build all UI components — product table, add/edit form, delete dialog, notifications.

### Tasks

- [ ] Create `src/components/Notification.tsx`:
  - Props: `open`, `message`, `severity`, `onClose`
  - Uses MUI `Snackbar` + `Alert`
- [ ] Create `src/components/LoadingSpinner.tsx`:
  - Shows centered `CircularProgress` with message
- [ ] Create `src/components/DeleteConfirmDialog.tsx`:
  - Props: `open`, `productName`, `onConfirm`, `onCancel`
  - Uses MUI `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions`
  - Shows product name in the confirmation text
- [ ] Create `src/components/ProductForm.tsx`:
  - Props: `open`, `product` (for edit, null for add), `onSubmit`, `onClose`, `loading`
  - Fields: Name, Price, Category, Description
  - Uses MUI `TextField`, `Select`, `MenuItem`, `Button`
  - Pre-fills fields when editing
  - Validates required fields before submit
  - Disables submit button while `loading`
- [ ] Create `src/components/ProductTable.tsx`:
  - Displays product list in MUI `Table`
  - Columns: Name, Price (₹ formatted), Category, Description, Actions
  - Action buttons: Edit (pencil icon), Delete (trash icon)
  - Shows loading state (`CircularProgress`) when fetching
  - Shows empty state message when no products
- [ ] Build out `src/pages/ProductsPage.tsx`:
  - MUI `AppBar` with title "Product Management"
  - "Add Product" button
  - `ProductTable`
  - Manages dialog open/close state
  - Manages selected product for edit/delete

### Deliverables

```
frontend/src/
├── components/
│   ├── Notification.tsx
│   ├── LoadingSpinner.tsx
│   ├── DeleteConfirmDialog.tsx
│   ├── ProductForm.tsx
│   └── ProductTable.tsx
└── pages/
    └── ProductsPage.tsx
```

### Verification

- UI renders without errors (API calls will fail since no integration yet — that's OK)
- Form opens and closes correctly
- Table renders with mock/empty data

---

## Phase 9 — Frontend ↔ Backend Integration

**Goal:** Connect all Redux thunks to the UI. Add loading states, success messages, and error handling.

### Tasks

- [ ] Connect `ProductsPage` to Redux:
  - `useAppDispatch` to dispatch thunks
  - `useAppSelector` to read `products`, `loading`, `error`
  - Dispatch `fetchProducts()` on mount (`useEffect`)
- [ ] Wire up "Add Product" flow:
  - `ProductForm` submits → dispatch `addProduct(data)` → close dialog → show success Snackbar
- [ ] Wire up "Edit Product" flow:
  - Edit button → open `ProductForm` pre-filled → submit → dispatch `updateProduct` → close → success Snackbar
- [ ] Wire up "Delete Product" flow:
  - Delete button → open `DeleteConfirmDialog` → confirm → dispatch `deleteProduct(id)` → close → success Snackbar
- [ ] Handle errors:
  - Display error Snackbar when `state.error` is set
  - Clear error after dismissal
- [ ] Handle loading:
  - Show `CircularProgress` in table while `loading` is true
  - Disable form submit button while saving
  - Disable delete confirm button while deleting
- [ ] Verify end-to-end:
  - Add a product → appears in list
  - Edit a product → list updates
  - Delete a product → row disappears

### Verification

```bash
# Both must be running simultaneously
cd backend && npm run start:dev   # Terminal 1
cd frontend && npm run dev        # Terminal 2

# Open http://localhost:5173
# - Product list loads
# - Add, edit, delete all work
# - products.json updates on each change
# - Error messages appear on API failure
```

---

## Phase 10 — Tests, Polish + Final Verification

**Goal:** Add backend unit tests, clean up code, verify everything works end-to-end.

### Tasks

#### Backend Tests

- [ ] Create `backend/test/products.service.spec.ts`:
  - Mock `fs` module (use `jest.mock`)
  - Test `findAll()` returns all products
  - Test `findOne(id)` returns correct product
  - Test `findOne(id)` throws `NotFoundException` for missing id
  - Test `create(dto)` adds product with auto-generated id
  - Test `update(id, dto)` updates correct fields
  - Test `update(id, dto)` throws `NotFoundException` for missing id
  - Test `remove(id)` removes the product
  - Test `remove(id)` throws `NotFoundException` for missing id

- [ ] (Optional) Create `backend/test/products.e2e.spec.ts`:
  - Use NestJS `Test.createTestingModule` + `supertest`
  - Test each endpoint returns correct status codes
  - Test POST with invalid body returns 400
  - Test GET non-existent product returns 404

#### Polish

- [ ] Add `@ApiProperty` examples to DTOs (improves Swagger UI)
- [ ] Format price as `₹X,XXX` in the frontend table
- [ ] Add category options as a `Select` dropdown (Electronics, Footwear, Clothing, Books, Other)
- [ ] Trim whitespace from form inputs before submitting
- [ ] Add `aria-label` attributes to icon buttons for accessibility
- [ ] Ensure the app handles `products.json` missing (first run with no file)
- [ ] Verify `npm run build` succeeds for the frontend
- [ ] Review and clean up any `any` types

#### Final Checklist

- [ ] `GET /products` returns all products
- [ ] `POST /products` creates a product and saves to JSON
- [ ] `PUT /products/:id` updates and saves to JSON
- [ ] `DELETE /products/:id` removes from JSON
- [ ] Invalid body returns `400` with messages
- [ ] Missing product returns `404`
- [ ] Swagger UI at `/api/docs` documents all endpoints
- [ ] Frontend shows loading spinner while fetching
- [ ] Frontend shows success message after add/edit/delete
- [ ] Frontend shows error message on API failure
- [ ] Redux DevTools shows correct state transitions
- [ ] All unit tests pass: `npm run test`
- [ ] TypeScript builds without errors: `npm run build`
- [ ] README accurately reflects how to install and run the project

### Verification

```bash
# Backend tests
cd backend
npm run test
# All tests should pass

# Frontend build check
cd frontend
npm run build
# Should complete without errors

# Run both together
cd backend && npm run start:dev   # Terminal 1
cd frontend && npm run dev        # Terminal 2
# Full app works at http://localhost:5173
```

---

## Phase Summary Table

| Phase | Focus | Outcome |
|---|---|---|
| 1 | Scaffolding | Empty NestJS + React projects created |
| 2 | NestJS bootstrap | CORS, Swagger, ValidationPipe configured |
| 3 | Data model + JSON storage | Product type + readJson/writeJson helpers |
| 4 | REST API | All 5 CRUD endpoints working |
| 5 | Validation + errors | DTOs, 400/404 responses, Swagger docs |
| 6 | React scaffold | MUI, Router, env variables, folder structure |
| 7 | Redux Toolkit | Store, slice, thunks, API service layer |
| 8 | UI components | Table, Form, Delete dialog, Notifications |
| 9 | Full integration | Frontend talks to backend, all flows wired |
| 10 | Tests + polish | Unit tests pass, build succeeds, UI polished |

---

## Estimated Time

| Phase | Estimated Time |
|---|---|
| Phase 1 — Scaffolding | 15 min |
| Phase 2 — NestJS bootstrap | 20 min |
| Phase 3 — Data model + storage | 20 min |
| Phase 4 — REST APIs | 30 min |
| Phase 5 — Validation + errors | 20 min |
| Phase 6 — React scaffold | 20 min |
| Phase 7 — Redux + API service | 40 min |
| Phase 8 — UI components | 60 min |
| Phase 9 — Integration | 30 min |
| Phase 10 — Tests + polish | 40 min |
| **Total** | **~5 hours** |

---

## Notes for Developers

- **Stick to the phases.** Each phase has a clear boundary. Do not jump ahead.
- **Commit after each phase.** This makes it easy to roll back if something breaks.
- **Test as you go.** Each phase ends with a verification step — do not skip it.
- **Keep it simple.** Resist the urge to add features not in the spec.
- **Read the architecture doc** before starting Phase 3 to understand how the pieces connect.
