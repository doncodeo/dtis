<?php
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/auth.php';

if (Auth::isLoggedIn()) {
    header("Location: /dashboard.php");
    exit;
}

$errors = [];
$redirect = $_GET['redirect'] ?? '/dashboard.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $email = trim($_POST['email']);
        $password = $_POST['password'];
        $remember = isset($_POST['remember']);
        
        if (Auth::login($email, $password)) {
            if ($remember) {
                // Set persistent cookie (30 days)
                $token = bin2hex(random_bytes(32));
                $expires = time() + 30 * 24 * 60 * 60;
                
                $stmt = Database::prepare("
                    INSERT INTO remember_tokens (user_id, token, expires_at)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([
                    $_SESSION['user_id'],
                    password_hash($token, PASSWORD_BCRYPT),
                    date('Y-m-d H:i:s', $expires)
                ]);
                
                setcookie('remember_token', $token, $expires, '/', '', true, true);
            }
            
            header("Location: $redirect");
            exit;
        }
    } catch (Exception $e) {
        $errors[] = $e->getMessage();
    }
}

$pageTitle = "Login";
require_once __DIR__ . '/includes/header.php';
?>

<div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
            <h2>Sign In</h2>
        </div>
        
        <div class="auth-body">
            <?php if (!empty($errors)): ?>
                <div class="alert alert-danger">
                    <?php foreach ($errors as $error): ?>
                        <p class="mb-0"><?= htmlspecialchars($error) ?></p>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
            
            <form method="post" id="loginForm">
                <input type="hidden" name="redirect" value="<?= htmlspecialchars($redirect) ?>">
                
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" class="form-control" id="email" name="email" 
                           required value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required>
                    <small class="form-text text-right">
                        <a href="/password-reset.php">Forgot password?</a>
                    </small>
                </div>
                
                <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="remember" name="remember">
                    <label class="form-check-label" for="remember">Remember me</label>
                </div>
                
                <button type="submit" class="btn btn-primary btn-block">Sign In</button>
                
                <div class="social-login mt-4">
                    <p class="text-center text-muted">Or sign in with</p>
                    <a href="/auth/google" class="social-btn google">
                        <i class="fab fa-google"></i> Google
                    </a>
                    <a href="/auth/facebook" class="social-btn facebook">
                        <i class="fab fa-facebook-f"></i> Facebook
                    </a>
                </div>
            </form>
        </div>
        
        <div class="auth-footer">
            Don't have an account? <a href="/register.php">Sign up</a>
        </div>
    </div>
</div>

<script>
setupFormValidation('loginForm', {
    email: {
        required: true,
        type: 'email',
        requiredMessage: 'Email is required'
    },
    password: {
        required: true,
        requiredMessage: 'Password is required'
    }
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>