<?php
// DTIS Configuration File

// Error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Session settings
session_set_cookie_params([
    'lifetime' => 86400, // 1 day
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => true, // Enable in production with HTTPS
    'httponly' => true,
    'samesite' => 'Strict'
]);
session_start();

// Application constants
define('APP_NAME', 'DTIS');
define('APP_VERSION', '1.0.0');

// Base URL of the application.
// IMPORTANT: If your project is in a subfolder, update the path here.
// For example, if your URL is http://localhost/my-project/, set this to '/my-project/'.
// If your project is at the root, set this to '/'.
define('BASE_URL', 'http://' . $_SERVER['HTTP_HOST'] . '/DTIS/');


// Security constants
define('REQUIRED_VERIFICATIONS', 50); // Minimum verifications for auto-approval
define('MAX_LOGIN_ATTEMPTS', 5); // Max login attempts before lockout
define('LOGIN_LOCKOUT_TIME', 300); // 5 minutes in seconds

// Email settings (using PHPMailer)
define('EMAIL_HOST', 'smtp.example.com');
define('EMAIL_PORT', 587);
define('EMAIL_USERNAME', 'noreply@dtis.example');
define('EMAIL_PASSWORD', 'securepassword');
define('EMAIL_FROM', 'noreply@dtis.example');
define('EMAIL_FROM_NAME', 'DTIS System');

// Rate limiting
define('SUBMISSION_RATE_LIMIT', 5); // Max submissions per hour per user
define('API_RATE_LIMIT', 100); // Max API requests per hour per IP

// Include other core files
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/functions.php';
require_once __DIR__ . '/auth.php';