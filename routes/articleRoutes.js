const express = require('express');
const router = express.Router();
const {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle
} = require('../controllers/articleController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, adminOnly, createArticle)
    .get(getArticles);

router.route('/:id')
    .get(getArticleById)
    .put(protect, adminOnly, updateArticle)
    .delete(protect, adminOnly, deleteArticle);

module.exports = router;
