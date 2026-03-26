const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const path      = require('path');
const connectDB = require('./src/config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded images as static files ──────────────────
// Frontend can access images at:
// http://localhost:5000/uploads/event-1234567890.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',   require('./src/routes/authRoutes'));
app.use('/api/events', require('./src/routes/eventRoutes'));

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SLIIT EventHub API is running ✅' });
});

// ── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ── Start server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SLIIT EventHub server running on port ${PORT}`);
});
