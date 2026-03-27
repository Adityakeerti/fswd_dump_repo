# 📚 Pustak Tracker — Complete Project Documentation

## Project Overview

**Pustak Tracker** is a full-stack Library Management System with:
- **Backend**: Flask (Python) REST API + Web Routes
- **Frontend**: React + TypeScript + Vite (Modern SPA)
- **Mobile**: Flutter App (Android)
- **Database**: MySQL

---

## 🎯 Team Division (4 Parts)

---

# PART 1: FRONTEND - USER INTERFACE & PAGES (Sameer)

## Responsibility
All user-facing pages, routing, and page-level components in the React frontend.

## Files & Components

### 📄 Core Pages (`frontend/src/pages/`)

#### 1. **Landing.tsx**
- Landing page with hero section
- Features showcase
- Call-to-action buttons
- Responsive design with animations

#### 2. **Login.tsx** & **SignUp.tsx**
- Authentication forms
- Email/password validation
- Integration with auth store
- Error handling and feedback

#### 3. **Dashboard.tsx**
- Main analytics dashboard
- KPI cards (Books Checked Out, Overdue, Active Patrons, Inventory %)
- Charts: Monthly Circulation (Line Chart), Top Categories (Bar Chart)
- Recent transactions table
- Due soon books list
- Uses Recharts library for visualizations

#### 4. **Books.tsx**
- Complete book catalog management
- Search and filter functionality
- Add/Edit/Delete book modals
- Book listing with pagination
- Category assignment
- ISBN and barcode management
- Available vs Total copies display

#### 5. **Transactions.tsx**
- Transaction history view
- Filter by status: All, Issued, Returned, Overdue
- Patron and book details
- Fine amount display
- Date tracking (Issue, Due, Return)
- Status badges with color coding

#### 6. **Users.tsx**
- Patron/User management
- Add new patrons
- Toggle active/suspended status
- Delete users with validation
- Role management (Librarian/Patron)
- Search functionality
- Avatar initials display

#### 7. **Categories.tsx**
- Book category management
- Add/Edit/Delete categories
- Category descriptions
- Book count per category

#### 8. **Overdue.tsx**
- Overdue books tracking
- Fine calculation display
- Patron contact information
- Days overdue counter
- Priority sorting

#### 9. **Scanner.tsx** ⭐ (Mobile-optimized)
- Barcode scanner using Quagga.js
- Real-time camera feed
- Book lookup by barcode
- Transaction status display
- Mobile-first responsive design
- WebSocket connection status
- Book availability checking

### 🎨 Styling & Design
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **Lucide React** for icons
- Custom glass-morphism effects
- Dark mode support
- Gradient accents (Teal, Cyan, Indigo)

### 🔄 Routing (`App.tsx`)
- React Router v6 implementation
- Protected routes with authentication
- Mobile detection for Scanner page
- Layout wrappers (GlobalShell, MobileOnlyShell)
- Redirect handling

### 📦 Key Dependencies
```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "framer-motion": "^11.15.0",
  "lucide-react": "^0.468.0",
  "recharts": "^2.15.0",
  "quagga": "^0.12.1",
  "zustand": "^5.0.2"
}
```

### 🎯 Learning Outcomes
- React functional components & hooks
- TypeScript interfaces and types
- State management with Zustand
- Form handling and validation
- Responsive design patterns
- Animation libraries
- Chart/data visualization
- Barcode scanning integration

---

# PART 2: FRONTEND - STATE MANAGEMENT & COMPONENTS (Vridhi)

## Responsibility
State management, reusable UI components, authentication logic, and data flow.

## Files & Components

### 🗄️ State Management (`frontend/src/state/`)

#### 1. **backendStore.ts** (Main Store)
- Zustand store with all application state
- Mock data for development
- CRUD operations for all entities
- Selectors for computed data

**State Slices:**
```typescript
- books: Book[]
- categories: Category[]
- patrons: Patron[]
- transactions: Transaction[]
- kpis: Dashboard KPIs
- dueSoon: Due soon books
- recentTransactions: Recent activity
```

