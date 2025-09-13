# Multi-Tenant SaaS Notes Application

A secure, multi-tenant SaaS application for managing notes with role-based access control and subscription limits.

## Architecture Overview

### Multi-Tenancy Approach: Shared Schema with Tenant ID

This application uses a **shared schema with tenant ID** approach for multi-tenancy:

- **Single Database**: One SQLite database with all tenant data
- **Tenant Isolation**: All tables include a `tenant_id` column to ensure strict data isolation
- **Row-Level Security**: All queries are filtered by `tenant_id` to prevent cross-tenant data access
- **Scalability**: Easy to scale and maintain with a single database instance

### Database Schema

```
tenants
├── id (PRIMARY KEY)
├── slug (UNIQUE) - e.g., 'acme', 'globex'
├── name - Display name
├── plan - 'free' or 'pro'
├── note_limit - 3 for free, -1 (unlimited) for pro
└── timestamps

users
├── id (PRIMARY KEY)
├── tenant_id (FOREIGN KEY)
├── email
├── password_hash
├── role - 'admin' or 'member'
└── timestamps

notes
├── id (PRIMARY KEY)
├── tenant_id (FOREIGN KEY)
├── user_id (FOREIGN KEY)
├── title
├── content
└── timestamps
```

## Features

### Multi-Tenancy
- ✅ Support for multiple tenants (Acme, Globex)
- ✅ Strict data isolation using tenant_id
- ✅ Tenant-specific user management
- ✅ Tenant-specific note limits

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Member)
- ✅ Secure password hashing with bcrypt

### Subscription Management
- ✅ Free Plan: 3 notes maximum
- ✅ Pro Plan: Unlimited notes
- ✅ Admin-only upgrade endpoint
- ✅ Real-time limit enforcement

### Notes Management
- ✅ Full CRUD operations
- ✅ Tenant isolation
- ✅ Role-based permissions
- ✅ Note limit enforcement

## Test Accounts

All accounts use password: `password`

| Email | Role | Tenant | Plan |
|-------|------|--------|------|
| admin@acme.test | Admin | Acme | Free |
| user@acme.test | Member | Acme | Free |
| admin@globex.test | Admin | Globex | Free |
| user@globex.test | Member | Globex | Free |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Notes (All require authentication)
- `GET /api/notes` - List all notes for current tenant
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Tenants (All require authentication)
- `GET /api/tenants/:slug` - Get tenant info
- `POST /api/tenants/:slug/upgrade` - Upgrade to Pro (Admin only)
- `GET /api/tenants/:slug/users` - List tenant users (Admin only)

### Health Check
- `GET /health` - Health check endpoint

## Setup & Installation

### Prerequisites
- Node.js 18+ (for Vosk integration compatibility)
- npm or yarn

### Local Development

1. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

2. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on http://localhost:3001

3. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on http://localhost:5173

### Environment Variables

Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/notes_saas
```

## Deployment on Vercel

### Backend Deployment
1. Connect your GitHub repository to Vercel
2. Set the following environment variables in Vercel:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-production-jwt-secret`
   - `FRONTEND_URL=https://your-frontend-domain.vercel.app`
   - `MONGODB_URI=your-mongodb-connection-string`

### Frontend Deployment
1. Deploy the client directory as a separate Vercel project
2. Update the backend's `FRONTEND_URL` environment variable

### Database
- Uses MongoDB for scalability and cloud compatibility
- Database connection string configurable via MONGODB_URI environment variable
- Defaults to local MongoDB instance (mongodb://localhost:27017/notes_saas)
- In production, use MongoDB Atlas or Vercel Postgres for better performance

## Security Features

- **CORS Protection**: Configured for specific frontend domains
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet.js**: Security headers
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Parameterized queries

## Testing

The application includes test accounts for automated testing:

- Health endpoint validation
- Authentication flow testing
- Tenant isolation verification
- Role-based access control testing
- Subscription limit enforcement
- CRUD operations testing

## Development Notes

- Uses ES6 modules throughout
- SQLite database for simplicity
- Express.js backend with middleware
- React frontend with Vite
- CSS modules for styling (as per user preference)
- JWT tokens expire in 24 hours
- All timestamps in UTC

## License

ISC
