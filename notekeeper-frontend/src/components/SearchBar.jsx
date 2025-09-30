import React from "react";
import PropTypes from "prop-types";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="card search-bar">
      <div className="row">
        <div style={{ position: "relative", flex: 1 }}>
          <svg 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              width: "20px",
              height: "20px",
              color: "#94a3b8",
              pointerEvents: "none"
            }}
            viewBox="0 0 24 24" 
            fill="none"
          >
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="search"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search notes"
            style={{ paddingLeft: "44px" }}
          />
        </div>
        {searchTerm && (
          <button
            className="btn btn-secondary"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

SearchBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default SearchBar;
