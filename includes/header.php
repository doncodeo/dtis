<?php
// Common Header
if (!isset($pageTitle)) {
    $pageTitle = "Digital Threat Intelligence System";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle) ?> | DTIS</title>
    
    <!-- Favicon -->
    <link rel="icon" href="<?= BASE_URL ?>assets/images/favicon.ico" type="image/x-icon">
    
    <!-- CSS -->
    <link rel="stylesheet" href="<?= BASE_URL ?>assets/css/main.css">
    <?php if (isset($additionalCSS)): ?>
        <?php foreach ($additionalCSS as $cssFile): ?>
            <link rel="stylesheet" href="<?= BASE_URL ?>assets/css/<?= $cssFile ?>">
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?= generateCSRFToken() ?>">
</head>
<body>
    <header>
        <div class="container">
            <nav class="navbar">
                <div class="logo">
                    <a href="<?= BASE_URL ?>">
                        <img src="<?= BASE_URL ?>assets/images/logo.png" alt="DTIS Logo">
                        <h1>DTIS</h1>
                    </a>
                </div>
                
                <button id="mobile-menu-btn" class="d-md-none btn btn-outline-primary">
                    <i class="fas fa-bars"></i>
                </button>
                
                <ul class="nav-links d-none d-md-flex">
                    <li><a href="<?= BASE_URL ?>search.php">Threat Database</a></li>
                    <?php if (Auth::isLoggedIn()): ?>
                        <?php if (Auth::isAdmin()): ?>
                            <li><a href="<?= BASE_URL ?>admin/dashboard.php">Admin</a></li>
                        <?php endif; ?>
                        <li><a href="<?= BASE_URL ?>dashboard.php">Dashboard</a></li>
                        <li><a href="<?= BASE_URL ?>logout.php">Logout</a></li>
                    <?php else: ?>
                        <li><a href="<?= BASE_URL ?>login.php">Login</a></li>
                        <li><a href="<?= BASE_URL ?>register.php">Register</a></li>
                    <?php endif; ?>
                </ul>
            </nav>
            
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="d-md-none hidden mt-3">
                <div class="list-group">
                    <a href="<?= BASE_URL ?>search.php" class="list-group-item list-group-item-action">Threat Database</a>
                    <?php if (Auth::isLoggedIn()): ?>
                        <?php if (Auth::isAdmin()): ?>
                            <a href="<?= BASE_URL ?>admin/dashboard.php" class="list-group-item list-group-item-action">Admin</a>
                        <?php endif; ?>
                        <a href="<?= BASE_URL ?>dashboard.php" class="list-group-item list-group-item-action">Dashboard</a>
                        <a href="<?= BASE_URL ?>logout.php" class="list-group-item list-group-item-action">Logout</a>
                    <?php else: ?>
                        <a href="<?= BASE_URL ?>login.php" class="list-group-item list-group-item-action">Login</a>
                        <a href="<?= BASE_URL ?>register.php" class="list-group-item list-group-item-action">Register</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </header>
    
    <main>