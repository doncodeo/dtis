<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/header.php';

// Get stats for homepage
try {
    $stmt = Database::prepare("
        SELECT COUNT(*) as total_threats, 
               SUM(is_verified) as verified_threats
        FROM threats
    ");
    $stmt->execute();
    $stats = $stmt->fetch();
    
    // Get recently verified threats
    $stmt = Database::prepare("
        SELECT t.*, tc.name as category_name 
        FROM threats t
        JOIN threat_categories tc ON t.category_id = tc.category_id
        WHERE t.is_verified = TRUE
        ORDER BY t.updated_at DESC
        LIMIT 5
    ");
    $stmt->execute();
    $recentThreats = $stmt->fetchAll();
} catch (Exception $e) {
    error_log("Error loading homepage data: " . $e->getMessage());
    $stats = ['total_threats' => 0, 'verified_threats' => 0];
    $recentThreats = [];
}
?>

<div class="container my-5">
    <div class="jumbotron text-center">
        <h1 class="display-4">Digital Threat Intelligence System</h1>
        <p class="lead">Community-powered protection against online threats</p>
        <hr class="my-4">
        <div class="row">
            <div class="col-md-6 mx-auto">
                <div class="card-deck mb-4">
                    <div class="card text-white bg-primary">
                        <div class="card-body">
                            <h5 class="card-title">Total Threats</h5>
                            <p class="card-text display-4"><?= number_format($stats['total_threats']) ?></p>
                        </div>
                    </div>
                    <div class="card text-white bg-success">
                        <div class="card-body">
                            <h5 class="card-title">Verified Threats</h5>
                            <p class="card-text display-4"><?= number_format($stats['verified_threats']) ?></p>
                        </div>
                    </div>
                </div>
                <a href="<?= BASE_URL ?>search.php" class="btn btn-primary btn-lg mr-3">
                    <i class="fas fa-search"></i> Search Threats
                </a>
                <?php if (Auth::isLoggedIn()): ?>
                    <a href="<?= BASE_URL ?>dashboard.php" class="btn btn-secondary btn-lg">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                <?php else: ?>
                    <a href="<?= BASE_URL ?>register.php" class="btn btn-secondary btn-lg">
                        <i class="fas fa-user-plus"></i> Join Now
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <?php if (!empty($recentThreats)): ?>
        <div class="row">
            <div class="col-md-8 mx-auto">
                <div class="card">
                    <div class="card-header">
                        <h3>Recently Verified Threats</h3>
                    </div>
                    <div class="card-body">
                        <div class="list-group">
                            <?php foreach ($recentThreats as $threat): ?>
                                <a href="<?= BASE_URL ?>threats/details.php?id=<?= $threat['threat_id'] ?>"
                                   class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1"><?= htmlspecialchars($threat['entity']) ?></h5>
                                        <span class="badge badge-primary"><?= $threat['category_name'] ?></span>
                                    </div>
                                    <p class="mb-1"><?= htmlspecialchars(substr($threat['description'] ?? '', 0, 100)) ?></p>
                                    <small>Verified by <?= $threat['verification_count'] ?> users</small>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <a href="<?= BASE_URL ?>search.php" class="btn btn-primary">View All Threats</a>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="row mt-5">
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body text-center">
                    <i class="fas fa-shield-alt fa-3x text-primary mb-3"></i>
                    <h3>Community Protection</h3>
                    <p>Collective threat identification by thousands of users working together to keep the internet safe.</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body text-center">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h3>Verified Intelligence</h3>
                    <p>Threats only appear in our database after being verified by multiple independent sources.</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body text-center">
                    <i class="fas fa-bell fa-3x text-warning mb-3"></i>
                    <h3>Real-time Alerts</h3>
                    <p>Get notified about new threats matching your watchlist or area of interest.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>