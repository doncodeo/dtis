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

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     description: Creates a new article.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Article created successfully.
 *       401:
 *         description: Unauthorized.
 *   get:
 *     summary: Get all articles
 *     description: Retrieves a list of all articles.
 *     responses:
 *       200:
 *         description: A list of articles.
 */
router.route('/')
    .post(protect, adminOnly, createArticle)
    .get(getArticles);

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get an article by ID
 *     description: Retrieves a single article by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the article to retrieve.
 *     responses:
 *       200:
 *         description: The article data.
 *       404:
 *         description: Article not found.
 *   put:
 *     summary: Update an article
 *     description: Updates an existing article.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the article to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Article updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Article not found.
 *   delete:
 *     summary: Delete an article
 *     description: Deletes an article.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the article to delete.
 *     responses:
 *       200:
 *         description: Article removed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Article not found.
 */
router.route('/:id')
    .get(getArticleById)
    .put(protect, adminOnly, updateArticle)
    .delete(protect, adminOnly, deleteArticle);

module.exports = router;
