# 📝 NoteKeeper

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://note-keeper-lac.vercel.app/)
[![Backend API](https://img.shields.io/badge/api-active-blue)](https://notekeeper-eix8.onrender.com)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/backend-Render-purple)](https://render.com)

A modern, full-stack note-taking application with secure authentication, real-time search, and seamless cloud synchronization.

## 🌟 Features

- **🔐 Secure Authentication**: JWT-based login/register system with bcrypt password hashing
- **📄 Full CRUD Operations**: Create, read, update, and delete notes effortlessly
- **🔍 Real-time Search**: Instantly filter through your notes as you type
- **☁️ Cloud Storage**: Notes persist across sessions with automatic synchronization
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Clean UI**: Minimalist design with toast notifications for user feedback
- **⚡ Fast Performance**: Optimized with Vite for lightning-fast load times
- **🔄 Dual Database Mode**: Smart detection uses JSON files locally, PostgreSQL in production

## 🚀 Live Demo

- **Frontend**: [https://note-keeper-lac.vercel.app/](https://note-keeper-lac.vercel.app/)
- **Backend API**: [https://notekeeper-eix8.onrender.com](https://notekeeper-eix8.onrender.com)

> **Note**: The backend is hosted on Render's free tier, so the first request may take 30-50 seconds while the server wakes up.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Custom CSS with modular architecture
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Notifications**: React Hot Toast
- **Build Tool**: Vite 7
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js with Express
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Database**: Dual-mode adapter
  - **Local**: JSON file storage (zero setup required)
  - **Production**: PostgreSQL (automatic detection)
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Deployment**: Render

## 📁 Project Structure

```
NoteKeeper/
├── notekeeper-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AuthGate.jsx    # Authentication wrapper
│   │   │   ├── NoteForm.jsx    # Note creation/editing
│   │   │   ├── NotesList.jsx   # Notes display
│   │   │   └── SearchBar.jsx   # Search functionality
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api.js              # API client configuration
│   │   ├── auth.js             # Authentication utilities
│   │   └── App.jsx             # Main application component
│   └── vercel.json             # Vercel deployment config
│
├── notekeeper-backend/          # Node.js backend API
│   ├── lib/
│   │   ├── auth.js            # JWT authentication logic
│   │   ├── database.js        # Database connection manager
│   │   └── db-adapter.js      # Dual-mode database adapter
│   ├── db/                     # JSON file storage (local dev)
│   └── server.js               # Express server setup
│
└── README.md                    # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mike-Innella/NoteKeeper.git
   cd NoteKeeper
   ```

2. **Setup Backend**
   ```bash
   cd notekeeper-backend
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env and add your JWT_SECRET
   
   npm run dev
   ```
   Backend runs on http://localhost:5000

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd notekeeper-frontend
   npm install
   npm run dev
   ```
   Frontend opens at http://localhost:5173

That's it! No database installation required for local development.

## 📋 API Documentation

### Base URL
- **Local**: `http://localhost:5000`
- **Production**: `https://notekeeper-eix8.onrender.com`

### Endpoints

#### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create new account | `{ email, password }` |
| POST | `/auth/login` | Login to account | `{ email, password }` |

#### Notes (Requires Authentication)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/notes` | Get all user notes | - |
| GET | `/notes/:id` | Get specific note | - |
| POST | `/notes` | Create new note | `{ title, content }` |
| PUT | `/notes/:id` | Update note | `{ title, content }` |
| DELETE | `/notes/:id` | Delete note | - |

#### Health Check

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | API health check | `{ status: "ok", time: "..." }` |

### Authentication Headers

All `/notes` endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

## 🌐 Environment Variables

### Backend (.env)
```env
# Required
JWT_SECRET=your-secret-key-here
NODE_ENV=production

# Optional (auto-provided on Render)
DATABASE_URL=postgresql://...
PORT=5000
```

### Frontend (.env.local)
```env
# Local development
VITE_API_URL=http://localhost:5000

# Production (set in Vercel dashboard)
VITE_API_URL=https://notekeeper-eix8.onrender.com
```

## 🚀 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect to your GitHub repository
4. Add environment variables:
   - `JWT_SECRET`: Your secret key
   - `NODE_ENV`: production
5. Create PostgreSQL database on Render
6. Deploy

### Deploy Frontend to Vercel

1. Import project from GitHub on Vercel
2. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL
3. Deploy

For detailed deployment instructions, see [README_COMPLETE_SETUP.md](README_COMPLETE_SETUP.md)

## 💾 Database Modes

NoteKeeper uses an intelligent dual-mode database system:

| Environment | Storage Type | Data Location | Setup Required |
|-------------|-------------|---------------|----------------|
| Local Development | JSON Files | `/notekeeper-backend/db/` | None |
| Production | PostgreSQL | Render Database | Automatic |

The backend automatically detects and uses the appropriate storage method based on environment variables.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test both locally and with production APIs
- Ensure responsive design is maintained

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Mike Innella**
- GitHub: [@Mike-Innella](https://github.com/Mike-Innella)

## 🙏 Acknowledgments

- Built with React and Node.js
- Deployed on Vercel and Render
- Icons and design inspiration from modern note-taking apps

---

<p align="center">Made with ❤️ by Mike Innella</p>
