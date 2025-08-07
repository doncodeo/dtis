        </main>
        
        <footer class="bg-dark text-white py-4 mt-4">
            <div class="container">
                <div class="row">
                    <div class="col-md-4">
                        <h5>About DTIS</h5>
                        <p>The Digital Threat Intelligence System is a community-driven platform to identify and report online threats.</p>
                    </div>
                    <div class="col-md-4">
                        <h5>Quick Links</h5>
                        <ul class="list-unstyled">
                            <li><a href="<?= BASE_URL ?>search.php" class="text-white">Threat Database</a></li>
                            <li><a href="<?= BASE_URL ?>report.php" class="text-white">Report a Threat</a></li>
                            <li><a href="<?= BASE_URL ?>appeal.php" class="text-white">Submit an Appeal</a></li>
                        </ul>
                    </div>
                    <div class="col-md-4">
                        <h5>Legal</h5>
                        <ul class="list-unstyled">
                            <li><a href="<?= BASE_URL ?>terms.php" class="text-white">Terms of Service</a></li>
                            <li><a href="<?= BASE_URL ?>privacy.php" class="text-white">Privacy Policy</a></li>
                            <li><a href="<?= BASE_URL ?>contact.php" class="text-white">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                <div class="text-center mt-3">
                    <p>&copy; <?= date('Y') ?> Digital Threat Intelligence System. All rights reserved.</p>
                </div>
            </div>
        </footer>
        
        <!-- JavaScript -->
        <script src="<?= BASE_URL ?>assets/js/main.js"></script>
        <script src="<?= BASE_URL ?>assets/js/form-validation.js"></script>
        <?php if (isset($additionalJS)): ?>
            <?php foreach ($additionalJS as $jsFile): ?>
                <script src="<?= BASE_URL ?>assets/js/<?= $jsFile ?>"></script>
            <?php endforeach; ?>
        <?php endif; ?>
    </body>
</html>