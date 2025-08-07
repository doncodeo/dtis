<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

if (!Auth::isLoggedIn()) {
    header("Location: " . BASE_URL . "login.php");
    exit;
}

// Get user stats
try {
    $userId = $_SESSION['user_id'];
    
    // User's submission count
    $stmt = Database::prepare("
        SELECT COUNT(*) as submission_count
        FROM user_threats
        WHERE user_id = ?
    ");
    $stmt->execute([$userId]);
    $submissionCount = $stmt->fetch()['submission_count'];
    
    // User's recent submissions
    $stmt = Database::prepare("
        SELECT t.*, tc.name as category_name 
        FROM threats t
        JOIN user_threats ut ON t.threat_id = ut.threat_id
        JOIN threat_categories tc ON t.category_id = tc.category_id
        WHERE ut.user_id = ?
        ORDER BY ut.submitted_at DESC
        LIMIT 5
    ");
    $stmt->execute([$userId]);
    $recentSubmissions = $stmt->fetchAll();
} catch (Exception $e) {
    error_log("Error loading dashboard data: " . $e->getMessage());
    $submissionCount = 0;
    $recentSubmissions = [];
}

$pageTitle = "User Dashboard";
require_once __DIR__ . '/includes/header.php';
?>

<div class="container my-4">
    <div class="row">
        <div class="col-md-4">
            <div class="card mb-4">
                <div class="card-body text-center">
                    <img src="https://ui-avatars.com/api/?name=<?= urlencode($_SESSION['email']) ?>&size=120" 
                         class="rounded-circle mb-3" alt="User Avatar">
                    <h4><?= htmlspecialchars($_SESSION['email']) ?></h4>
                    <p class="text-muted">Member since <?= date('M Y', strtotime($user['created_at'] ?? 'now')) ?></p>
                    
                    <div class="list-group">
                        <a href="<?= BASE_URL ?>modules/threats/report.php" class="list-group-item list-group-item-action">
                            <i class="fas fa-plus-circle mr-2"></i> Report New Threat
                        </a>
                        <a href="<?= BASE_URL ?>search.php" class="list-group-item list-group-item-action">
                            <i class="fas fa-search mr-2"></i> Search Threats
                        </a>
                        <?php if (Auth::isAdmin()): ?>
                            <a href="<?= BASE_URL ?>admin/dashboard.php" class="list-group-item list-group-item-action">
                                <i class="fas fa-cog mr-2"></i> Admin Dashboard
                            </a>
                        <?php endif; ?>
                        <a href="<?= BASE_URL ?>logout.php" class="list-group-item list-group-item-action text-danger">
                            <i class="fas fa-sign-out-alt mr-2"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h5>Your Contribution</h5>
                </div>
                <div class="card-body text-center">
                    <div class="display-4 text-primary"><?= $submissionCount ?></div>
                    <p class="text-muted">Threats Reported</p>
                </div>
            </div>
        </div>
        
        <div class="col-md-8">
            <div class="card mb-4">
                <div class="card-header">
                    <h5>Your Recent Submissions</h5>
                </div>
                <div class="card-body">
                    <?php if (empty($recentSubmissions)): ?>
                        <div class="alert alert-info">
                            You haven't submitted any threats yet. 
                            <a href="<?= BASE_URL ?>modules/threats/report.php" class="alert-link">Report your first threat</a> to help protect others.
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Entity</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($recentSubmissions as $submission): ?>
                                        <tr>
                                            <td>
                                                <a href="<?= BASE_URL ?>threats/details.php?id=<?= $submission['threat_id'] ?>">
                                                    <?= htmlspecialchars($submission['entity']) ?>
                                                </a>
                                            </td>
                                            <td><?= $submission['category_name'] ?></td>
                                            <td>
                                                <?php if ($submission['is_verified']): ?>
                                                    <span class="badge badge-success">Verified</span>
                                                <?php else: ?>
                                                    <span class="badge badge-warning">Pending</span>
                                                <?php endif; ?>
                                            </td>
                                            <td><?= date('M j, Y', strtotime($submission['created_at'])) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                        <div class="text-right">
                            <a href="<?= BASE_URL ?>user/submissions.php" class="btn btn-sm btn-primary">View All</a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h5>Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>modules/threats/report.php" class="btn btn-primary btn-block">
                                <i class="fas fa-plus-circle mr-2"></i> Report Threat
                            </a>
                        </div>
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>search.php" class="btn btn-secondary btn-block">
                                <i class="fas fa-search mr-2"></i> Search Database
                            </a>
                        </div>
                        <div class="col-md-6 mb-3">
                            <a href="<?= BASE_URL ?>user/settings.php" class="btn btn-info btn-block">
                                <i class="fas fa-cog mr-2"></i> Account Settings
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>