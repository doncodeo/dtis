const Article = require('../models/article');
const asyncHandler = require('express-async-handler');

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private/Admin
const createArticle = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;
    const author = req.user._id;

    const article = new Article({
        title,
        content,
        author,
        tags
    });

    const createdArticle = await article.save();
    res.status(201).json(createdArticle);
});

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
    const articles = await Article.find({}).populate('author', 'name');
    res.json(articles);
});

// @desc    Get an article by ID
// @route   GET /api/articles/:id
// @access  Public
const getArticleById = asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id).populate('author', 'name');

    if (article) {
        res.json(article);
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
});

// @desc    Update an article
// @route   PUT /api/articles/:id
// @access  Private/Admin
const updateArticle = asyncHandler(async (req, res) => {
    const { title, content, tags } = req.body;
    const article = await Article.findById(req.params.id);

    if (article) {
        article.title = title || article.title;
        article.content = content || article.content;
        article.tags = tags || article.tags;

        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
});

// @desc    Delete an article
// @route   DELETE /api/articles/:id
// @access  Private/Admin
const deleteArticle = asyncHandler(async (req, res) => {
    const article = await Article.findById(req.params.id);

    if (article) {
        await article.remove();
        res.json({ message: 'Article removed' });
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
});

module.exports = {
    createArticle,
    getArticles,
    getArticleById,
    updateArticle,
    deleteArticle
};
