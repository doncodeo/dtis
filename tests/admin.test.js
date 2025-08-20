const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const adminRoutes = require('../routes/adminRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/user');
const Report = require('../models/report');

// Mock the auth middleware
jest.mock('../middleware/authMiddleware', () => ({
    protect: jest.fn((req, res, next) => {
        next();
    }),
    adminOnly: jest.fn((req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Forbidden' });
        }
    })
}));

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
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

    describe('PUT /api/admin/reports/:id/verify', () => {
        it('should verify a report', async () => {
            const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
            await admin.save();

            const report = new Report({ instrument: 'test.com', type: 'website', reviews: [{ user: admin._id, description: 'test' }] });
            await report.save();

            authMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = admin;
                next();
            });

            const res = await request(app)
                .put(`/api/admin/reports/${report._id}/verify`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.verificationStatus).toBe('verified');
        });
    });

    describe('PUT /api/admin/reports/:id/set-visibility', () => {
        it('should set the visibility of a report', async () => {
            const admin = new User({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
            await admin.save();

            const report = new Report({ instrument: 'test.com', type: 'website', isPublic: true, reviews: [{ user: admin._id, description: 'test' }] });
            await report.save();

            authMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = admin;
                next();
            });

            const res = await request(app)
                .put(`/api/admin/reports/${report._id}/set-visibility`)
                .send({ isPublic: false });

            expect(res.statusCode).toEqual(200);
            expect(res.body.isPublic).toBe(false);
        });
    });
});
