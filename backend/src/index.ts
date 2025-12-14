import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

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

import etsyRoutes from './routes/etsy.routes';           // Import Etsy (was missing from some previous view)
import shippingMethodRoutes from './routes/shipping-method.routes'; // Import Shipping Methods
// import dhlRoutes from './routes/dhl.routes'; // Does not exist, creating error
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';

import { templatesRouter } from './routes/templates.routes';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Debug Middleware: Log every request
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

// Serve static files (logos, labels)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/import', importRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/etsy', etsyRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/debug', debugRoutes);
// app.use('/api/dhl', dhlRoutes); // Mount DHL routes
app.use('/api/labels', labelRoutes);
app.use('/api/shipping-methods', shippingMethodRoutes);
app.use('/api/automation', automationRoutes); // Register Automation Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templatesRouter);

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
