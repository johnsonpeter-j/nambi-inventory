# Nambi Inventory

A comprehensive yarn inventory management system built with Next.js, MongoDB, and Redux. This application helps manage yarn stock, track in/out entries, monitor lot numbers, and maintain party and category information.

## Features

### 🔐 Authentication & User Management
- User registration via email invitation
- Secure login with JWT authentication
- Password reset functionality
- User profile management
- Automatic default user creation on startup

### 📦 Inventory Management
- **Yarn In Entry**: Record incoming yarn stock with lot numbers, categories, parties, boxes, and weights
- **Yarn Out Entry**: Track outgoing yarn with automatic available quantity calculation
- **Dashboard**: View inventory grouped by category and lot number with real-time available quantities
- **Lot Detail View**: Detailed transaction history for each lot number

### 🏷️ Master Data Management
- **Yarn Category**: Manage yarn categories with weight per box, number of cones, and descriptions
- **Party Management**: CRUD operations for parties (suppliers/customers) with contact information

### 📊 Dashboard & Analytics
- Category-wise inventory overview with accordion UI
- Real-time available weight calculations (Total In - Total Out)
- Lot number tracking with available and total weights
- Transaction history for each lot number
- Responsive card-based UI for mobile and desktop

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Dark mode support
- Custom date pickers with month/year selection
- Custom dropdown components
- Toast notifications for user feedback
- Material Symbols icons
- Fully responsive layout (mobile, tablet, desktop)

### 🔄 State Management
- Redux Toolkit for global state
- React hooks for local state
- Axios for API communication

## Tech Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **UI Icons**: Material Symbols

## Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- SMTP email account (Gmail, SendGrid, etc.) for email functionality

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/nambi-inventory
   
   # Default User (will receive registration invitation)
   DEFAULT_USER_EMAIL=admin@example.com
   
   # JWT Secret (use a strong random string in production)
   JWT_SECRET=your-secret-key-change-in-production
   
   # SMTP Configuration (for email invitations and password reset)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM_NAME=Nambi Inventory
   SMTP_FROM_EMAIL=your-email@gmail.com
   
   # Frontend URL (for email links)
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**
   - On first startup, the app will automatically send a registration invitation to `DEFAULT_USER_EMAIL`
   - Check your email and complete the registration
   - Sign in with your credentials

## Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── signin/          # Sign in page
│   │   ├── register/        # Registration page
│   │   ├── forgot-password/ # Forgot password page
│   │   └── reset-password/  # Reset password page
│   ├── (main)/              # Main application pages (protected)
│   │   ├── dashboard/       # Dashboard with category/lot view
│   │   │   └── [lotNumber]/ # Lot detail page
│   │   ├── yarn-in/        # Yarn in entry page
│   │   ├── yarn-out/       # Yarn out entry page
│   │   ├── master/         # Master data pages
│   │   │   ├── yarn-category/ # Yarn category management
│   │   │   └── party/        # Party management
│   │   └── layout.tsx       # Main layout with sidebar
│   ├── api/                 # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── party/           # Party CRUD endpoints
│   │   ├── yarn-category/   # Yarn category CRUD endpoints
│   │   ├── yarn-in-entry/   # Yarn in entry endpoints
│   │   └── yarn-ex-entry/   # Yarn out entry endpoints
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home/redirect page
├── components/
│   ├── common/              # Shared components
│   │   ├── CustomDatePicker.tsx
│   │   ├── CustomSelect.tsx
│   │   ├── AuthCheck.tsx
│   │   └── StartupCheck.tsx
│   ├── login/               # Login components
│   ├── register/            # Registration components
│   ├── party/               # Party components
│   └── yarn-category/      # Yarn category components
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── jwt.ts              # JWT utilities
│   ├── email.ts            # Email utilities
│   ├── db.ts               # Database helpers
│   ├── api-auth.ts         # API authentication
│   └── axios.ts            # Axios instance
├── models/                 # Mongoose models
│   ├── User.ts
│   ├── Party.ts
│   ├── YarnCategory.ts
│   ├── YarnInEntry.ts
│   └── YarnExEntry.ts
├── store/                  # Redux store
│   ├── slices/
│   └── store.ts
└── hooks/                  # Custom hooks
    ├── useAuth.ts
    └── useToast.ts
