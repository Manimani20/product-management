# Architecture — Product Management Application

This document describes the technical architecture of the Product Management Application. The goal is to keep it simple, understandable, and maintainable.

---

## Table of Contents

- [High-Level Overview](#high-level-overview)
- [System Architecture Diagram](#system-architecture-diagram)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow Diagrams](#data-flow-diagrams)
- [State Management](#state-management)
- [API Contract](#api-contract)
- [Error Handling Strategy](#error-handling-strategy)
- [Folder Responsibilities](#folder-responsibilities)
- [Key Design Decisions](#key-design-decisions)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                 │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    React Application                    │   │
│   │                                                         │   │
│   │   Pages ──► Components ──► Redux Store ──► Axios        │   │
│   └───────────────────────────────────────┬─────────────────┘   │
│                                           │  HTTP (port 5173)   │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                              REST API calls (JSON)
                              http://localhost:3000
                                            │
┌───────────────────────────────────────────┼─────────────────────┐
│                   NestJS Backend          │                     │
│                                           ▼                     │
│   Controller ──► Service ──► JSON File Reader/Writer            │
│                                           │                     │
│                              ┌────────────▼──────────┐          │
│                              │  data/products.json   │          │
│                              └───────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

The application is split into two independent processes:

| Layer | Technology | Port | Responsibility |
|---|---|---|---|
| Frontend | React + Vite | 5173 | UI, state management, user interactions |
| Backend | NestJS | 3000 | REST API, validation, data persistence |
| Data Store | JSON file | — | Stores product records on disk |

---

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                      │
│                                                                      │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐    │
│  │   main.tsx   │───►│              App.tsx                     │    │
│  │  (entry pt)  │    │   (Router + Theme + Redux Provider)      │    │
│  └──────────────┘    └─────────────────┬────────────────────────┘    │
│                                        │                             │
│                             ┌──────────▼──────────┐                 │
│                             │   ProductsPage.tsx   │                 │
│                             │   (main view)        │                 │
│                             └──────────┬───────────┘                 │
│                                        │ uses                        │
│              ┌─────────────────────────┼───────────────────┐         │
│              │                         │                   │         │
│   ┌──────────▼──────┐    ┌─────────────▼──────┐  ┌────────▼──────┐  │
│   │  ProductTable   │    │   ProductForm      │  │ DeleteConfirm │  │
│   │  (list + Edit   │    │   (Add / Edit      │  │ Dialog        │  │
│   │   Delete btns)  │    │    Dialog)         │  │               │  │
│   └─────────────────┘    └────────────────────┘  └───────────────┘  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                     Redux Toolkit Store                       │   │
│  │                                                               │   │
│  │   productSlice.ts                                             │   │
│  │   ┌─────────────────────────────────────────────────────┐    │   │
│  │   │  state: { products[], loading, error }               │    │   │
│  │   │  thunks: fetchProducts, addProduct,                  │    │   │
│  │   │          updateProduct, deleteProduct                 │    │   │
│  │   └─────────────────────────────────────────────────────┘    │   │
│  └────────────────────────────┬──────────────────────────────────┘   │
│                               │ dispatches / selects                 │
│  ┌────────────────────────────▼──────────────────────────────────┐   │
│  │                    services/productApi.ts                     │   │
│  │                    (Axios HTTP calls)                         │   │
│  └────────────────────────────┬──────────────────────────────────┘   │
└───────────────────────────────┼──────────────────────────────────────┘
                                │  REST over HTTP
                ────────────────▼────────────────
┌───────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                              │
│                                                                       │
│  ┌────────────┐    ┌──────────────────────┐   ┌────────────────────┐  │
│  │  main.ts   │───►│    AppModule         │──►│  ProductsModule    │  │
│  │  bootstrap │    │ (root NestJS module) │   └────────────────────┘  │
│  └────────────┘    └──────────────────────┘              │           │
│                                                           │           │
│                              ┌────────────────────────────▼─────┐    │
│                              │     ProductsController            │    │
│                              │  GET    /products                 │    │
│                              │  GET    /products/:id             │    │
│                              │  POST   /products                 │    │
│                              │  PUT    /products/:id             │    │
│                              │  DELETE /products/:id             │    │
│                              └────────────────────┬──────────────┘    │
│                                                   │ delegates to      │
│                              ┌────────────────────▼──────────────┐    │
│                              │     ProductsService               │    │
│                              │  findAll()                        │    │
│                              │  findOne(id)                      │    │
│                              │  create(dto)                      │    │
│                              │  update(id, dto)                  │    │
│                              │  remove(id)                       │    │
│                              │  readJson() / writeJson()         │    │
│                              └────────────────────┬──────────────┘    │
│                                                   │                   │
│                              ┌────────────────────▼──────────────┐    │
│                              │   data/products.json               │    │
│                              │   [ { id, name, price,            │    │
│                              │       category, description } ]   │    │
│                              └───────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Swagger UI  →  http://localhost:3000/api/docs                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Layer Responsibilities

```
main.tsx
 └─ App.tsx                  ← Redux Provider + MUI Theme + Router
     └─ ProductsPage.tsx      ← Fetches data, orchestrates UI
         ├─ ProductTable       ← Renders rows, emits edit/delete events
         ├─ ProductForm        ← Add/Edit form inside a MUI Dialog
         ├─ DeleteConfirmDialog← Confirmation before delete
         └─ Notification       ← Global Snackbar/Alert messages
```

### Component Communication

Components are kept stateless where possible. The page component (`ProductsPage`) holds local UI state (dialog open/close, selected product) and all server state lives in Redux.

```
User Action
    │
    ▼
Component dispatches Redux Thunk
    │
    ▼
Thunk calls productApi.ts (Axios)
    │
    ▼
API responds
    │
    ▼
Thunk resolves → Redux state updated
    │
    ▼
Component re-renders via useSelector
```

### State Shape

```typescript
interface ProductState {
  products: Product[];   // list of all products
  loading: boolean;      // true when any async operation is running
  error: string | null;  // error message to display, null if none
}
```

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
NestJS Global ValidationPipe
(validates DTO, rejects unknown properties)
    │
    ▼
ProductsController
(maps route to service method, applies decorators)
    │
    ▼
ProductsService
(business logic: find, create, update, remove)
    │
    ▼
readJson() / writeJson()
(reads/writes data/products.json synchronously)
    │
    ▼
HTTP Response
```

### Module Wiring

```
AppModule
  └─ ProductsModule
       ├─ ProductsController   (HTTP handlers)
       └─ ProductsService      (injectable service)
```

### DTO Validation Flow

```
POST /products  (raw JSON body)
    │
    ▼
NestJS ValidationPipe
    │  class-transformer: plainToInstance(CreateProductDto, body)
    │  class-validator:   validate(dto)
    │
    ├─ Valid   ──► ProductsController.create(dto)
    └─ Invalid ──► 400 Bad Request with error messages
```

---

## Data Flow Diagrams

### Fetch All Products

```
Browser loads app
    │
    ▼
ProductsPage mounts
    │  dispatch(fetchProducts())
    ▼
productSlice thunk
    │  productApi.getAll()
    ▼
GET /products  ──►  NestJS
                        │  service.findAll()
                        │  readJson()
                        ▼
                   products.json
                        │
                   ◄────┘ products[]
    │
    ▼
Redux state.products = [...]
    │
    ▼
ProductTable renders rows
```

---

### Add Product

```
User fills form + clicks Save
    │  dispatch(addProduct(formData))
    ▼
productSlice thunk
    │  productApi.create(formData)
    ▼
POST /products  ──►  NestJS
                          │  ValidationPipe
                          │  service.create(dto)
                          │  newId = max(existing ids) + 1
                          │  push to array
                          │  writeJson()
                          ▼
                     products.json (updated)
                          │
                     ◄────┘ newProduct
    │
    ▼
Redux state.products = [..., newProduct]
    │
    ▼
Dialog closes, Snackbar shows "Product added"
```

---

### Edit Product

```
User clicks Edit ──► Dialog opens (form pre-filled)
    │  dispatch(updateProduct({ id, data }))
    ▼
productSlice thunk
    │  productApi.update(id, data)
    ▼
PUT /products/:id  ──►  NestJS
                             │  service.update(id, dto)
                             │  find by id, merge fields
                             │  writeJson()
                             ▼
                        products.json (updated)
                             │
                        ◄────┘ updatedProduct
    │
    ▼
Redux state.products = products.map(replace by id)
    │
    ▼
Dialog closes, Snackbar shows "Product updated"
```

---

### Delete Product

```
User clicks Delete ──► Confirmation dialog
    │  User confirms
    │  dispatch(deleteProduct(id))
    ▼
productSlice thunk
    │  productApi.remove(id)
    ▼
DELETE /products/:id  ──►  NestJS
                                │  service.remove(id)
                                │  filter out by id
                                │  writeJson()
                                ▼
                           products.json (updated)
                                │
                           ◄────┘ 200 OK
    │
    ▼
Redux state.products = products.filter(p => p.id !== id)
    │
    ▼
Row removed from table, Snackbar shows "Product deleted"
```

---

## State Management

Redux Toolkit (`@reduxjs/toolkit`) is used for all server state.

### Why Redux Toolkit?

- Single source of truth for the product list
- Async thunks cleanly separate API logic from UI
- `createSlice` reduces boilerplate
- `useSelector` / `useDispatch` hooks keep components simple

### Slice Structure

```
productSlice
├── initialState          { products: [], loading: false, error: null }
├── extraReducers
│   ├── fetchProducts     pending / fulfilled / rejected
│   ├── addProduct        pending / fulfilled / rejected
│   ├── updateProduct     pending / fulfilled / rejected
│   └── deleteProduct     pending / fulfilled / rejected
└── (no sync reducers needed — all mutations go through the API)
```

### Async Thunks

```typescript
fetchProducts  ──► GET  /products         ──► sets products[]
addProduct     ──► POST /products         ──► appends to products[]
updateProduct  ──► PUT  /products/:id     ──► replaces in products[]
deleteProduct  ──► DELETE /products/:id   ──► removes from products[]
```

---

## API Contract

### Product Object

```typescript
interface Product {
  id: number;          // auto-generated by backend, never sent in POST body
  name: string;        // required
  price: number;       // required, positive
  category: string;    // required
  description: string; // optional
}
```

### Create DTO (POST body)

```typescript
interface CreateProductDto {
  name: string;        // required, not empty
  price: number;       // required, positive number
  category: string;    // required, not empty
  description?: string;// optional
}
```

### Update DTO (PUT body)

```typescript
// Same as CreateProductDto but all fields are optional (PartialType)
interface UpdateProductDto {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
}
```

---

## Error Handling Strategy

### Backend

| Scenario | Response |
|---|---|
| Product not found | `404 NotFoundException` |
| Invalid request body | `400 BadRequestException` (ValidationPipe) |
| Unexpected server error | `500 InternalServerErrorException` |

### Frontend

| Scenario | User-facing message |
|---|---|
| Fetch fails | "Failed to load products. Please try again." |
| Create fails | "Failed to add product. Please check your input." |
| Update fails | "Failed to update product. Please try again." |
| Delete fails | "Failed to delete product. Please try again." |
| 404 from API | "Product not found." |

All errors surface through MUI `Snackbar` + `Alert` with `severity="error"`.
All success messages surface with `severity="success"`.

---

## Folder Responsibilities

### Frontend

| Folder / File | What goes here |
|---|---|
| `components/` | Reusable UI pieces (table, form, dialogs, notifications) |
| `pages/` | Route-level components that compose smaller components |
| `store/` | Redux store config and all slices |
| `services/` | Axios API functions — the only place HTTP calls are made |
| `types/` | TypeScript interfaces shared across the app |

### Backend

| Folder / File | What goes here |
|---|---|
| `products/dto/` | Data Transfer Objects with validation decorators |
| `products.controller.ts` | Route definitions and HTTP handling only |
| `products.service.ts` | All business logic, JSON read/write |
| `products.module.ts` | NestJS dependency wiring |
| `data/products.json` | The actual data store |
| `test/` | Unit and e2e tests |

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| **Local JSON file instead of a database** | Keeps setup zero-dependency; suitable for learning apps |
| **Redux Toolkit over plain useState** | Demonstrates real-world state management pattern |
| **NestJS over Express** | Structured, modular, mirrors enterprise patterns |
| **MUI over custom CSS** | Consistent, accessible, production-grade components out of the box |
| **No auth** | Out of scope; keeps focus on CRUD patterns |
| **No Docker** | Intentionally simple; just `npm run dev` is enough |
| **Numeric IDs** | Simple auto-increment; no UUID library needed |
| **`PartialType` for UpdateDto** | Avoids duplicating field definitions |
| **Global ValidationPipe** | Validates all incoming requests automatically |
| **CORS enabled for localhost:5173** | Allows Vite dev server to call NestJS |
