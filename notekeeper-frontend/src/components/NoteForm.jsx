import { useState } from "react";
import PropTypes from "prop-types";

function NoteForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    setIsCreating(true);
    try {
      await onCreate({ title: title.trim(), content: content.trim() });
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="card note-form">
      <h2 className="form-title">Create a New Note</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="note-title" className="form-label">
            Title
          </label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your note"
            className="form-input"
            disabled={isCreating}
            maxLength={200}
          />
        </div>

        <div className="form-group">
          <label htmlFor="note-content" className="form-label">
            Content
          </label>
          <textarea
            id="note-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="form-textarea"
            rows={4}
            disabled={isCreating}
            maxLength={10000}
          />
          <div className="form-hint">
            {content.length}/10000 characters
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setTitle("");
              setContent("");
            }}
            disabled={isCreating || (!title && !content)}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isCreating || (!title.trim() && !content.trim())}
          >
            {isCreating ? (
              <>
                <span className="btn-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Create Note
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
