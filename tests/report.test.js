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

// Mock auth middleware for protected routes
const mockAuthMiddleware = require('../middleware/authMiddleware');
jest.mock('../middleware/authMiddleware');


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

    describe('PUT /api/reports/:id', () => {
        let user, report;

        beforeEach(async () => {
            user = new User({ name: 'Test User', email: 'test@test.com', password: 'password' });
            await user.save();

            report = new Report({
                instrument: 'test.com',
                type: 'Fraudulent Website',
                reviews: [{ user: user._id, description: 'Initial review' }],
                createdBy: user._id
            });
            await report.save();

            mockAuthMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = user;
                next();
            });
        });

        it('should allow a user to update their own review within one hour', async () => {
            const res = await request(app)
                .put(`/api/reports/${report._id}`)
                .send({ description: 'Updated review' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Report updated successfully.');
            const updatedReport = await Report.findById(report._id);
            expect(updatedReport.reviews[0].description).toBe('Updated review');
        });

        it('should not allow a user to update their own report after one hour', async () => {
            report.createdAt = new Date(Date.now() - 3600001);
            await report.save();

            const res = await request(app)
                .put(`/api/reports/${report._id}`)
                .send({ description: 'Updated review' });

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toBe('You can only edit a report within one hour of creation.');
        });

        it('should not allow a user to update another user\'s report', async () => {
            const anotherUser = new User({ name: 'Another User', email: 'another@test.com', password: 'password' });
            await anotherUser.save();

            const anotherReport = new Report({
                instrument: 'another-test.com',
                type: 'Fraudulent Website',
                reviews: [{ user: anotherUser._id, description: 'Initial review' }],
                createdBy: anotherUser._id
            });
            await anotherReport.save();

            mockAuthMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = user;
                next();
            });

            const res = await request(app)
                .put(`/api/reports/${anotherReport._id}`)
                .send({ description: 'Updated report' });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /api/reports/admin/:id', () => {
        let adminUser, report;

        beforeEach(async () => {
            adminUser = new User({ name: 'Admin User', email: 'admin@test.com', password: 'password', role: 'admin' });
            await adminUser.save();

            const regularUser = new User({ name: 'Test User', email: 'test@test.com', password: 'password' });
            await regularUser.save();

            report = new Report({
                instrument: 'test.com',
                type: 'Fraudulent Website',
                reviews: [{ user: regularUser._id, description: 'Initial review' }]
            });
            await report.save();

            mockAuthMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = adminUser;
                next();
            });
            mockAuthMiddleware.adminOnly.mockImplementation((req, res, next) => {
                if (req.user.role === 'admin') {
                    next();
                } else {
                    res.status(403).json({ message: 'Forbidden' });
                }
            });
        });

        it('should allow an admin to update any report', async () => {
            const res = await request(app)
                .put(`/api/reports/admin/${report._id}`)
                .send({ riskLevel: 'high' });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Report updated successfully.');
            const updatedReport = await Report.findById(report._id);
            expect(updatedReport.riskLevel).toBe('high');
        });
    });

    describe('DELETE /api/reports/admin/:id', () => {
        let adminUser, report;

        beforeEach(async () => {
            adminUser = new User({ name: 'Admin User', email: 'admin@test.com', password: 'password', role: 'admin' });
            await adminUser.save();

            const regularUser = new User({ name: 'Test User', email: 'test@test.com', password: 'password' });
            await regularUser.save();

            report = new Report({
                instrument: 'test.com',
                type: 'Fraudulent Website',
                reviews: [{ user: regularUser._id, description: 'Initial review' }]
            });
            await report.save();

            mockAuthMiddleware.protect.mockImplementation((req, res, next) => {
                req.user = adminUser;
                next();
            });
            mockAuthMiddleware.adminOnly.mockImplementation((req, res, next) => {
                if (req.user.role === 'admin') {
                    next();
                } else {
                    res.status(403).json({ message: 'Forbidden' });
                }
            });
        });

        it('should allow an admin to delete any report', async () => {
            const res = await request(app)
                .delete(`/api/reports/admin/${report._id}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toBe('Report deleted successfully.');
            const deletedReport = await Report.findById(report._id);
            expect(deletedReport).toBeNull();
        });
    });
});
