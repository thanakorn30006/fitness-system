// ============================================================
// routes/auth.tsx — Auth Endpoints
//
// POST   /api/auth/register     — สมัครสมาชิก
// POST   /api/auth/login        — เข้าสู่ระบบ → ได้รับ JWT token
// GET    /api/auth/session      — เช็ค token ว่ายังใช้ได้อยู่
// GET    /api/auth/users        — ดู users ทั้งหมด [Admin only]
// PUT    /api/auth/profile      — แก้ชื่อ/รหัสผ่าน [ต้อง login]
//
// ห้ามแก้: การสร้าง JWT token ใน /login
//   เพราะ frontend อ่าน { token, user } จาก response โดยตรง
// ============================================================

import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// ======= POST /api/auth/register =======
// สมัครสมาชิกด้วย name, email, password
// role เริ่มต้นเป็น 'MEMBER' เสมอ (ไม่ให้ user กำหนด role เอง)
router.post('/register', async (req, res) => {
    try {
        const { name, lastName, phone, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                lastName: lastName || null,
                phone: phone || null,
                email,
                password, // TODO: ควร hash ด้วย bcrypt ก่อนเก็บ
                role: 'MEMBER' // ห้ามแก้ให้ user ส่ง role เอง
            }
        });

        return res.json(newUser);
    } catch (error) {
        console.error('REGISTER ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= POST /api/auth/login =======
// login แล้วได้รับ JWT token (อายุ 7 วัน)
// ห้ามแก้ structure ของ response เพราะ AuthContext อ่าน { token, user } ตรงๆ
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // TODO: ถ้าเพิ่ม bcrypt → เปลี่ยนเป็น bcrypt.compare(password, user.password)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // สร้าง JWT token — payload: { id, email, role }
        const token = jwt.sign(
            {
                id: user.id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

        // ห้ามแก้ structure นี้ — frontend อ่าน { token, user }
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= GET /api/auth/session =======
// เช็คว่า token ยังใช้ได้ → คืน user ปัจจุบัน
router.get('/session', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            const user = await prisma.user.findUnique({
                where: { id: parseInt(decoded.id) }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.error('SESSION ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= GET /api/auth/users [Admin only] =======
// ดู users ทั้งหมด — เฉพาะ ADMIN เท่านั้น
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            },
            orderBy: { id: 'asc' }
        });
        return res.json(users);
    } catch (error) {
        console.error('GET USERS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= PUT /api/auth/profile [ต้อง login] =======
// แก้ชื่อหรือรหัสผ่านของ user ที่ login อยู่
router.put('/profile', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);
        const { name, password } = req.body;

        const data: any = {};
        if (name) data.name = name;
        if (password) data.password = password; // TODO: ควร hash ก่อนเก็บ

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        return res.json(updatedUser);
    } catch (error) {
        console.error('UPDATE PROFILE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
