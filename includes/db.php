<?php
// Database Connection File

class Database {
    private $host = 'localhost';
    private $db_name = 'dtis';
    private $username = 'root';
    private $password = '';
    private $conn;

    // DB Connect
    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name}", 
                $this->username, 
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->exec("SET NAMES utf8mb4");
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed. Please try again later.");
        }

        return $this->conn;
    }

    // Prepared statement helper
    public static function prepare($sql) {
        $db = new Database();
        $conn = $db->connect();
        return $conn->prepare($sql);
    }
}

// Create database tables if they don't exist (for initial setup)
function initializeDatabase() {
    try {
        $conn = (new Database())->connect();
        
        // Check if users table exists
        $result = $conn->query("SHOW TABLES LIKE 'users'");
        if ($result->rowCount() == 0) {
            // Execute schema.sql
            $schema = file_get_contents(__DIR__ . '/../sql/schema.sql');
            $conn->exec($schema);
        }
    } catch (Exception $e) {
        error_log("Database initialization failed: " . $e->getMessage());
    }
}

// Call initialization (only in development)
if (php_sapi_name() === 'cli' || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    initializeDatabase();
}