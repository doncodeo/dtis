<?php
require_once __DIR__ . '/includes/config.php';

if (Auth::isLoggedIn()) {
    header("Location: dashboard.php");
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

require_once __DIR__ . '/includes/header.php';
?>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card">
                <div class="card-header">
                    <h3 class="mb-0">Create Account</h3>
                </div>
                
                <div class="card-body">
                    <?php if ($success): ?>
                        <div class="alert alert-success">
                            Registration successful! Please check your email for the verification code.
                        </div>
                        <a href="login.php" class="btn btn-primary">Go to Login</a>
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
                                    I agree to the <a href="terms.php">Terms of Service</a> and 
                                    <a href="privacy.php">Privacy Policy</a>
                                </label>
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-block">Register</button>
                        </form>
                        
                        <div class="mt-3 text-center">
                            Already have an account? <a href="login.php">Log in</a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Client-side form validation
document.getElementById('registerForm').addEventListener('submit', function(e) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    if (password !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match');
        return false;
    }
    
    if (!document.getElementById('terms').checked) {
        e.preventDefault();
        alert('You must agree to the terms and conditions');
        return false;
    }
    
    return true;
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>