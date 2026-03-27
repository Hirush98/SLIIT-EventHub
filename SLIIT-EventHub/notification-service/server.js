const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');

dotenv.config();

// ── Connect MongoDB ────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Notification service: MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const app    = express();
const server = http.createServer(app);

// ── Socket.IO setup ────────────────────────────────────────
// This enables real-time communication between server and browser
const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store io instance so controllers can emit events
app.set('io', io);

// ── Middleware ─────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ── Socket.IO connection handler ───────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client joins a room to receive announcements
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/api/announcements', require('./src/routes/announcementRoutes'));

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SLIIT EventHub Notification Service running ✅' });
});

// ── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});
