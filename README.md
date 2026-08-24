# ExpenseFlow

A full-stack personal expense tracker built with React, Node.js, Express, and MongoDB.

Built as a practical learning project to compare **Intent-Based Development (IDD)** and **Spec-Driven Development (SDD)**.

---

## Features

- Add, edit, and delete expenses
- Search expenses by title
- Filter by category
- Sort by date or amount
- Dashboard with summary cards, category breakdown, and monthly bar chart
- Responsive sidebar layout
- Loading, empty, and error states throughout
- Full validation on both frontend and backend
- React Error Boundary for unhandled UI errors
- 72 automated tests (unit + integration)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| HTTP Client | Axios |
| Testing | Jest, Supertest |

---

## Architecture

```
User
 ↓
React UI (Vite + Tailwind)
 ↓
API Service (Axios)
 ↓
Express Routes
 ↓
Controllers → Services → Repositories
 ↓
MongoDB Atlas (Mongoose)
```

### Backend Layers

| Layer | Responsibility |
|-------|---------------|
| Routes | Map HTTP method + URL to controller |
| Controllers | Extract request data, call service, send response |
| Services | Business logic, validation, error handling |
| Repositories | All MongoDB queries |
| Models | Mongoose schemas |

---

## Folder Structure

```
expense-flow/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/       Sidebar, Header
│       │   ├── ui/           SummaryCard, BarChart, EmptyState, LoadingState, ErrorMessage, ErrorBoundary
│       │   ├── expenses/     ExpenseForm, ExpenseItem, ExpenseList, DeleteModal
│       │   └── filters/      SearchBar, FilterBar
│       ├── hooks/            useDebounce
│       ├── pages/            Dashboard, Expenses, Categories, Reports, Settings
│       ├── services/         api.js, expenseService.js
│       ├── constants/        categories, colours, sort options
│       ├── App.jsx
│       └── main.jsx
│
└── backend/
    └── src/
        ├── config/           db.js (MongoDB connection)
        ├── controllers/      expenseController.js
        ├── middleware/       errorHandler.js
        ├── models/           Expense.js
        ├── repositories/     expenseRepository.js
        ├── routes/           expenseRoutes.js
        ├── services/         expenseService.js
        ├── utils/            AppError.js
        ├── __tests__/        expenseService.test.js, expenseApi.test.js
        ├── app.js
        └── server.js
```

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- A MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/connect2lakshya00-blip/Expense-tracker-.git
cd Expense-tracker-
```

### 2. Backend setup

```bash
cd backend
```

Install dependencies:
```bash
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install
# or if npm works normally on your machine:
npm install
```

Create your environment file:
```bash
copy .env.example .env
```

Edit `.env` and add your MongoDB Atlas connection string:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expenseflow?retryWrites=true&w=majority
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

---

## Running the Application

You need **two terminals** running simultaneously.

**Terminal 1 — Backend:**
```bash
cd backend
node src/server.js
```

Expected output:
```
MongoDB connected: <your-atlas-host>
ExpenseFlow server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
node_modules\.bin\vite.cmd         # Windows
# or
npx vite                            # Mac/Linux
```

Then open **http://localhost:3000** in your browser.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |

Never commit `.env` — it is in `.gitignore`. Use `.env.example` as a template.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses` | Get all expenses |
| GET | `/api/expenses/stats` | Dashboard statistics |
| GET | `/api/expenses/:id` | Get single expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Query Parameters for GET /api/expenses

| Parameter | Values | Description |
|-----------|--------|-------------|
| `search` | any string | Filter by title (case-insensitive) |
| `category` | Food, Transport, Shopping, Entertainment, Bills, Education, Health, Other | Filter by category |
| `sort` | newest, oldest, highest, lowest | Sort order |

### Example Requests

**Create expense:**
```json
POST /api/expenses
{
  "title": "Dinner",
  "amount": 450,
  "category": "Food",
  "date": "2026-08-23",
  "description": "Dinner with friends"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "title": "Dinner",
    "amount": 450,
    "category": "Food",
    "date": "2026-08-23T00:00:00.000Z",
    "description": "Dinner with friends",
    "createdAt": "2026-08-23T10:00:00.000Z",
    "updatedAt": "2026-08-23T10:00:00.000Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Server Error |

---

## Testing

```bash
cd backend

# Run all tests (unit + integration)
npm test

# Unit tests only — no database required, fast
npm run test:unit

# Integration tests only — requires Atlas connection
npm run test:api
```

### Test Coverage

| Suite | Tests | Type |
|-------|-------|------|
| `expenseService.test.js` | 34 | Unit — business logic, no DB |
| `expenseApi.test.js` | 38 | Integration — real HTTP + Atlas |
| **Total** | **72** | |

---

## Expense Categories

Food · Transport · Shopping · Entertainment · Bills · Education · Health · Other

---

## Development Methodology

This project was built twice to compare two development approaches.

### Phase 1 — Intent-Based Development (IDD)

Built incrementally through conversation, one stage at a time:

- Stage 1: Understand the architecture
- Stage 2: Project setup
- Stage 3: Backend foundation + health check
- Stage 4: MongoDB connection + Expense model
- Stage 5: Repository layer
- Stage 6: Service layer
- Stage 7: Controller layer
- Stage 8: Routes + API integration
- Stage 9: React frontend (mock data)
- Stage 10: Connect frontend to backend API
- Stage 11: Validation + error handling
- Stage 12: Dashboard calculations + bar chart
- Stage 13: Search, filtering + sorting with URL sync
- Stage 14: Automated test suite (72 tests)
- Stage 15: Final cleanup + documentation

**IDD characteristics:**
- Built and explained one layer at a time
- Verified at each stage before moving forward
- Beginner-friendly — every concept explained before implementation
- Flexible — can pivot at any stage

### Phase 2 — Spec-Driven Development (SDD)

The same application rebuilt starting from formal specifications:

- Requirements with acceptance criteria
- Design document (architecture, API contract, data model)
- Task list derived from specs
- Implementation only after specs are approved
- Tests derived from acceptance criteria

**SDD characteristics:**
- Specifications become the source of truth
- No implementation without a matching requirement
- Better for teams — everyone works from the same spec
- Less flexible mid-build — spec changes require formal updates

### IDD vs SDD Comparison

| Dimension | IDD | SDD |
|-----------|-----|-----|
| Planning upfront | Minimal | Extensive |
| Beginner-friendly | High | Medium |
| Team coordination | Harder | Easier |
| Flexibility mid-build | High | Lower |
| Documentation quality | Emergent | Planned |
| Requirement traceability | Manual | Built-in |
| Best for | Solo / learning / prototypes | Teams / production / regulated domains |

Neither approach is universally better. IDD is excellent for exploration and learning. SDD is excellent when requirements are stable and multiple people need to work from the same understanding.

---

## Screenshots

> Add screenshots here after running the application.

- Dashboard with summary cards and bar chart
- Expenses page with search and filters
- Add expense form
- Delete confirmation modal

---

## License

MIT
