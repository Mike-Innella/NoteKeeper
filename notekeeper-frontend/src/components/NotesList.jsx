import { useState, memo } from "react";
import PropTypes from "prop-types";

function NotesList({ notes, onSave, onDelete, searchTerm }) {
  if (!notes.length) {
    return (
      <div className="empty-state-container">
        <div className="empty-state">
          <svg className="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M9 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {searchTerm ? (
            <>
              <h3>No notes found</h3>
              <p>Try adjusting your search terms</p>
            </>
          ) : (
            <>
              <h3>No notes yet</h3>
              <p>Create your first note to get started</p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="notes-grid">
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

const NoteItem = memo(function NoteItem({ note, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(note.id, { title, content });
      setEditing(false);
    } catch (error) {
      console.error("Failed to save note:", error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete(note.id);
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="note-card">
      {!editing ? (
        <>
          <div className="note-header">
            <h3 className="note-title">
              {note.title || "Untitled Note"}
            </h3>
            <span className="note-date">{formatDate(note.updatedAt)}</span>
          </div>
          
          <div className={`note-content ${!expanded ? 'note-content-clamped' : ''}`}>
            {note.content || <span className="note-empty">No content</span>}
          </div>
          
          {note.content && note.content.length > 400 && (
            <button 
              className="btn-expand"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Show less" : "Show more"}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
          
          <div className="note-footer">
            <button 
              className="btn btn-text" 
              onClick={() => setEditing(true)}
              aria-label="Edit note"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.50023C19.3284 1.67180 20.6716 1.67180 21.5 2.50023C22.3284 3.32866 22.3284 4.67188 21.5 5.50031L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit
            </button>
            <button 
              className="btn btn-text btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={isDeleting ? "Deleting..." : "Delete note"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      ) : (
        <div className="note-edit-mode">
          <div className="form-group">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              maxLength={200}
              placeholder="Note title"
              className="form-input"
              aria-label="Edit note title"
            />
          </div>
          
          <div className="form-group">
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSaving}
              maxLength={10000}
              placeholder="Note content..."
              className="form-textarea"
              aria-label="Edit note content"
            />
          </div>
          
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => {
                setTitle(note.title);
                setContent(note.content);
                setEditing(false);
              }}
              disabled={isSaving}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving || (!title.trim() && !content.trim())}
              aria-label={isSaving ? "Saving..." : "Save changes"}
            >
              {isSaving ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

NotesList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      content: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  searchTerm: PropTypes.string,
};

NotesList.defaultProps = {
  searchTerm: "",
};

NoteItem.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    content: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default NotesList;
