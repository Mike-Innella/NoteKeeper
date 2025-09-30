import React, { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import "./styles.css";
import NoteForm from "./components/NoteForm.jsx";
import NotesList from "./components/NotesList.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { useNotes } from "./hooks/useNotes.js";

export default function App() {
  const {
    notes,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useNotes();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) searchInput.focus();
      }
      
      // Escape to clear search
      if (e.key === "Escape" && searchTerm) {
        setSearchTerm("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, setSearchTerm]);

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
                <span className="notes-count">{notes.length} notes</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            {/* Search bar */}
            {notes.length > 0 && !loading && (
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
      </div>
    </ErrorBoundary>
  );
}
