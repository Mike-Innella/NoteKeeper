# 📝 NoteKeeper

A modern, secure note-taking application built with React, Express, and PostgreSQL. Features JWT authentication, real-time updates, and a clean, responsive interface.

## 🚀 Tech Stack

### Frontend

- **React 18** with Vite
- **React Router** for navigation
- **JWT** for authentication
- **Deployed on Vercel**

### Backend

- **Express.js** REST API
- **PostgreSQL** (Supabase) database
- **JWT** authentication
- **bcrypt** for password hashing
- **Deployed on Render**

### Infrastructure

- **Database**: Supabase PostgreSQL
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel

## 📋 Features

- 🔐 Secure user authentication (register/login)
- 📝 Create, read, update, and delete notes
- 🔍 Search and filter notes
- 🎨 Clean, responsive UI
- 🔒 Per-user data isolation
- ⚡ Fast and optimized performance
- 🛡️ CORS protection
- ✅ Health check endpoints

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)

### 1. Clone the repository

```bash
git clone https://github.com/Mike-Innella/NoteKeeper.git
cd NoteKeeper
```

### 2. Backend Setup

```bash
cd notekeeper-backend
npm install
```

Create a `.env` file in the backend directory:

```env
# Database (use your Supabase connection string)
DATABASE_URL=postgresql://user:password@host:5432/database

# Server
PORT=5000
NODE_ENV=development

# JWT Secret (generate a secure random string)
JWT_SECRET=your-very-secure-jwt-secret-key

# Optional CORS origin for production
# CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

Start the backend server:

```bash
npm run dev    # Development with nodemon
# or
npm start      # Production mode
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd notekeeper-frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# For production, use your deployed backend URL:
# VITE_API_URL=https://your-backend.onrender.com
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚀 Deployment

### Deploy Backend to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `notekeeper-backend`
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres.pytuhhdxbdscqktvtlal:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
   JWT_SECRET=your_supabase_jwt_key
   NODE_ENV=production
   PORT=10000
   CORS_ORIGIN=https://note-keeper-jade.vercel.app
   ```
5. Add Health Check Path: `/healthz`
6. Deploy to: `https://notekeeper-eix8.onrender.com`

### Deploy Frontend to Vercel

1. Import project on [Vercel](https://vercel.com)
2. Select the `notekeeper-frontend` directory as root
3. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://notekeeper-eix8.onrender.com
   ```
5. Deploy to: `https://note-keeper-jade.vercel.app`

## 📁 Project Structure

```
NoteKeeper/
├── notekeeper-backend/        # Express.js backend
│   ├── lib/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── database.js       # PostgreSQL connection and queries
│   ├── server.js             # Express server setup
│   ├── package.json
│   └── .env.example
│
├── notekeeper-frontend/       # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api.js           # API client
│   │   ├── auth.js          # Auth utilities
│   │   └── App.jsx          # Main app component
│   ├── Styles/              # CSS modules
│   ├── package.json
│   └── vite.config.js
│
└── MIGRATION_GUIDE.md        # Database migration guide
```

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based authentication
- CORS protection
- SQL injection prevention via parameterized queries
- Input validation and sanitization
- Per-user data isolation
- SSL/TLS encryption for database connections

## ⚠️ Security Best Practices

### Never Commit Secrets

- **NEVER** commit real credentials to git, even temporarily
- All `.env` files are gitignored and should remain local only
- Use `.env.example` files with placeholder values for documentation
- Real credentials should only exist in:
  - Local `.env` files (gitignored)
  - Deployment platform environment variables (Render/Vercel)

### Environment Files

- `.env` - Your local configuration (NEVER commit)
- `.env.example` - Template with placeholders (safe to commit)
- `.env.migration` - Local migration reference (NEVER commit)

### If Credentials Are Exposed

1. **Immediately rotate all exposed credentials**
2. Update credentials in deployment platforms
3. Remove sensitive data from git history using:
   ```bash
   # Using BFG Repo-Cleaner (recommended)
   bfg --delete-files .env
   bfg --replace-text passwords.txt  # file with patterns to replace

   # Or using git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Notes Table

```sql
CREATE TABLE notes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Notes (Requires Authentication)

- `GET /notes` - Get all notes for logged-in user
- `GET /notes/:id` - Get specific note
- `POST /notes` - Create new note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Health

- `GET /` - API status
- `GET /healthz` - Health check for monitoring

## 🧪 Testing

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Notes (use token from login)

```bash
# Create note
curl -X POST http://localhost:5000/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Note","content":"This is a test"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Mike Innella**

- GitHub: [@Mike-Innella](https://github.com/Mike-Innella)

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community
- Supabase for the database hosting
- Render for backend hosting
- Vercel for frontend hosting

---

**Live Demo**: [https://note-keeper-jade.vercel.app](https://note-keeper-jade.vercel.app)
