// ============================================================
// routes/classes.tsx — Fitness Class Endpoints
//
// GET    /api/classes            — ดู class ทั้งหมด (public)
// POST   /api/classes            — สร้าง class [Admin only]
// PUT    /api/classes/:id/toggle — เปิด/ปิดการจอง [Admin only]
// DELETE /api/classes/:id        — ลบ class [Admin only]
//
// ทุก class จะ include: trainer และ _count.bookings มาด้วยเสมอ
// ============================================================

import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// ======= GET /api/classes =======
// ดึง classes ทั้งหมด พร้อม trainer และจำนวนคนจอง (เรียงตามเวลา)
router.get('/', async (req, res) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                trainer: true,          // ดึงข้อมูล trainer มาด้วย
                _count: {
                    select: { bookings: true } // นับจำนวนคนจอง
                }
            },
            orderBy: { schedule: 'asc' } // เรียงจากเร็วสุด → ช้าสุด
        });

        return res.json(classes);
    } catch (error) {
        console.error('GET CLASSES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= POST /api/classes [Admin only] =======
// สร้าง class ใหม่
// - trainerId เป็น optional (ไม่ต้องมี trainer ก็ได้)
// - schedule ต้องเป็นอนาคต
// - capacity ต้องมากกว่า 0
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, capacity, schedule, description, trainerId } = req.body;

        if (!name || !capacity || !schedule) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const capacityNumber = Number(capacity);
        const scheduleDate = new Date(schedule);

        if (capacityNumber <= 0) {
            return res.status(400).json({
                error: 'Capacity must be greater than 0'
            });
        }

        if (scheduleDate <= new Date()) {
            return res.status(400).json({
                error: 'Schedule must be in the future'
            });
        }

        const newClass = await prisma.class.create({
            data: {
                name: String(name),
                capacity: capacityNumber,
                schedule: scheduleDate,
                description: description || null,
                isActive: true, // class ใหม่เปิดรับจองอัตโนมัติ
                trainerId: trainerId ? Number(trainerId) : null
            }
        });

        return res.json(newClass);
    } catch (error) {
        console.error('CREATE CLASS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= PUT /api/classes/:id/toggle [Admin only] =======
// สลับสถานะ isActive ของ class (เปิด ↔ ปิด)
router.put('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const classId = parseInt(req.params.id as string);

        const fitnessClass = await prisma.class.findUnique({
            where: { id: classId }
        });

        if (!fitnessClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // สลับ isActive
        const updated = await prisma.class.update({
            where: { id: classId },
            data: { isActive: !fitnessClass.isActive }
        });

        return res.json(updated);
    } catch (error) {
        console.error('TOGGLE CLASS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= DELETE /api/classes/:id [Admin only] =======
// ลบ class — bookings ที่เกี่ยวข้องจะถูกลบตามด้วย (cascade ใน Prisma schema)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const classId = parseInt(req.params.id as string);

        await prisma.class.delete({
            where: { id: classId }
        });

        return res.json({ message: 'Class deleted' });
    } catch (error) {
        console.error('DELETE CLASS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
