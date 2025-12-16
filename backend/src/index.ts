import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Routes
import authRoutes from './routes/auth.routes';
import setupRoutes from './routes/setup.routes';
import productRoutes from './routes/products.routes';
import customerRoutes from './routes/customers.routes';
import orderRoutes from './routes/orders.routes';
import importRoutes from './routes/import.routes';
import shippingRoutes from './routes/shipping.routes';
import settingsRoutes from './routes/settings.routes';
import logsRoutes from './routes/logs.routes';
import debugRoutes from './routes/debug.routes';
import labelRoutes from './routes/label.routes';
import automationRoutes from './routes/automation.routes'; // Import Automation
import dashboardRoutes from './routes/dashboard.routes';   // Import Dashboard

import etsyRoutes from './routes/etsy.routes';           // Import Etsy
import shippingProfileRoutes from './routes/shipping-profile.routes';
// import dhlRoutes from './routes/dhl.routes'; 
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import subscriptionRoutes from './routes/subscription.routes';

import { templatesRouter } from './routes/templates.routes';
import subscriptionPlansRoutes from './routes/subscription-plans.routes';

app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/import', importRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/shipping-profiles', shippingProfileRoutes);
app.use('/api/etsy', etsyRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes); // Mount Admin Routes
app.use('/api/subscription', subscriptionRoutes); // User-facing subscription logic
app.use('/api/subscription-plans', subscriptionPlansRoutes); // Admin-facing plans CRUD
app.use('/api/public', publicRoutes);
app.use('/api/templates', templatesRouter);

import subscriptionBookingRoutes from './routes/subscription-booking.routes';
app.use('/api/subscription', subscriptionBookingRoutes); // Mount booking routes under /api/subscription (merging with existing?) 
// Wait, index.ts already has: app.use('/api/subscription', subscriptionRoutes);
// I should merge them or use a different path.
// Existing subscriptionRoutes seemed to be for modules? 
// Let's check subscription.routes.ts content first.


// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (DEBUG MODE ACTIVE)`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
