import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;
}

// Middleware to verify JWT token
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden - Invalid token' });
        }
        req.user = user; // { id, email, role }
        next();
    });
}

// Middleware to check if user is admin
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user || (req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
    }
    next();
}
