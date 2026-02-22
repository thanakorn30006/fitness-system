// ============================================================
// routes/bookings.tsx — Booking Endpoints
//
// POST   /api/bookings           — จองคลาส [ต้อง login + มี active package]
// GET    /api/bookings           — ดูการจองของ user ที่ login อยู่
// DELETE /api/bookings/:id       — ยกเลิกการจอง [เฉพาะเจ้าของ booking]
//
// ห้ามแก้: Transaction ใน POST — ใช้เพื่อป้องกัน race condition
//   (กรณีคนจองพร้อมกันเกิน capacity)
// ============================================================

import express from 'express';
import { Prisma } from '@prisma/client';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

// ======= POST /api/bookings =======
// จองคลาส — เงื่อนไข:
//   1. ต้องมี active package (ยังไม่หมดอายุ)
//   2. คลาสต้องยังเปิดอยู่ (isActive = true)
//   3. คลาสต้องยังไม่ผ่านวันกำหนด
//   4. ที่นั่งต้องไม่เต็ม
//   5. ยังไม่เคยจองคลาสนี้ไปแล้ว
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { classId } = req.body;
        const userId = parseInt(req.user.id);
        const parsedClassId = parseInt(classId);

        if (!parsedClassId || isNaN(parsedClassId)) {
            return res.status(400).json({ error: 'Invalid classId' });
        }

        const today = new Date();

        // เช็คว่ามี active package อยู่
        const activePackage = await prisma.memberPackage.findFirst({
            where: {
                userId,
                startDate: { lte: today },
                endDate: { gte: today }
            }
        });

        if (!activePackage) {
            return res.status(403).json({
                error: 'You need an active package to book classes'
            });
        }

        // ห้ามแก้: Transaction — ป้องกัน race condition ตอนจองพร้อมกัน
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const fitnessClass = await tx.class.findUnique({
                where: { id: parsedClassId },
                include: {
                    _count: { select: { bookings: true } }
                }
            });

            if (!fitnessClass || !fitnessClass.isActive) {
                throw new Error('Class not found or inactive');
            }

            if (fitnessClass.schedule < new Date()) {
                throw new Error('Cannot book past classes');
            }

            if (fitnessClass._count.bookings >= fitnessClass.capacity) {
                throw new Error('Class is full');
            }

            // เช็คว่าเคยจองคลาสนี้แล้วหรือยัง (unique constraint: userId + classId)
            const existing = await tx.booking.findUnique({
                where: {
                    userId_classId: {
                        userId,
                        classId: parsedClassId
                    }
                }
            });

            if (existing) {
                throw new Error('Already booked');
            }

            await tx.booking.create({
                data: {
                    userId,
                    classId: parsedClassId
                }
            });
        });

        return res.json({ message: 'Booked successfully' });

    } catch (error: any) {
        console.error('BOOKING ERROR:', error);
        return res.status(400).json({
            error: error.message || 'Booking failed'
        });
    }
});

// ======= GET /api/bookings =======
// ดูการจองทั้งหมดของ user ที่ login อยู่ (เรียงล่าสุดก่อน)
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                class: true // ดึงข้อมูล class มาด้วย
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(bookings);
    } catch (error) {
        console.error('GET BOOKINGS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// ======= DELETE /api/bookings/:id =======
// ยกเลิกการจอง — เฉพาะเจ้าของ booking เท่านั้น
router.delete('/:id', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);
        const bookingId = parseInt(req.params.id);

        if (!bookingId || isNaN(bookingId)) {
            return res.status(400).json({ error: 'Invalid booking id' });
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        });

        // เช็คว่าเป็น booking ของ user คนนี้จริงๆ
        if (!booking || booking.userId !== userId) {
            return res.status(403).json({ error: 'Not allowed' });
        }

        await prisma.booking.delete({
            where: { id: bookingId }
        });

        return res.json({ message: 'Cancelled' });
    } catch (error) {
        console.error('DELETE BOOKING ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;
