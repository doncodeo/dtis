<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

if (!Auth::isLoggedIn() || !Auth::isVerified()) {
    header("Location: " . BASE_URL . "login.php?redirect=" . urlencode(BASE_URL . "modules/threats/report.php"));
    exit;
}

$errors = [];
$success = false;
$categories = [];

// Get threat categories
try {
    $stmt = Database::prepare("SELECT * FROM threat_categories ORDER BY name");
    $stmt->execute();
    $categories = $stmt->fetchAll();
} catch (Exception $e) {
    $errors[] = "Failed to load categories: " . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $entity = trim($_POST['entity']);
        $categoryId = (int)$_POST['category_id'];
        $description = trim($_POST['description'] ?? '');
        
        $threatId = ThreatReporter::reportThreat($_SESSION['user_id'], $entity, $categoryId, $description);
        $success = true;
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
}

$pageTitle = "Report Threat";
require_once __DIR__ . '/../../includes/header.php';
?>

<div class="container mt-4">
    <div class="row">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-header">
                    <h3>Report a Threat</h3>
                </div>
                
                <div class="card-body">
                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            Your threat report has been submitted successfully. Thank you for contributing to our community.
                        </div>
                        <a href="<?= BASE_URL ?>modules/threats/report.php" class="btn btn-primary">Report Another</a>
                        <a href="<?= BASE_URL ?>dashboard.php" class="btn btn-secondary">Go to Dashboard</a>
                    <?php else: ?>
                        <?php if (!empty($errors)): ?>
                            <div class="alert alert-danger">
                                <?php foreach ($errors as $error): ?>
                                    <p class="mb-0"><?= htmlspecialchars($error) ?></p>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                        
                        <form method="post" id="threatReportForm">
                            <div class="form-group">
                                <label for="category_id">Threat Type</label>
                                <select class="form-control" id="category_id" name="category_id" required>
                                    <option value="">Select a category</option>
                                    <?php foreach ($categories as $category): ?>
                                        <option value="<?= $category['category_id'] ?>">
                                            <?= htmlspecialchars($category['name']) ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="entity">Threat Entity</label>
                                <input type="text" class="form-control" id="entity" name="entity" required>
                                <small class="form-text text-muted">
                                    Enter the URL, email address, or phone number you want to report
                                </small>
                            </div>
                            
                            <div class="form-group">
                                <label for="description">Description (Optional)</label>
                                <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                                <small class="form-text text-muted">
                                    Provide additional details about this threat (how you encountered it, what happened, etc.)
                                </small>
                            </div>
                            
                            <button type="submit" class="btn btn-primary">Submit Report</button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    setupFormValidation('threatReportForm', {
        category_id: {
            required: true,
            requiredMessage: 'Please select a threat type'
        },
        entity: {
            required: true,
            requiredMessage: 'Please enter the threat entity',
            validate: function(value) {
                const category = document.getElementById('category_id').value;
                if (category === '1') { // Phishing Website
                    return validateURL(value);
                } else if (category === '2') { // Scam Email
                    return validateEmail(value);
                } else if (category === '3') { // Fraudulent Phone Number
                    return validatePhone(value);
                }
                return true;
            },
            validateMessage: 'Invalid format for selected threat type'
        }
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>