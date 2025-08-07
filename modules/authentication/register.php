<?php
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/auth.php';

if (Auth::isLoggedIn()) {
    header("Location: " . BASE_URL . "dashboard.php");
    exit;
}

$errors = [];
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email']);
        $password = $_POST['password'];
        $firstName = trim($_POST['first_name'] ?? '');
        $lastName = trim($_POST['last_name'] ?? '');
        
        if (Auth::register($email, $password, $firstName, $lastName)) {
            $success = true;
        }
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
}

$pageTitle = "Register";
require_once __DIR__ . '/../../includes/header.php';
?>

<div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
            <h2>Create Account</h2>
        </div>
        
        <div class="auth-body">
            <?php if ($success): ?>
                <div class="alert alert-success">
                    Registration successful! Please check your email for the verification code.
                </div>
                <a href="<?= BASE_URL ?>login.php" class="btn btn-primary">Go to Login</a>
            <?php else: ?>
                <?php if (!empty($errors)): ?>
                    <div class="alert alert-danger">
                        <?php foreach ($errors as $error): ?>
                            <p class="mb-0"><?= htmlspecialchars($error) ?></p>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
                
                <form method="post" id="registerForm">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" class="form-control" id="email" name="email" 
                               required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" id="password" name="password" 
                               required minlength="8">
                        <small class="form-text text-muted">
                            Must be at least 8 characters long.
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_password">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm_password" 
                               name="confirm_password" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="first_name">First Name (Optional)</label>
                            <input type="text" class="form-control" id="first_name" name="first_name" 
                                   value="<?= htmlspecialchars($_POST['first_name'] ?? '') ?>">
                        </div>
                        <div class="form-group col-md-6">
                            <label for="last_name">Last Name (Optional)</label>
                            <input type="text" class="form-control" id="last_name" name="last_name" 
                                   value="<?= htmlspecialchars($_POST['last_name'] ?? '') ?>">
                        </div>
                    </div>
                    
                    <div class="form-group form-check">
                        <input type="checkbox" class="form-check-input" id="terms" name="terms" required>
                        <label class="form-check-label" for="terms">
                            I agree to the <a href="<?= BASE_URL ?>terms.php">Terms of Service</a> and
                            <a href="<?= BASE_URL ?>privacy.php">Privacy Policy</a>
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-block">Register</button>
                </form>
                
                <div class="auth-footer">
                    Already have an account? <a href="<?= BASE_URL ?>login.php">Log in</a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    setupFormValidation('registerForm', {
        email: {
            required: true,
            type: 'email',
            requiredMessage: 'Email is required'
        },
        password: {
            required: true,
            type: 'password',
            requiredMessage: 'Password is required'
        },
        confirmPassword: {
            required: true,
            requiredMessage: 'Please confirm your password'
        },
        terms: {
            required: true,
            requiredMessage: 'You must agree to the terms'
        }
    });
});
</script>

<?php require_once __DIR__ . '/../../includes/footer.php'; ?>