```

## Database Models

### User
- Email (unique, indexed)
- Name
- Password (hashed with bcrypt)
- Profile picture URL
- Timestamps

### Party
- Name
- Mobile Number
- Email ID
- Created By
- Timestamps

### YarnCategory
- Name (indexed)
- Description (optional)
- Number of Cones (default: 6)
- Weight Per Box (default: 36 kg, 2-3 decimal places)
- Created By
- Timestamps

### YarnInEntry
- Entry Date (indexed)
- Name (optional)
- Category ID (reference to YarnCategory)
- Lot Number (indexed)
- Purchase Date
- Party ID (reference to Party)
- Number of Boxes
- Weight in Kg
- Created By
- Timestamps

### YarnExEntry
- Entry Date (indexed)
- Category ID (reference to YarnCategory)
- Lot Number (indexed)
- Taking Weight in Kg
- Created By
- Timestamps

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/invite` - Send registration invitation
- `POST /api/auth/register` - Complete registration with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/validate-token` - Validate JWT token
- `GET /api/auth/verify` - Verify authentication
- `GET /api/auth/check-default-user` - Check default user (startup)

### Party Management
- `GET /api/party` - List all parties
- `POST /api/party` - Create new party
- `GET /api/party/[id]` - Get party by ID
- `PUT /api/party/[id]` - Update party
- `DELETE /api/party/[id]` - Delete party

### Yarn Category Management
- `GET /api/yarn-category` - List all categories
- `POST /api/yarn-category` - Create new category
- `GET /api/yarn-category/[id]` - Get category by ID
- `PUT /api/yarn-category/[id]` - Update category
- `DELETE /api/yarn-category/[id]` - Delete category

### Yarn In Entry
- `GET /api/yarn-in-entry` - List all in entries
- `POST /api/yarn-in-entry` - Create new in entry
- `GET /api/yarn-in-entry/[id]` - Get entry by ID
- `PUT /api/yarn-in-entry/[id]` - Update entry
- `DELETE /api/yarn-in-entry/[id]` - Delete entry
- `GET /api/yarn-in-entry/available-lots?categoryId={id}` - Get available lots for category

### Yarn Out Entry
- `GET /api/yarn-ex-entry` - List all out entries
- `POST /api/yarn-ex-entry` - Create new out entry
- `GET /api/yarn-ex-entry/[id]` - Get entry by ID
- `PUT /api/yarn-ex-entry/[id]` - Update entry
- `DELETE /api/yarn-ex-entry/[id]` - Delete entry

## Key Features Explained

### Yarn In Entry
- Automatic weight calculation based on category's `weightPerBox` × number of boxes
- Manual weight override available
- Date pickers for entry date (today, non-editable) and purchase date (editable)
- Dropdown selection for category and party
- Validation for weight (max 3 decimal places)

### Yarn Out Entry
- Dynamic lot number dropdown based on selected category
- Shows available boxes and weight for each lot
- Automatic calculation of available quantities
- Prevents taking more weight than available
- Validation for taking weight (max 3 decimal places)

### Dashboard
- Category-wise accordion view (expanded by default)
- Shows available weight and total weight for each category
- Lot number cards with available and total weights
- Click on lot card to view detailed transaction history
- Real-time calculations based on in/out entries

### Lot Detail Page
- Summary cards: Total Weight, Available Weight, Total Transactions
- Card-based display of all in entries with party, dates, boxes, and weights
- Card-based display of all out entries with dates and taking weights
- Responsive design for mobile and desktop
- Back navigation to dashboard

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `DEFAULT_USER_EMAIL` | Email for default user invitation | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_USER` | SMTP username | Yes |
| `SMTP_PASSWORD` | SMTP password/app password | Yes |
| `SMTP_FROM_NAME` | Email sender name | Yes |
| `SMTP_FROM_EMAIL` | Email sender address | Yes |
| `FRONTEND_URL` | Frontend URL for email links | Yes |

## Authentication Flow

1. **Startup**: App checks if `DEFAULT_USER_EMAIL` exists in database
2. **If not found**: Automatically sends registration invitation email
3. **User clicks link**: Redirects to `/register?token={jwt_token}`
4. **User completes registration**: Account created with password
5. **User can sign in**: Using email and password
6. **Password reset**: User can request password reset via email

## Inventory Calculation Logic

- **Total Weight**: Sum of all `weightInKg` from in-entries for a lot
- **Available Weight**: Total Weight - Sum of all `takingWeightInKg` from out-entries
- **Available Boxes**: Calculated based on weight ratio (Available Weight / Average Weight Per Box)

## License

MIT
