const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 5000; // Fallback to 5000 if PORT is not set

// Middleware setup
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' })); // Fallback to '*' if ALLOWED_ORIGINS is not set
app.use(express.json()); // Built-in body-parser for JSON
app.use(express.urlencoded({ extended: true })); // Built-in body-parser for URL-encoded data
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Use 'dev' for concise logging in development

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
        const server = app.listen(port, () => console.log(`Server running on port ${port}`));

        // Graceful shutdown logic
        const gracefulShutdown = () => {
            console.log('Shutting down gracefully...'); 
            server.close(() => {
                console.log('Server closed.');
                process.exit(0); // Exit with success code
            });

            // Force close server after 5 seconds if it hasn't closed yet
            setTimeout(() => {
                console.error('Forcing server shutdown...');
                process.exit(1); // Exit with failure code
            }, 5000); 
        };

        // Handle termination signals
        process.on('SIGTERM', gracefulShutdown); // For Kubernetes, Docker, etc.
        process.on('SIGINT', gracefulShutdown);  // For Ctrl+C in terminal
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });


