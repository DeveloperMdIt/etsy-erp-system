import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        userId: string;  // Alias for id
        email: string;
        tenantId: string;
        role: string;
    };
}

/**
 * Middleware to verify JWT token and extract user information
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        console.log('Auth Middleware: No token provided');
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

    try {
        const decoded = jwt.verify(token, jwtSecret) as any;
        console.log('Decoded Token:', decoded); // Debug log
        const userId = decoded.userId || decoded.id;
        (req as AuthRequest).user = {
            id: userId,
            userId: userId, // Alias
            email: decoded.email,
            tenantId: decoded.tenantId,
            role: decoded.role
        };
        // console.log('Auth Middleware: Token verified for user', decoded.email);
        next();
    } catch (error) {
        console.error('Auth Middleware: Verification failed', error);
        res.status(401).json({ error: 'Invalid or expired token' });
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
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
};
