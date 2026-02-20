import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';

// POST /api/bookings - Create a new booking
router.post('/', authenticateToken, async (req: any, res) => {
    try {
        const { classId } = req.body;
        const userId = parseInt(req.user.id);
        const parsedClassId = parseInt(classId);

        if (!parsedClassId || isNaN(parsedClassId)) {
            return res.status(400).json({ error: 'Invalid classId' });
        }

        const today = new Date();

        // Check for active package
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

        // Transaction to ensure data consistency
        await prisma.$transaction(async (tx) => {
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

// GET /api/bookings - Get user's bookings
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                class: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return res.json(bookings);
    } catch (error) {
        console.error('GET BOOKINGS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// DELETE /api/bookings/:id - Cancel a booking
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
