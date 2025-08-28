const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const reportRoutes = require('../routes/reportRoutes');
const Report = require('../models/report');
const User = require('../models/user');

const app = express();
app.use(express.json());
app.use('/api/reports', reportRoutes);

// Mock auth middleware for protected routes if any are added to this test file
jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        // a mock user can be attached to req if needed by any of the routes
        next();
    }),
    adminOnly: jest.fn((req, res, next) => {
        next();
    })
}));


describe('Report Routes', () => {
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
        await Report.deleteMany();
        await User.deleteMany();
    });

    describe('GET /api/reports/stats/total', () => {
        it('should return the total number of all threats and verified threats', async () => {
            const user = new User({ name: 'Test User', email: 'test@test.com', password: 'password' });
            await user.save();

            await Report.create([
                { instrument: 'test1.com', type: 'Fraudulent Website', reviews: [{ user: user._id, description: 'test' }], verificationStatus: 'verified' },
                { instrument: 'test2.com', type: 'Fraudulent Website', reviews: [{ user: user._id, description: 'test' }], verificationStatus: 'verified' },
                { instrument: 'test3.com', type: 'Fraudulent Website', reviews: [{ user: user._id, description: 'test' }], verificationStatus: 'unverified' },
                { instrument: 'test4.com', type: 'Fraudulent Website', reviews: [{ user: user._id, description: 'test' }], verificationStatus: 'unverified' },
                { instrument: 'test5.com', type: 'Fraudulent Website', reviews: [{ user: user._id, description: 'test' }], verificationStatus: 'verified' },
            ]);

            const res = await request(app)
                .get('/api/reports/stats/total');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.stats.totalThreats).toBe(5);
            expect(res.body.stats.verifiedThreats).toBe(3);
        });
    });
});