**Actions:**
- `addBook`, `updateBook`, `deleteBook`
- `addCategory`, `deleteCategory`
- `addPatron`, `setPatronStatus`, `deletePatron`
- `issueBook`, `returnBook`
- `loadMockData`

#### 2. **authStore.ts**
- Authentication state management
- Login/logout functionality
- User session persistence
- Role-based access control

```typescript
interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}
```

#### 3. **themeStore.ts**
- Dark/light mode toggle
- Theme persistence in localStorage
- System preference detection

#### 4. **store.ts**
- Central export point for all stores

### 🧩 Reusable Components (`frontend/src/components/`)

#### **UI Components** (`components/ui/`)

1. **Modal.tsx**
   - Reusable modal dialog
   - Backdrop with blur effect
   - Custom header and footer
   - Close on escape/backdrop click
   - Framer Motion animations

2. **Input.tsx**
   - Styled form input
   - Label support
   - Type variants (text, email, password, number)
   - Dark mode compatible

3. **IssueReturnButtons.tsx**
   - Quick action buttons
   - Issue book modal
   - Return book modal
   - Form validation
   - Dropdown selectors for users/books

#### **Auth Components** (`components/auth/`)

1. **RequireAuth.tsx**
   - Protected route wrapper
   - Authentication check
   - Redirect to login if unauthenticated
   - Role-based access control

#### **Layout Components** (`components/layout/`)

1. **GlobalShell.tsx**
   - Main application layout
   - Sidebar navigation
   - Header with user menu
   - Responsive drawer for mobile
   - Theme toggle
   - Logout functionality

2. **MobileOnlyShell.tsx**
   - Minimal layout for mobile scanner
   - Back navigation
   - Optimized for camera view

3. **Sidebar.tsx**
   - Navigation menu
   - Active route highlighting
   - Icons for each section
   - Collapsible on mobile

### 🎨 Utilities (`frontend/src/lib/`)

#### **format.ts**
- Date formatting helpers
- Currency formatting (INR)
- Number formatting
- Consistent display across app

```typescript
export function formatDate(date: string | Date): string
export function formatINR(amount: number): string
export function formatRelativeTime(date: Date): string
```

### 🔐 Authentication Flow
1. User enters credentials
2. `authStore.login()` validates
3. Session stored in localStorage
4. `RequireAuth` checks on route access
5. Redirect to dashboard or login

### 📊 Data Flow Pattern
```
User Action → Component → Store Action → State Update → UI Re-render
```

### 🎯 Learning Outcomes
- Advanced state management (Zustand)
- Component composition patterns
- Props and children patterns
- Custom hooks creation
- TypeScript generics
- Local storage integration
- Authentication patterns
- Reusable component design

---

# PART 3: BACKEND - BASIC ROUTES & DATABASE (Megha) - EASIER PART

## Responsibility
Database models, basic CRUD routes, and simple business logic.

## Files & Components

### 🗄️ Database Models (`backend/app/models.py`)

All SQLAlchemy ORM models with relationships:

#### 1. **User Model**
```python
class User(db.Model):
    - id, name, email, password_hash
    - role: 'user' or 'librarian'
    - is_active: Boolean
    - Relationships: transactions, reservations, fines, notifications
    - Methods: set_password(), check_password(), to_dict()
```

#### 2. **Category Model**
```python
class Category(db.Model):
    - id, name, description
    - Relationships: books
    - Methods: to_dict()
```

#### 3. **Book Model**
```python
class Book(db.Model):
    - id, title, author, publisher, isbn, barcode_id
    - category_id (Foreign Key)
    - total_copies, available_copies
    - Relationships: transactions, reservations
    - Methods: to_dict(), is_available()
```

#### 4. **Transaction Model**
```python
class Transaction(db.Model):
    - id, user_id, book_id
    - issue_date, due_date, return_date
    - fine_amount, status ('issued', 'returned', 'overdue')
    - Methods: calculate_fine(), return_book(), to_dict()
```

