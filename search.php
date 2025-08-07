<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/header.php';

// Search functionality
$searchTerm = $_GET['q'] ?? '';
$categoryId = $_GET['category'] ?? null;
$verifiedOnly = isset($_GET['verified']) ? (bool)$_GET['verified'] : true;

// Build query
$query = "SELECT t.*, tc.name as category_name 
          FROM threats t
          JOIN threat_categories tc ON t.category_id = tc.category_id
          WHERE 1=1";

$params = [];
$types = '';

if (!empty($searchTerm)) {
    $query .= " AND (t.entity LIKE ? OR t.description LIKE ?)";
    $params[] = "%$searchTerm%";
    $params[] = "%$searchTerm%";
    $types .= 'ss';
}

if ($verifiedOnly) {
    $query .= " AND t.is_verified = TRUE";
}

if ($categoryId && is_numeric($categoryId)) {
    $query .= " AND t.category_id = ?";
    $params[] = $categoryId;
    $types .= 'i';
}

$query .= " ORDER BY t.verification_count DESC, t.updated_at DESC";

// Execute query
$stmt = Database::prepare($query);
if (!empty($params)) {
    $stmt->execute($params);
} else {
    $stmt->execute();
}

$threats = $stmt->fetchAll();

// Get categories for filter dropdown
$stmt = Database::prepare("SELECT * FROM threat_categories ORDER BY name");
$stmt->execute();
$categories = $stmt->fetchAll();
?>

<div class="container">
    <h1>Threat Database</h1>
    
    <!-- Search Form -->
    <form method="get" class="search-form">
        <div class="form-row">
            <div class="form-group col-md-6">
                <input type="text" name="q" class="form-control" placeholder="Search threats..." 
                       value="<?= htmlspecialchars($searchTerm) ?>">
            </div>
            <div class="form-group col-md-3">
                <select name="category" class="form-control">
                    <option value="">All Categories</option>
                    <?php foreach ($categories as $category): ?>
                        <option value="<?= $category['category_id'] ?>" 
                            <?= $categoryId == $category['category_id'] ? 'selected' : '' ?>>
                            <?= htmlspecialchars($category['name']) ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group col-md-3">
                <button type="submit" class="btn btn-primary btn-block">Search</button>
            </div>
        </div>
        <div class="form-check">
            <input type="checkbox" name="verified" id="verified" class="form-check-input" 
                   <?= $verifiedOnly ? 'checked' : '' ?>>
            <label for="verified" class="form-check-label">Show only verified threats</label>
        </div>
    </form>
    
    <!-- Results -->
    <div class="threat-list mt-4">
        <?php if (empty($threats)): ?>
            <div class="alert alert-info">No threats found matching your criteria.</div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Entity</th>
                            <th>Category</th>
                            <th>Verifications</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($threats as $threat): ?>
                            <tr>
                                <td>
                                    <a href="threat-details.php?id=<?= $threat['threat_id'] ?>">
                                        <?= htmlspecialchars($threat['entity']) ?>
                                    </a>
                                </td>
                                <td><?= htmlspecialchars($threat['category_name']) ?></td>
                                <td><?= $threat['verification_count'] ?></td>
                                <td><?= date('M j, Y', strtotime($threat['updated_at'])) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>