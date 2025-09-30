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
              background: "#ffffff",
              color: "#1f2937",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
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
