# Nambi Inventory

Inventory management system built with Next.js, MongoDB, and Redux.

## Features

- 🔐 Authentication (Sign in, Register, Forgot Password, Reset Password)
- 📧 Email invitations with beautiful HTML templates
- 🗄️ MongoDB database with Mongoose
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- 🔔 Toast notifications
- 🔄 Redux state management

## Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- SMTP email account (Gmail, SendGrid, etc.)

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/inventory
   DEFAULT_USER_EMAIL=admin@example.com
   JWT_SECRET=your-secret-key
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
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

## Environment Variables

See `SETUP.md` for complete environment variable documentation.

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── common/          # Shared components
│   ├── login/           # Login components
│   ├── register/        # Registration components
│   └── ...
├── lib/
│   ├── db.ts            # Database utilities
│   ├── mongodb.ts       # MongoDB connection
│   ├── jwt.ts           # JWT utilities
│   └── email.ts         # Email utilities
├── models/
│   └── User.ts          # User Mongoose model
├── store/
│   ├── slices/          # Redux slices
│   └── store.ts         # Redux store
└── hooks/
    ├── useAuth.ts       # Auth hook
    └── useToast.ts      # Toast hook
```

## Authentication Flow

1. **Startup**: App checks if `DEFAULT_USER_EMAIL` exists in DB
2. **If not**: Automatically sends registration invitation email
3. **User clicks link**: Goes to `/register?token={jwt_token}`
4. **User completes registration**: Account created
5. **User can sign in**: Using email and password

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/invite` - Send registration invitation
- `POST /api/auth/register` - Complete registration with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/validate-token` - Validate JWT token
- `GET /api/auth/check-default-user` - Check default user (startup)

## Database

The project uses MongoDB with Mongoose. The User model includes:
- Email (unique, indexed)
- Name
- Password (hashed with bcrypt)
- Profile picture URL
- Timestamps

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

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Store Documentation](./store/README.md) - Redux store usage
- [Toast Hook Documentation](./hooks/README.md) - Toast notifications

## License

MIT
