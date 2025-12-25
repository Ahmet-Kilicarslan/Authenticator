import type { Request, Response, NextFunction } from 'express';
import SessionService from '../services/SessionService.js';
import { AUTH_COOKIE_NAME } from '../config/cookie.js';

const sessionService = new SessionService();

export  default async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        // Read token from cookie (using your cookie name)
        const token = req.cookies[AUTH_COOKIE_NAME];

        if (!token) {
            res.status(401).json({
                error: 'Not authenticated',
                message: 'No session token found'
            });
            return;
        }

        // Validate token in Redis
        const session = await sessionService.getSession(token);

        if (!session) {
            res.status(401).json({
                error: 'Invalid session',
                message: 'Session expired or invalid'
            });
            return;
        }

        // Attach user info to request
        (req as any).userId = session.userId;
        (req as any).userEmail = session.email;
        (req as any).session = session;

        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: 'Internal server error'
        });
    }
}