const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const articleRoutes = require('../routes/articleRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');
const Article = require('../models/article');

// Mock the auth middleware
jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        // This will be overridden in tests where needed
        req.user = { _id: '60d5ec49e0f3f82c8c4a6c4b', role: 'user' };
        next();
    }),
    adminOnly: jest.fn((req, res, next) => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    })
}));

const app = express();
app.use(express.json());
app.use('/api/articles', articleRoutes);

describe('Article Routes', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await Article.deleteMany();
        await User.deleteMany();
    });

    describe('POST /api/articles', () => {
        it('should create an article if user is admin', async () => {
            const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
            await admin.save();

            // Mock the middleware to simulate an admin user
            authMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = { _id: admin._id, role: 'admin' };
                next();
            });

            const res = await request(app)
                .post('/api/articles')
                .send({
                    title: 'Test Article',
                    content: 'This is a test article.',
                    tags: ['test', 'jest']
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.title).toBe('Test Article');
        });

        it('should not create an article if user is not admin', async () => {
            const user = new User({ name: 'User', email: 'user@test.com', password: 'password', role: 'user' });
            await user.save();

            // Mock the middleware to simulate a regular user
            authMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = { _id: user._id, role: 'user' };
                next();
            });

            const res = await request(app)
                .post('/api/articles')
                .send({
                    title: 'Test Article',
                    content: 'This is a test article.',
                    tags: ['test', 'jest']
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/articles', () => {
        it('should return all articles', async () => {
            const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password' });
            await admin.save();

            await Article.create({ title: 'Article 1', content: 'Content 1', author: admin._id });
            await Article.create({ title: 'Article 2', content: 'Content 2', author: admin._id });

            const res = await request(app).get('/api/articles');

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(2);
        });
    });
});
