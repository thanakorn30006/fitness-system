import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// GET /api/classes - List all classes
router.get('/', async (req, res) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: { schedule: 'asc' }
        });

        return res.json(classes);
    } catch (error) {
        console.error('GET CLASSES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// POST /api/classes - Create a new class (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, capacity, schedule, description } = req.body;

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
                isActive: true
            }
        });

        return res.json(newClass);
    } catch (error) {
        console.error('CREATE CLASS ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// PUT /api/classes/:id/toggle - Toggle class active status (Admin only)
router.put('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

        const fitnessClass = await prisma.class.findUnique({
            where: { id: classId }
        });

        if (!fitnessClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

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

// DELETE /api/classes/:id - Delete a class (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const classId = parseInt(req.params.id);

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
