const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const watchlistRoutes = require('../routes/watchlistRoutes');
const User = require('../models/user');
const Watchlist = require('../models/watchlist');
const { protect } = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());

// Mock auth middleware
jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        // This will be overridden in tests where needed
        next();
    }),
}));

app.use('/api/watchlist', watchlistRoutes);

// Custom error handler to catch errors thrown by async middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});


describe('Watchlist Routes', () => {
    let mongoServer;
    let testUser;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password'
        });
        await testUser.save();

        // Setup mock for protect middleware
        protect.mockImplementation((req, res, next) => {
            req.user = testUser;
            next();
        });
    });

    afterEach(async () => {
        await User.deleteMany();
        await Watchlist.deleteMany();
    });

    describe('DELETE /api/watchlist/:id', () => {
        it('should delete a watchlist item for the authenticated user', async () => {
            const watchlistItem = new Watchlist({
                user: testUser._id,
                category: 'phone'
            });
            await watchlistItem.save();

            const res = await request(app)
                .delete(`/api/watchlist/${watchlistItem._id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Watchlist item removed');

            const deletedItem = await Watchlist.findById(watchlistItem._id);
            expect(deletedItem).toBeNull();
        });

        it('should return 404 if watchlist item not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/watchlist/${nonExistentId}`);

            expect(res.statusCode).toBe(404);
        });

        it('should return 401 if user tries to delete another user\'s watchlist item', async () => {
            const otherUser = new User({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password'
            });
            await otherUser.save();

            const watchlistItem = new Watchlist({
                user: otherUser._id,
                category: 'email'
            });
            await watchlistItem.save();

            const res = await request(app)
                .delete(`/api/watchlist/${watchlistItem._id}`);

            expect(res.statusCode).toBe(401);
        });
    });
});
