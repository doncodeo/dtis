const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5400; // Fallback to 5400 if PORT is not set

// ================= CORS CONFIG =================
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ["http://localhost:3000"]; // Default allowed frontend

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Explicitly handle preflight requests
app.options("*", cors());
// =================================================

// Middleware setup
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); 
app.use(morgan('dev')); 

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const routes = [
  { path: '/api/users', router: require('./routes/userRoutes') },
  { path: '/api/reports', router: require('./routes/reportRoutes') },
  { path: '/api/search', router: require('./routes/searchRoutes') },
  { path: '/api/appeals', router: require('./routes/appealRoutes') },
  { path: '/api/watchlist', router: require('./routes/watchlistRoutes') },
  { path: '/api/admin', router: require('./routes/adminRoutes') },
  { path: '/api/articles', router: require('./routes/articleRoutes') },
];

routes.forEach(({ path, router }) => app.use(path, router));

// Serve index.html for unknown routes (for SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    const server = app.listen(port, () => 
      console.log(`🚀 Server running on port ${port}`)
    );

    // Graceful shutdown logic
    const gracefulShutdown = () => {
      console.log('Shutting down gracefully...'); 
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });

      // Force shutdown after 5s if not closed
      setTimeout(() => {
        console.error('Forcing server shutdown...');
        process.exit(1);
      }, 5000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
