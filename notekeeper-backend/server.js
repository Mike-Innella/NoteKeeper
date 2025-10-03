import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { body, param, validationResult } from "express-validator";

import { db, initDatabase } from "./lib/database.js"; // <-- PostgreSQL database
import { signToken, authMiddleware } from "./lib/auth.js"; // <-- JWT helpers

const app = express();
const PORT = process.env.PORT || 5000;

// CORS settings
const allowedOrigins = [
  "http://localhost:5173", // local dev (Vite)
  "https://note-keeper-lac.vercel.app", // your Vercel frontend (edit if different)
  "https://notekeeper-eix8.onrender.com", // Render backend URL
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (curl/Postman)
      if (!origin) return cb(null, true);
      if (!allowedOrigins.includes(origin)) {
        const msg = `CORS blocked: ${origin}`;
        return cb(new Error(msg), false);
      }
      return cb(null, true);
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Utilities
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  next();
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth
app.post(
  "/auth/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const exists = await db.users.findByEmail(email);
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      id: nanoid(),
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    await db.users.create(user);

    const token = signToken({ userId: user.id, email: user.email });
    return res
      .status(201)
      .json({ token, user: { id: user.id, email: user.email } });
  })
);

app.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await db.users.findByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user.id, email: user.email });
    return res.json({ token, user: { id: user.id, email: user.email } });
  })
);

// Notes per user
app.get(
  "/notes",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const notes = await db.notes.findByUserId(req.user.userId);
    res.json(notes);
  })
);

app.get(
  "/notes/:id",
  [authMiddleware, param("id").notEmpty().withMessage("Note ID is required")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const note = await db.notes.findById(req.params.id, req.user.userId);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  })
);

app.post(
  "/notes",
  [
    authMiddleware,
    body("title").optional().isString().trim().isLength({ max: 200 }),
    body("content").optional().isString().trim().isLength({ max: 10000 }),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { title = "", content = "" } = req.body || {};
    if (!title.trim() && !content.trim())
      return res.status(400).json({ error: "Title or content required" });

    const now = new Date().toISOString();
    const note = {
      id: nanoid(),
      userId: req.user.userId, // <-- scope to current user
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const created = await db.notes.create(note);
    res.status(201).json(created);
  })
);

app.put(
  "/notes/:id",
  [
    authMiddleware,
    param("id").notEmpty().withMessage("Note ID is required"),
    body("title").optional().isString().trim().isLength({ max: 200 }),
    body("content").optional().isString().trim().isLength({ max: 10000 }),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body || {};

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();

    const updated = await db.notes.update(id, req.user.userId, updates);
    if (!updated) return res.status(404).json({ error: "Note not found" });
    
    res.json(updated);
  })
);

app.delete(
  "/notes/:id",
  [authMiddleware, param("id").notEmpty().withMessage("Note ID is required")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await db.notes.delete(id, req.user.userId);
    if (!deleted)
      return res.status(404).json({ error: "Note not found" });
    res.status(204).end();
  })
);

// Global error handler (last in chain)
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
