import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import NoteForm from "./components/NoteForm";
import NotesList from "./components/NotesList";
import SearchBar from "./components/SearchBar";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthGate from "./components/AuthGate";
import { useNotes } from "./hooks/useNotes";
import { getUser, clearToken, clearUser } from "./auth";
import { api } from "./api";

// Theme icons as inline SVG components
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

// Authenticated app content - only renders when user is logged in
function AuthenticatedApp({ onNotesCountChange }) {
  const {
    notes,
    totalNotes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useNotes();

  // Update notes count in parent
  useEffect(() => {
    onNotesCountChange(notes.length);
  }, [notes.length, onNotesCountChange]);

  return (
    <main className="main-content">
      <div className="container">
        {/* Search bar - show when there are total notes, not just filtered */}
        {totalNotes > 0 && !loading && (
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        {/* Note creation form */}
        <NoteForm onCreate={handleCreate} />

        {/* Notes list or loading/error states */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your notes...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <svg className="error-icon" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3>Unable to load notes</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : (
          <NotesList
            notes={notes}
            onSave={handleUpdate}
            onDelete={handleDelete}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </main>
  );
}

export default function App() {
  const user = getUser();
  const [apiStatus, setApiStatus] = useState('checking');
  const [notesCount, setNotesCount] = useState(0);
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Check API health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.health();
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'dark' ? "#1e293b" : "#ffffff",
              color: theme === 'dark' ? "#e2e8f0" : "#1f2937",
              border: theme === 'dark' ? "1px solid #334155" : "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: theme === 'dark' ? "#1e293b" : "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: theme === 'dark' ? "#1e293b" : "#ffffff",
              },
            },
          }}
        />

        {/* Header */}
        <header className="header">
          <div className="container">
            <div className="header-content">
              <div className="logo-section">
                <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2H15C16.1046 2 17 2.89543 17 4V20C17 21.1046 16.1046 22 15 22H9C7.89543 22 7 21.1046 7 20V4C7 2.89543 7.89543 2 9 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 10H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h1 className="app-title">NoteKeeper</h1>
              </div>
              <div className="header-info">
                {user && <span className="notes-count">{notesCount} notes</span>}
                <span className="api-status">
                  API Status: <span className={`status-dot ${apiStatus}`}>●</span>
                </span>
                <button
                  className="btn btn-text theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                {user && (
                  <>
                    <span className="user-email">{user.email}</span>
                    <button
                      className="btn btn-text"
                      onClick={() => {
                        clearToken();
                        clearUser();
                        location.reload();
                      }}
                    >
                      Sign out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <AuthGate>
          <AuthenticatedApp onNotesCountChange={setNotesCount} />
        </AuthGate>
      </div>
    </ErrorBoundary>
  );
}
