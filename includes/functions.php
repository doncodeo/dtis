<?php
// Utility Functions

function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function redirect($url) {
    header("Location: $url");
    exit;
}

function isAjaxRequest() {
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function getThreatCategoryName($categoryId) {
    static $categories = null;
    
    if ($categories === null) {
        $stmt = Database::prepare("SELECT category_id, name FROM threat_categories");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    }
    
    return $categories[$categoryId] ?? 'Unknown';
}

function formatDateTime($dateTime, $format = 'M j, Y H:i') {
    $date = new DateTime($dateTime);
    return $date->format($format);
}

function checkRateLimit($key, $limit, $interval) {
    $cacheKey = "rate_limit_{$key}";
    
    if (!isset($_SESSION[$cacheKey])) {
        $_SESSION[$cacheKey] = [
            'count' => 1,
            'time' => time()
        ];
        return false;
    }
    
    $data = $_SESSION[$cacheKey];
    
    if ((time() - $data['time']) > $interval) {
        $_SESSION[$cacheKey] = [
            'count' => 1,
            'time' => time()
        ];
        return false;
    }
    
    if ($data['count'] >= $limit) {
        return true;
    }
    
    $_SESSION[$cacheKey]['count']++;
    return false;
}