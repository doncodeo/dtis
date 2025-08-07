<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

if (Auth::isLoggedIn() && Auth::isVerified()) {
    header("Location: " . BASE_URL . "dashboard.php");
    exit;
}

if (!Auth::isLoggedIn()) {
    header("Location: " . BASE_URL . "login.php?redirect=" . BASE_URL . "verify.php");
    exit;
}

$errors = [];
$success = false;
$email = $_SESSION['email'];

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $code = trim($_POST['code']);
        
        if (Auth::verify($email, $code)) {
            $_SESSION['is_verified'] = true;
            $success = true;
        } else {
            $errors[] = "Invalid verification code. Please try again.";
        }
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
}

// Handle resend request
if (isset($_GET['resend'])) {
    try {
        // Generate new code
        $newCode = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $stmt = Database::prepare("
            UPDATE users 
            SET verification_code = ?
            WHERE email = ? AND is_verified = FALSE
        ");
        $stmt->execute([$newCode, $email]);
        
        // Send email
        Auth::sendVerificationEmail($email, $newCode);
        
        $successMsg = "A new verification code has been sent to your email.";
    } catch (Exception $e) {
        $errors[] = "Failed to resend verification code: " . $e->getMessage();
    }
}

$pageTitle = "Verify Account";
require_once __DIR__ . '/includes/header.php';
?>

<div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
            <h2>Verify Your Account</h2>
        </div>
        
        <div class="auth-body">
            <?php if ($success): ?>
                <div class="alert alert-success">
                    Your account has been verified successfully!
                </div>
                <a href="<?= BASE_URL ?>dashboard.php" class="btn btn-primary btn-block">Continue to Dashboard</a>
            <?php else: ?>
                <?php if (!empty($errors)): ?>
                    <div class="alert alert-danger">
                        <?php foreach ($errors as $error): ?>
                            <p class="mb-0"><?= htmlspecialchars($error) ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <?php if (isset($successMsg)): ?>
                    <div class="alert alert-success">
                        <?= htmlspecialchars($successMsg) ?>
                    </div>
                <?php endif; ?>
                
                <p class="text-center">
                    We've sent a 6-digit verification code to <strong><?= htmlspecialchars($email) ?></strong>.
                    Please enter it below to verify your account.
                </p>
                
                <form method="post" id="verifyForm">
                    <div class="form-group">
                        <label for="code">Verification Code</label>
                        <input type="text" class="form-control" id="code" name="code" 
                               required pattern="\d{6}" maxlength="6">
                        <small class="form-text text-muted">
                            Enter the 6-digit code you received via email
                        </small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">Verify Account</button>
                </form>
                
                <div class="text-center mt-3">
                    <p>Didn't receive the code? <a href="?resend=1">Resend Verification Code</a></p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
setupFormValidation('verifyForm', {
    code: {
        required: true,
        pattern: /^\d{6}$/,
        requiredMessage: 'Verification code is required',
        validateMessage: 'Code must be 6 digits'
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>