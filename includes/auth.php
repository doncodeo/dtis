<?php
// Authentication System

class Auth {
    // Register a new user
    public static function register($email, $password, $firstName = null, $lastName = null) {
        // Validate inputs
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid email format");
        }
        
        if (strlen($password) < 8) {
            throw new Exception("Password must be at least 8 characters");
        }

        // Check if user already exists
        $stmt = Database::prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("Email already registered");
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $verificationCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

        // Insert user
        $stmt = Database::prepare("
            INSERT INTO users (email, password_hash, first_name, last_name, verification_code)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$email, $passwordHash, $firstName, $lastName, $verificationCode]);

        // Send verification email
        self::sendVerificationEmail($email, $verificationCode);

        return $stmt->rowCount() > 0;
    }

    // Send verification email
    private static function sendVerificationEmail($email, $code) {
        $subject = "DTIS Account Verification";
        $message = "
            <h2>Welcome to DTIS</h2>
            <p>Your verification code is: <strong>{$code}</strong></p>
            <p>Enter this code in the verification page to activate your account.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";

        // In production, use PHPMailer or similar
        $headers = "From: " . EMAIL_FROM . "\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        mail($email, $subject, $message, $headers);
    }

    // Verify user with code
    public static function verify($email, $code) {
        $stmt = Database::prepare("
            UPDATE users 
            SET is_verified = TRUE, verification_code = NULL 
            WHERE email = ? AND verification_code = ? AND is_verified = FALSE
        ");
        $stmt->execute([$email, $code]);
        
        return $stmt->rowCount() > 0;
    }

    // Login user
    public static function login($email, $password) {
        // Check login attempts
        if (self::isLoginLocked($email)) {
            throw new Exception("Account temporarily locked. Try again later.");
        }

        // Get user
        $stmt = Database::prepare("
            SELECT user_id, email, password_hash, is_verified 
            FROM users 
            WHERE email = ?
        ");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            self::recordFailedAttempt($email);
            throw new Exception("Invalid email or password");
        }

        if (!$user['is_verified']) {
            throw new Exception("Account not verified. Please check your email.");
        }

        // Update last login
        $stmt = Database::prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);

        // Clear failed attempts
        self::clearFailedAttempts($email);

        // Set session
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['is_verified'] = true;
        $_SESSION['last_activity'] = time();

        return true;
    }

    // Check if user is logged in
    public static function isLoggedIn() {
        return isset($_SESSION['user_id'], $_SESSION['last_activity']) && 
               (time() - $_SESSION['last_activity'] < 86400); // 1 day
    }

    // Logout user
    public static function logout() {
        $_SESSION = array();
        session_destroy();
    }

    // Check if login is locked due to failed attempts
    private static function isLoginLocked($email) {
        $stmt = Database::prepare("
            SELECT COUNT(*) as attempts 
            FROM login_attempts 
            WHERE email = ? AND attempt_time > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");
        $stmt->execute([$email, LOGIN_LOCKOUT_TIME]);
        $result = $stmt->fetch();
        
        return $result['attempts'] >= MAX_LOGIN_ATTEMPTS;
    }

    // Record failed login attempt
    private static function recordFailedAttempt($email) {
        $stmt = Database::prepare("
            INSERT INTO login_attempts (email, attempt_time, ip_address)
            VALUES (?, NOW(), ?)
        ");
        $stmt->execute([$email, $_SERVER['REMOTE_ADDR']]);
    }

    // Clear failed attempts after successful login
    private static function clearFailedAttempts($email) {
        $stmt = Database::prepare("DELETE FROM login_attempts WHERE email = ?");
        $stmt->execute([$email]);
    }
}