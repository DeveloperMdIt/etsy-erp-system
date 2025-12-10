import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        tenantId: string;
        role: string;
    };
}

/**
 * Middleware to verify JWT token and extract user information
 */
export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('Auth Middleware: No token provided');
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        console.log('Decoded Token:', decoded); // Debug log
        req.user = {
            id: decoded.userId || decoded.id, // Handle both cases
            email: decoded.email,
            tenantId: decoded.tenantId,
            role: decoded.role
        };
        // console.log('Auth Middleware: Token verified for user', decoded.email);
        next();
    } catch (error) {
        console.error('Auth Middleware: Verification failed', error);
        return res.status(401).json({ error: 'Invalid or expired token' }); // Changed to 401 to match user report observation
    }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
};
