<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

if (!Auth::isLoggedIn() || !Auth::isAdmin()) {
    header("Location: " . BASE_URL . "login.php");
    exit;
}

// Get stats for dashboard
try {
    // Total threats
    $stmt = Database::prepare("SELECT COUNT(*) as total FROM threats");
    $stmt->execute();
    $totalThreats = $stmt->fetch()['total'];
    
    // Verified threats
    $stmt = Database::prepare("SELECT COUNT(*) as total FROM threats WHERE is_verified = TRUE");
    $stmt->execute();
    $verifiedThreats = $stmt->fetch()['total'];
    
    // Pending appeals
    $stmt = Database::prepare("SELECT COUNT(*) as total FROM appeals WHERE status = 'pending'");
    $stmt->execute();
    $pendingAppeals = $stmt->fetch()['total'];
    
    // Recent threats (last 7 days)
    $stmt = Database::prepare("
        SELECT t.*, tc.name as category_name 
        FROM threats t
        JOIN threat_categories tc ON t.category_id = tc.category_id
        WHERE t.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY t.created_at DESC
        LIMIT 5
    ");
    $stmt->execute();
    $recentThreats = $stmt->fetchAll();
} catch (Exception $e) {
    die("Error loading dashboard data: " . $e->getMessage());
}

$pageTitle = "Admin Dashboard";
require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container mt-4">
    <h1 class="mb-4">Admin Dashboard</h1>
    
    <div class="row mb-4">
        <div class="col-md-3">
            <div class="card text-white bg-primary">
                <div class="card-body">
                    <h5 class="card-title">Total Threats</h5>
                    <p class="card-text display-4"><?= number_format($totalThreats) ?></p>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card text-white bg-success">
                <div class="card-body">
                    <h5 class="card-title">Verified Threats</h5>
                    <p class="card-text display-4"><?= number_format($verifiedThreats) ?></p>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card text-white bg-warning">
                <div class="card-body">
                    <h5 class="card-title">Pending Appeals</h5>
                    <p class="card-text display-4"><?= number_format($pendingAppeals) ?></p>
                </div>
            </div>
        </div>
        
        <div class="col-md-3">
            <div class="card text-white bg-info">
                <div class="card-body">
                    <h5 class="card-title">Total Users</h5>
                    <p class="card-text display-4"><?= number_format($totalUsers) ?></p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>Recent Threats</h5>
                </div>
                <div class="card-body">
                    <?php if (empty($recentThreats)): ?>
                        <p>No recent threats found</p>
                    <?php else: ?>
                        <div class="list-group">
                            <?php foreach ($recentThreats as $threat): ?>
                                <a href="<?= BASE_URL ?>threats/details.php?id=<?= $threat['threat_id'] ?>"
                                   class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1"><?= htmlspecialchars($threat['entity']) ?></h6>
                                        <small><?= $threat['category_name'] ?></small>
                                    </div>
                                    <small>Reported <?= date('M j, Y', strtotime($threat['created_at'])) ?></small>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
                <div class="card-footer text-right">
                    <a href="<?= BASE_URL ?>admin/threats.php" class="btn btn-sm btn-primary">View All</a>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h5>Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>admin/threats.php" class="btn btn-block btn-outline-primary">
                                <i class="fas fa-shield-alt"></i> Manage Threats
                            </a>
                        </div>
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>admin/users.php" class="btn btn-block btn-outline-secondary">
                                <i class="fas fa-users"></i> Manage Users
                            </a>
                        </div>
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>admin/appeals.php" class="btn btn-block btn-outline-warning">
                                <i class="fas fa-gavel"></i> Review Appeals
                            </a>
                        </div>
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>modules/threats/report.php" class="btn btn-block btn-outline-success">
                                <i class="fas fa-plus"></i> Add Threat
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>