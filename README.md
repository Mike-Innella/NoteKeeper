# 📝 NoteKeeper

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://note-keeper-lac.vercel.app/)
[![Backend API](https://img.shields.io/badge/api-active-blue)](https://notekeeper-eix8.onrender.com)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black)](https://vercel.com)
[![Backend](https://img.shields.io/badge/backend-Render-purple)](https://render.com)

A modern, full-stack note-taking application with secure authentication, real-time search, and seamless cloud synchronization.

## 🌟 Features

- **🔐 Secure Authentication**: JWT-based login/register system with bcrypt password hashing
- **📄 Full CRUD Operations**: Create, read, update, and delete notes effortlessly
- **🔍 Real-time Search**: Instantly filter through your notes as you type with custom clear button
- **🌓 Dark/Light Theme**: Toggle between themes with system preference detection and persistence
- **📊 Live API Monitoring**: Real-time health status indicator for backend connectivity
- **📈 Notes Counter**: Track your total notes count at a glance
- **☁️ Cloud Storage**: Notes persist across sessions with automatic synchronization
- **📱 Responsive Design**: Mobile-first approach that works seamlessly across all devices
- **🎨 Modern UI**: Professional blue & gray color palette with smooth transitions
- **♿ Accessibility**: Full keyboard navigation, focus states, and reduced motion support
- **⚡ Fast Performance**: Optimized with Vite 7 for lightning-fast load times
- **🛡️ Error Boundaries**: Graceful error handling with user-friendly fallback UI
- **🔄 Dual Database Mode**: Smart detection uses JSON files locally, PostgreSQL in production
- **🖨️ Print Optimized**: Clean print styles for physical note backup

## 🚀 Live Demo

- **Frontend**: [https://note-keeper-lac.vercel.app/](https://note-keeper-lac.vercel.app/)
- **Backend API**: [https://notekeeper-eix8.onrender.com](https://notekeeper-eix8.onrender.com)

> **Note**: The backend is hosted on Render's free tier, so the first request may take 30-50 seconds while the server wakes up.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1 (latest version)
- **Build Tool**: Vite 7.1.7 with @vitejs/plugin-react 5.0.3
- **Styling**: Consolidated CSS with CSS variables for theming
  - Professional blue & gray color palette
  - Dark/Light theme support with system preference detection
  - Base 8px rem unit system for consistent scaling
- **State Management**: React Hooks (useState, useEffect, custom hooks)
- **Notifications**: React Hot Toast 2.6.0 (theme-aware)
- **Deployment**: Vercel with automatic CI/CD

### Backend
- **Runtime**: Node.js 18+ with Express 5.1.0 (latest major version)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Database**: Dual-mode adapter
  - **Local**: JSON file storage (zero setup required)
  - **Production**: PostgreSQL 8.16.3 with automatic detection
- **Validation**: express-validator 7.0.1
- **Security**: Helmet 8.1.0, CORS 2.8.5, morgan 1.10.1
- **Utilities**: nanoid 5.1.6 for ID generation
- **Deployment**: Render with automatic deploys

## 📁 Project Structure

```
NoteKeeper/
├── notekeeper-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AuthGate.jsx    # Authentication wrapper
│   │   │   ├── ErrorBoundary.jsx # Error boundary for graceful error handling
│   │   │   ├── NoteForm.jsx    # Note creation/editing
│   │   │   ├── NotesList.jsx   # Notes display grid
│   │   │   ├── SearchBar.jsx   # Search with custom clear button
│   │   │   └── Toast.jsx       # Toast notification component
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useNotes.js    # Notes management hook
│   │   │   └── useToast.js    # Toast notifications hook
│   │   ├── api.js              # API client configuration
│   │   ├── auth.js             # Authentication utilities
│   │   ├── App.jsx             # Main app with theme toggle
│   │   ├── main.jsx           # Application entry point
│   │   └── styles.css          # Consolidated CSS with theming
│   └── vercel.json             # Vercel deployment config
│
├── notekeeper-backend/          # Node.js backend API
│   ├── lib/
│   │   ├── auth.js            # JWT authentication logic
│   │   ├── database.js        # Database connection manager
│   │   └── db-adapter.js      # Dual-mode database adapter
│   ├── db/                     # JSON file storage (local dev)
│   ├── server.js               # Express server setup
│   ├── migrate-to-postgres.js # Database migration utility
│   └── test-connection.js     # Database connection tester
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

### Database Migration

If you need to migrate from JSON files to PostgreSQL:

1. **Set up PostgreSQL connection** in your `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

2. **Run the migration script**:
   ```bash
   cd notekeeper-backend
   npm run migrate
   ```

3. **Test the connection**:
   ```bash
   npm run test:db
   ```

The migration script will:
- Create necessary tables if they don't exist
- Import existing users and notes from JSON files
- Preserve all relationships and data integrity
- Backup JSON files before migration (`.backup.json`)

## 🎨 Theme Customization

NoteKeeper supports both light and dark themes with automatic system preference detection:

### Theme Features
- **Automatic Detection**: Respects your system's dark/light mode preference on first visit
- **Manual Toggle**: Click the sun/moon icon in the header to switch themes
- **Persistence**: Theme choice is saved to localStorage and remembered across sessions
- **Smooth Transitions**: All theme changes animate smoothly for better UX

### CSS Variables
The app uses CSS custom properties for easy theme customization. Key variables include:
- `--primary`: Main brand color (blue)
- `--bg-primary/secondary`: Background colors
- `--text-primary/secondary/tertiary`: Text color hierarchy
- `--border-color`: Border colors for cards and inputs

### Customizing Colors
To customize the color scheme, modify the CSS variables in `src/styles.css`:
```css
:root {
  --primary: #2563eb;  /* Change primary color */
  --gray-50: #f8fafc;  /* Adjust gray scale */
  /* ... other variables */
}
```

## ♿ Accessibility Features

NoteKeeper is built with accessibility in mind:

### Keyboard Navigation
- **Full keyboard support**: Navigate the entire app without a mouse
- **Focus indicators**: Clear visual feedback for focused elements
- **Tab order**: Logical tab order through interactive elements
- **Escape key**: Close modals and cancel operations

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA labels**: Descriptive labels for interactive elements
- **Form labels**: All form inputs have associated labels
- **Status announcements**: Important updates announced to screen readers

### Visual Accessibility
- **High contrast**: Sufficient color contrast ratios (WCAG AA compliant)
- **Scalable text**: Base 8px rem system allows browser zoom
- **Reduced motion**: Respects `prefers-reduced-motion` system setting
- **Focus visible**: Enhanced focus states for keyboard users

### Responsive Design
- **Mobile-first**: Optimized for touch devices
- **Flexible layouts**: Content reflows for different screen sizes
- **Touch targets**: Minimum 44x44px touch targets on mobile
- **Readable fonts**: System fonts for optimal readability

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
