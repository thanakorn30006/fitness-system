// ============================================================
// routes/packages.tsx — Membership Package Endpoints
//
// GET    /api/packages            — ดู packages ที่ active (public)
// GET    /api/packages/all        — ดูทุก package [Admin only]
// POST   /api/packages            — สร้าง package [Admin only]
// POST   /api/packages/subscribe  — สมัคร package [ต้อง login]
// DELETE /api/packages/:id        — ลบ package [Admin only]
// GET    /api/packages/my-active  — ดู active package ของตัวเอง [ต้อง login]
// GET    /api/packages/history    — ดูประวัติการซื้อ [ต้อง login]
//
// ⚠️ ลำดับ route สำคัญมาก: /subscribe, /my-active, /history
//    ต้องอยู่ก่อน /:id มิฉะนั้น Express จะตีความว่า "subscribe"
//    คือ :id แล้ว error
// ============================================================

import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// ======= GET /api/packages =======
// ดู packages ทั้งหมดที่ isActive = true (สำหรับ user ทั่วไป)
router.get('/', async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' } // เรียงจากราคาถูก → แพง
        });

        return res.json(packages);
    } catch (error) {
        console.error('GET PACKAGES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= GET /api/packages/all [Admin only] =======
// ดู packages ทั้งหมด (รวม inactive) + จำนวน members ที่ใช้
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            include: {
                _count: { select: { members: true } } // นับจำนวน members ต่อ package
            },
            orderBy: { price: 'asc' }
        });

        return res.json(packages);
    } catch (error) {
        console.error('GET ALL PACKAGES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= POST /api/packages [Admin only] =======
// สร้าง package ใหม่
// field ชื่อ "duration" (จำนวนวัน) — ตรงกับ Prisma schema
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, price, duration, description } = req.body;

        if (!name || !price || !duration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newPackage = await prisma.package.create({
            data: {
                name,
                price: parseFloat(price),
                duration: parseInt(duration), // จำนวนวัน
                description: description || null,
                isActive: true // package ใหม่เปิดให้สมัครอัตโนมัติ
            }
        });

        return res.json(newPackage);
    } catch (error) {
        console.error('CREATE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= POST /api/packages/subscribe [ต้อง login] =======
// สมัคร package — เงื่อนไข: ต้องไม่มี active package อยู่แล้ว
// startDate = วันนี้, endDate = วันนี้ + duration วัน
router.post('/subscribe', authenticateToken, async (req: any, res) => {
    try {
        const { packageId } = req.body;
        const userId = parseInt(req.user.id);

        const pkg = await prisma.package.findUnique({
            where: { id: parseInt(packageId) }
        });

        if (!pkg || !pkg.isActive) {
            return res.status(404).json({ error: 'Package not found or inactive' });
        }

        const today = new Date();
        // เช็คว่ามี active package อยู่แล้วหรือเปล่า
        const activePackage = await prisma.memberPackage.findFirst({
            where: {
                userId,
                endDate: { gte: today }
            }
        });

        if (activePackage) {
            return res.status(400).json({ error: 'คุณยังมีแพ็กเกจที่ยังไม่หมดอายุ ไม่สามารถสมัครใหม่ได้ในขณะนี้' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + pkg.duration); // คำนวณวันหมดอายุ

        const memberPackage = await prisma.memberPackage.create({
            data: {
                userId,
                packageId: pkg.id,
                name: pkg.name,     // snapshot ชื่อ ณ วันที่ซื้อ
                price: pkg.price,   // snapshot ราคา ณ วันที่ซื้อ
                startDate,
                endDate
            }
        });

        return res.json(memberPackage);
    } catch (error) {
        console.error('SUBSCRIBE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= DELETE /api/packages/:id [Admin only] =======
// ลบ package — ควรระวัง: ถ้ามี member ใช้อยู่จะยัง delete ได้ (ขึ้นกับ schema cascade)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const packageId = parseInt(req.params.id as string);

        await prisma.package.delete({
            where: { id: packageId }
        });

        return res.json({ message: 'Package deleted' });
    } catch (error) {
        console.error('DELETE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= GET /api/packages/my-active [ต้อง login] =======
// ดู active package ของ user ที่ login อยู่ (คืน null ถ้าไม่มี)
router.get('/my-active', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);
        const today = new Date();

        const activePackage = await prisma.memberPackage.findFirst({
            where: {
                userId,
                startDate: { lte: today },
                endDate: { gte: today }
            },
            orderBy: { endDate: 'desc' } // ถ้ามีหลายอัน เอาอันที่หมดอายุช้าสุด
        });

        return res.json(activePackage || null);
    } catch (error) {
        console.error('GET ACTIVE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= GET /api/packages/history [ต้อง login] =======
// ดูประวัติการซื้อ package ทั้งหมดของ user (เรียงล่าสุดก่อน)
router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);
        const history = await prisma.memberPackage.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(history);
    } catch (error) {
        console.error('GET PACKAGE HISTORY ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