#### 5. **Reservation Model**
```python
class Reservation(db.Model):
    - id, user_id, book_id
    - status ('pending', 'cancelled', 'fulfilled')
```

#### 6. **Fine Model**
```python
class Fine(db.Model):
    - id, user_id, amount, reason, date, status
```

#### 7. **Notification Model**
```python
class Notification(db.Model):
    - id, user_id, title, body, type, seen
```

### 🛣️ Basic Routes

#### **Categories Routes** (`backend/app/routes/categories.py`)

1. **GET /categories**
   - List all categories
   - Render categories page

2. **POST /categories/add**
   - Add new category
   - Form validation
   - Flash messages

3. **POST /categories/<id>/delete**
   - Delete category
   - Check for associated books
   - Prevent deletion if books exist

#### **Users Routes** (`backend/app/routes/users.py`)

1. **GET /users**
   - List all users with pagination
   - Search functionality
   - Role filtering

2. **POST /users/add**
   - Create new user
   - Email uniqueness check
   - Password hashing
   - Role assignment

3. **POST /users/<id>/delete**
   - Delete user
   - Check for active transactions
   - Prevent librarian deletion

4. **POST /users/<id>/toggle**
   - Activate/deactivate user
   - Status toggle

5. **GET /users/json**
   - JSON endpoint for dropdowns
   - Active users only

#### **Books Routes** (`backend/app/routes/books.py`)

1. **GET /books**
   - List all books with pagination
   - Search by title, author, ISBN
   - Category filtering

2. **POST /books/add**
   - Add new book
   - Form validation
   - Set initial available copies

3. **POST /books/<id>/edit**
   - Update book details
   - Adjust available copies logic
   - Category reassignment

4. **POST /books/<id>/delete**
   - Delete book
   - Check for active transactions
   - Prevent deletion if issued

### 🔧 Configuration & Setup

#### **config.py**
```python
class Config:
    - DATABASE_URL
    - SECRET_KEY
    - SQLALCHEMY settings
    - CORS configuration
```

#### **extensions.py**
```python
- db (SQLAlchemy)
- csrf (CSRF Protection)
- cors (CORS)
```

#### **forms.py**
- WTForms for validation
- BookForm, CategoryForm, UserForm
- IssueBookForm, ReturnBookForm

### 📦 Database Setup

#### **migrate.sql**
- Database schema creation
- Table definitions
- Indexes for performance

#### **seed_books.sql**
- Sample book data
- Initial categories
- Test users

### 🎯 Learning Outcomes
- SQLAlchemy ORM basics
- Database relationships (One-to-Many, Foreign Keys)
- CRUD operations
- Form validation with WTForms
- Flask routing basics
- Password hashing (werkzeug.security)
- Database migrations
- SQL basics

---

# PART 4: BACKEND - ADVANCED LOGIC & SERVICES (Aditya)

## Responsibility
Complex business logic, transaction management, scanner integration, and services.

## Files & Components

### 🔄 Transaction Management (`backend/app/routes/transactions.py`)

#### 1. **GET /dashboard**
- Calculate and display KPIs
- Recent transactions (last 10)
- Due soon books (next 3 days)
- Update overdue fines automatically
- Dashboard statistics

#### 2. **GET /transactions**
- List all transactions with pagination
- Status filtering (issued, returned, overdue)
- Populate dropdowns for issue/return forms
- Fine calculation on load

#### 3. **POST /transactions/issue**
- Issue book to user
- Validate book availability
- Check for existing active transactions
- Set due date (default 14 days)
- Decrease available copies
- Create transaction record

#### 4. **POST /transactions/return**
- Return book
- Calculate fine if overdue
- Update book availability
- Mark transaction as returned
- Fine calculation logic

#### 5. **GET /overdue**
- List overdue transactions
- Sort by due date
- Display fine amounts
- Pagination support

#### 6. **POST /overdue/recalculate**
- Recalculate all overdue fines
- Update transaction records
- Bulk fine calculation

### 📱 Scanner Integration (`backend/app/routes/scanner.py`)

