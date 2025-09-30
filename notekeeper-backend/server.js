import "dotenv/config.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { nanoid } from "nanoid";
import { body, param, validationResult } from "express-validator";
import { readNotes, writeNotes } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS settings
const allowedOrigins = [
  "http://localhost:5173",              // local dev
  "https://note-keeper-lac.vercel.app", // your Vercel frontend
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (like curl or Postman)
      if (!origin) return cb(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return cb(new Error(msg), false);
      }
      return cb(null, true);
    },
    credentials: true,
  })
); 
app.use(morgan("dev"));
app.use(express.json()); 


// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// List notes
app.get(
  "/notes",
  asyncHandler(async (req, res) => {
    try {
      const notes = readNotes().sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
      res.json(notes);
    } catch (error) {
      console.error("Error reading notes:", error);
      res.status(500).json({ error: "Failed to load notes" });
    }
  })
);

// Get one note
app.get(
  "/notes/:id",
  [param("id").notEmpty().withMessage("Note ID is required")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const notes = readNotes();
      const note = notes.find((n) => n.id === req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error getting note:", error);
      res.status(500).json({ error: "Failed to get note" });
    }
  })
);

// Create note
app.post(
  "/notes",
  [
    body("title")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title must be a string with max 200 characters"),
    body("content")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 10000 })
      .withMessage("Content must be a string with max 10000 characters"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { title = "", content = "" } = req.body || {};
    
    if (!title.trim() && !content.trim()) {
      return res.status(400).json({ error: "Title or content required" });
    }

    try {
      const now = new Date().toISOString();
      const newNote = {
        id: nanoid(),
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      };
      
      const notes = readNotes();
      notes.push(newNote);
      writeNotes(notes);
      res.status(201).json(newNote);
    } catch (error) {
      
      const notes = readNotes();
      notes.push(newNote);
      writeNotes(notes);
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Failed to create note" });
    }
  })
);

// Update note
app.put(
  "/notes/:id",
  [
    param("id").notEmpty().withMessage("Note ID is required"),
    body("title")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 200 })
      .withMessage("Title must be a string with max 200 characters"),
    body("content")
      .optional()
      .isString()
      .trim()
      .isLength({ max: 10000 })
      .withMessage("Content must be a string with max 10000 characters"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { title, content } = req.body || {};
    
    try {
      const notes = readNotes();
      const idx = notes.findIndex((n) => n.id === req.params.id);
      
      if (idx === -1) {
        return res.status(404).json({ error: "Note not found" });
      }

      const now = new Date().toISOString();
      notes[idx] = {
        ...notes[idx],
        title: title !== undefined ? title.trim() : notes[idx].title,
        content: content !== undefined ? content.trim() : notes[idx].content,
        updatedAt: now,
      };
      
      writeNotes(notes);
      res.json(notes[idx]);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ error: "Failed to update note" });
    }
  })
);

// Delete note
app.delete(
  "/notes/:id",
  [param("id").notEmpty().withMessage("Note ID is required")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    try {
      const notes = readNotes();
      const idx = notes.findIndex((n) => n.id === req.params.id);
      
      if (idx === -1) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      const [removed] = notes.splice(idx, 1);
      writeNotes(notes);
      res.json({ deleted: removed.id });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ error: "Failed to delete note" });
    }
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message 
  });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
