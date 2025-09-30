import { useState } from "react";
import PropTypes from "prop-types";

function NoteForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate({ title, content });
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="note-form">
        <h2 className="form-title">Create New Note</h2>
        
        <div className="form-group">
          <label htmlFor="note-title" className="form-label">
            Title
          </label>
          <input
            id="note-title"
            type="text"
            placeholder="Enter a title for your note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            maxLength={200}
            className="form-input"
            aria-label="Note title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="note-content" className="form-label">
            Content
          </label>
          <textarea
            id="note-content"
            rows={4}
            placeholder="Write your note content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            maxLength={10000}
            className="form-textarea"
            aria-label="Note content"
          />
          <div className="form-hint">
            {content.length}/10000 characters
          </div>
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setContent("");
            }}
            disabled={isSubmitting || (!title && !content)}
            className="btn btn-secondary"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!title.trim() && !content.trim())}
            className="btn btn-primary"
            aria-label={isSubmitting ? "Creating note..." : "Add note"}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

NoteForm.propTypes = {
  onCreate: PropTypes.func.isRequired,
};

export default NoteForm;