#### 1. **GET /mobile_scanner.html**
- Serve mobile scanner HTML
- Standalone scanner page

#### 2. **GET /scan**
- Render scanner page
- Camera integration

#### 3. **GET /api/barcode/<barcode>**
- Look up book by barcode/ISBN
- Return book details
- Availability status
- Clean barcode input (remove hyphens, spaces)

#### 4. **POST /quick-scan** ⭐ (Complex Logic)
- Handle multiple scan types:
  - **Book Scan** (starts with "BOOK"): Check availability
  - **User Scan** (7-digit number): Show active transactions
  - **Regular Book ID** (number): Book lookup
- Return appropriate action (checkout, return, unavailable)
- Transaction history for users
- Days overdue calculation
- CSRF exempt for mobile

**Scan Logic Flow:**
```python
if scan_value.startswith('BOOK'):
    → Extract book ID
    → Check availability
    → Return checkout action
elif scan_value is 7-digit number:
    → Look up user
    → Get active transactions
    → Return return action with transaction list
elif scan_value is number:
    → Look up book by ID
    → Check availability
else:
    → Return error
```

### 🛠️ Business Services (`backend/app/services/`)

#### **book_service.py**

1. **issue_book(user_id, book_id, due_date)**
   - Atomic book checkout
   - Race condition prevention
   - SQL UPDATE with WHERE condition
   - Duplicate transaction check
   - Due date handling (timezone-aware)
   - Transaction creation

```python
# Atomic decrement prevents race conditions
result = db.session.execute(
    "UPDATE books SET available_copies = available_copies - 1 
     WHERE id = :id AND available_copies > 0",
    {"id": book_id}
)
if result.rowcount == 0:
    return False, "Book not available (concurrent checkout)"
```

2. **return_book(transaction_id)**
   - Mark book as returned
   - Calculate fine
   - Increment available copies
   - Update transaction status

#### **fine_service.py**

1. **calculate_overdue_fines()**
   - Bulk fine calculation
   - Iterate all issued/overdue transactions
   - Update fine amounts
   - Return count of updated transactions

2. **Fine Calculation Logic**
```python
if return_date:
    if return_date > due_date:
        overdue_days = (return_date - due_date).days
        fine = overdue_days * FINE_RATE (₹5/day)
else:
    if now > due_date:
        overdue_days = (now - due_date).days
        fine = overdue_days * FINE_RATE
        status = 'overdue'
```

#### **stats_service.py**

1. **get_dashboard_stats()**
   - Books checked out count
   - Overdue count
   - Total fines
   - Active patrons
   - Inventory percentage
   - Monthly circulation trend
   - Top categories

### 🔐 Authentication & Security (`backend/app/routes/auth.py`)

1. **POST /login**
   - Email/password validation
   - Password hash verification
   - Session creation
   - Role-based redirect

2. **POST /logout**
   - Clear session
   - Redirect to login

3. **POST /signup**
   - New user registration
   - Email uniqueness check
   - Password hashing
   - Auto-login after signup

### 🛡️ Decorators (`backend/app/decorators.py`)

1. **@login_required**
   - Check session for user_id
   - Redirect to login if not authenticated

2. **@librarian_web_required**
   - Check for librarian role
   - Restrict access to admin features

3. **@debug_only**
   - Only allow in DEBUG mode
   - Development endpoints

### 🔧 Utilities (`backend/app/utils.py`)

- `issue_book()` - Wrapper for book_service
- `return_book()` - Wrapper for book_service
- `calculate_overdue_fines()` - Wrapper for fine_service
- `update_all_transaction_fines()` - Update all fines
- `get_dashboard_stats()` - Wrapper for stats_service

### 📡 API Configuration

#### **run.py**
- Flask app initialization
- SSL certificate setup
- Local IP detection
- Port configuration
- Debug mode handling
- Shell context processor

### 🎯 Learning Outcomes
- Complex business logic implementation
- Transaction management
- Race condition handling
- Atomic database operations
- Fine calculation algorithms
- Date/time handling (timezone-aware)
- Session management
- Decorator patterns
- Service layer architecture
- API endpoint design
- Error handling
- Security best practices

