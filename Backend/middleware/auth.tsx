// ============================================================
// middleware/auth.tsx — JWT Authentication Middleware
//
// ใช้งาน:
//   import { authenticateToken, requireAdmin } from '../middleware/auth';
//   router.get('/protected', authenticateToken, handler);
//   router.get('/admin', authenticateToken, requireAdmin, handler);
//
// ห้ามแก้: โครงสร้าง req.user → ต้องตรงกับ JWT payload ที่สร้างใน auth.tsx
//   payload มี: { id: string, email: string, role: string }
// ============================================================

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ขยาย Request ของ Express ให้มี field 'user' เพิ่มเข้าไป
interface AuthRequest extends Request {
    user?: any; // { id: string, email: string, role: 'MEMBER' | 'ADMIN' }
}

// ======= authenticateToken =======
// เช็คว่ามี JWT token ใน Authorization header หรือเปล่า
// ถ้ามีและ valid → ต่อไปยัง route handler (next())
// ถ้าไม่มีหรือ invalid → ตอบ 401/403
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // รูปแบบ: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Forbidden - Invalid token' });
        }
        req.user = user; // เก็บ decoded payload ไว้ใน req.user สำหรับ handler ถัดไป
        next();
    });
}

// ======= requireAdmin =======
// ใช้ต่อจาก authenticateToken เสมอ
// เช็คว่า role ของ user เป็น 'ADMIN' หรือเปล่า
// ถ้าไม่ใช่ → ตอบ 403
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (!req.user || (req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden - Admin only' });
    }
    next();
}
