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

// Dynamic BASE_URL calculation
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
// Get the physical path of the project root directory
$project_root_fs = dirname(__DIR__);
// Get the physical path of the web server's document root
$document_root_fs = $_SERVER['DOCUMENT_ROOT'];

// Replace backslashes with forward slashes for Windows compatibility
$project_root_fs = str_replace('\\', '/', $project_root_fs);
$document_root_fs = str_replace('\\', '/', $document_root_fs);

// Calculate the URI path by removing the document root from the project root path
$uri_path = str_replace($document_root_fs, '', $project_root_fs);
// Ensure there is a single trailing slash
$uri_path = rtrim($uri_path, '/') . '/';

define('BASE_URL', $protocol . $host . $uri_path);


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