---

## 🔗 Integration Points

### Frontend ↔ Backend Communication

1. **Authentication**
   - Frontend: `authStore.login()` → Backend: `POST /login`
   - Session stored in cookies

2. **Book Management**
   - Frontend: `addBook()` → Backend: `POST /books/add`
   - Frontend: `updateBook()` → Backend: `POST /books/<id>/edit`

3. **Transaction Flow**
   - Frontend: Issue modal → Backend: `POST /transactions/issue`
   - Backend: Atomic book decrement → Database update
   - Frontend: State update → UI refresh

4. **Scanner Integration**
   - Frontend: Quagga.js barcode detection
   - Frontend: `POST /quick-scan` with barcode
   - Backend: Parse scan type → Return action
   - Frontend: Display book/user info

### Database Flow
```
User Action → Flask Route → Service Layer → SQLAlchemy ORM → MySQL Database
                                                                      ↓
UI Update ← Frontend State ← JSON Response ← Business Logic ← Query Result
```

---

## 🚀 Technology Stack Summary

### Frontend (Parts 1 & 2)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Quagga.js** - Barcode scanning

### Backend (Parts 3 & 4)
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **MySQL** - Database
- **WTForms** - Form validation
- **Werkzeug** - Password hashing
- **Flask-CORS** - CORS handling
- **Python 3.x** - Programming language

### Mobile (Not in 4 parts)
- **Flutter** - Mobile framework
- **Dart** - Programming language

---

## 📊 Database Schema

```
users
├── id (PK)
├── name
├── email (UNIQUE)
├── password_hash
├── role
└── is_active

categories
├── id (PK)
├── name (UNIQUE)
└── description

books
├── id (PK)
├── title
├── author
├── isbn (UNIQUE)
├── barcode_id (UNIQUE)
├── category_id (FK → categories)
├── total_copies
└── available_copies

transactions
├── id (PK)
├── user_id (FK → users)
├── book_id (FK → books)
├── issue_date
├── due_date
├── return_date
├── fine_amount
└── status

reservations
├── id (PK)
├── user_id (FK → users)
├── book_id (FK → books)
└── status

fines
├── id (PK)
├── user_id (FK → users)
├── amount
├── reason
└── status

notifications
├── id (PK)
├── user_id (FK → users)
├── title
├── body
└── seen
```

---

## 🎓 Key Concepts by Part

### Part 1 (Sameer) - Frontend Pages
- React components
- Routing
- Form handling
- Data visualization
- Responsive design

### Part 2 (Vridhi) - Frontend State
- State management
- Component composition
- Authentication
- Reusable components
- Data flow

### Part 3 (Megha) - Backend Basics
- Database models
- CRUD operations
- Form validation
- Basic routing
- SQL relationships

### Part 4 (Aditya) - Backend Advanced
- Business logic
- Transaction management
- Complex queries
- Service architecture
- API design

---

## 📝 Setup Instructions

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Configure .env with database credentials
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```bash
mysql -u root -p
CREATE DATABASE pustak_tracker;
USE pustak_tracker;
SOURCE migrate.sql;
SOURCE seed_books.sql;
```

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Librarian | librarian@pustak.com | admin123 |
| User | john@example.com | password123 |

---

## 📱 Features Summary

✅ User authentication (Login/Signup)
✅ Book catalog management (CRUD)
✅ Category management
✅ User/Patron management
✅ Issue/Return books
✅ Fine calculation (₹5/day)
✅ Overdue tracking
✅ Dashboard with analytics
✅ Barcode scanner (Mobile)
✅ Transaction history
✅ Search and filters
✅ Dark mode
✅ Responsive design

---

## 🎯 Learning Objectives Achieved

- Full-stack web development
- RESTful API design
- Database design and relationships
- State management patterns
- Authentication and authorization
- Business logic implementation
- Mobile-responsive design
- Real-time features (Scanner)
- Data visualization
- Modern development tools

---

**End of Documentation**
