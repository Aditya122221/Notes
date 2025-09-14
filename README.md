# Multi-Tenant SaaS Notes Application

A secure, multi-tenant SaaS application for managing notes with role-based access control, subscription limits, and comprehensive user management features.

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
├── _id (PRIMARY KEY)
├── slug (UNIQUE) - e.g., 'acme', 'globex'
├── name - Display name
├── plan - 'free' or 'pro'
├── noteLimit - 3 for free, unlimited for pro
└── timestamps

users
├── _id (PRIMARY KEY)
├── tenant (FOREIGN KEY)
├── email
├── password
├── role - 'admin' or 'member'
└── timestamps

notes
├── _id (PRIMARY KEY)
├── tenant (FOREIGN KEY)
├── user (FOREIGN KEY)
├── title
├── content
└── timestamps
```

## Features

### Multi-Tenancy
- ✅ Support for multiple tenants (Acme, Globex)
- ✅ Strict data isolation using tenant references
- ✅ Tenant-specific user management
- ✅ Tenant-specific note limits
- ✅ MongoDB-based scalable architecture

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Member)
- ✅ Secure password hashing with bcrypt
- ✅ User invitation system (Admin only)
- ✅ Separate user data display for different roles

### Subscription Management
- ✅ Free Plan: 3 notes maximum
- ✅ Pro Plan: Unlimited notes (∞)
- ✅ Admin-only upgrade endpoint
- ✅ Real-time limit enforcement
- ✅ Accurate note counting display
- ✅ Visual plan indicators in UI

### Notes Management
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Inline editing with edit forms
- ✅ Tenant isolation
- ✅ Role-based permissions
- ✅ Note limit enforcement
- ✅ Author attribution and timestamps
- ✅ Responsive design with CSS modules

### User Management (Admin Only)
- ✅ Invite new users to tenant
- ✅ Role assignment (Admin/Member)
- ✅ User list display
- ✅ Admin-only access controls

### User Interface Features
- ✅ **Dashboard**: Clean, modern interface with role-based content
- ✅ **Note Management**: Create, edit, delete notes with inline editing
- ✅ **Admin Panel**: User invitation and management for administrators
- ✅ **Subscription Status**: Visual indicators for plan limits and remaining notes
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
- ✅ **Real-time Updates**: Live note counting and limit enforcement
- ✅ **Error Handling**: User-friendly error messages and validation

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
- `POST /api/auth/invite` - Invite new user (Admin only)

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
- MongoDB (local or MongoDB Atlas)
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

2. **Start MongoDB** (if using local instance)
   ```bash
   # Windows
   mongod
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on http://localhost:3001

4. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on http://localhost:5173

## Usage Guide

### For Members
1. **Login** with your credentials
2. **View Notes** - See all notes in your tenant
3. **Create Notes** - Click "Create Note" button (respects plan limits)
4. **Edit Notes** - Click the edit (pencil) icon on any note
5. **Delete Notes** - Click the delete (trash) icon on any note

### For Admins
1. **Login** with admin credentials
2. **Manage Users** - Invite new users to your tenant
3. **Upgrade Plan** - Upgrade to Pro for unlimited notes (if on Free plan)
4. **All Member Features** - Full access to note management

### Key Features
- **Note Limits**: Free plan allows 3 notes, Pro plan unlimited
- **Real-time Counting**: See remaining notes in the dashboard
- **Inline Editing**: Edit notes directly without separate pages
- **User Management**: Admins can invite and manage team members
- **Tenant Isolation**: Each tenant's data is completely separate

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

## Recent Updates & Features

### ✨ New Features Added
- **Note Editing**: Inline edit functionality with edit forms
- **User Invitation System**: Admins can invite new users to their tenant
- **Role-Based UI**: Different interfaces for admins vs members
- **Accurate Note Counting**: Fixed display of remaining notes (not infinite for free plans)
- **Admin Badge**: Visual indicator for admin users
- **Enhanced UI**: Better visual separation and user experience

### 🔧 Technical Improvements
- **MongoDB Integration**: Migrated from SQLite to MongoDB for better scalability
- **Improved Error Handling**: Better error messages and validation
- **Enhanced Security**: Proper tenant isolation and role-based access
- **Responsive Design**: CSS modules for better styling organization
- **API Validation**: Joi schema validation for all endpoints

## Development Notes

- Uses ES6 modules throughout
- MongoDB database for scalability and cloud compatibility
- Express.js backend with comprehensive middleware
- React frontend with Vite
- CSS modules for styling (as per user preference)
- JWT tokens expire in 24 hours
- All timestamps in UTC
- Multi-tenant architecture with strict data isolation

## Troubleshooting

### Common Issues

**Note Update Not Working**
- Ensure you're logged in with valid credentials
- Check that the note belongs to your tenant
- Verify the backend server is running on port 3001

**User Invitation Fails**
- Only admins can invite users
- Ensure you're logged in as an admin user
- Check that the email address is valid and not already registered

**Note Limit Issues**
- Free plan is limited to 3 notes
- Upgrade to Pro plan for unlimited notes
- Check the dashboard for accurate remaining note count

**Database Connection Issues**
- Ensure MongoDB is running locally or Atlas connection is valid
- Check MONGODB_URI environment variable
- Verify network connectivity

**Frontend Not Loading**
- Ensure both backend (port 3001) and frontend (port 5173) are running
- Check for CORS errors in browser console
- Verify FRONTEND_URL environment variable matches frontend URL

## License

ISC
