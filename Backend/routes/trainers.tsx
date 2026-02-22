// ============================================================
// routes/trainers.tsx — Trainer Endpoints
//
// GET    /api/trainers/all    — ดู trainers ทั้งหมด (public)
// POST   /api/trainers/create — เพิ่ม trainer [Admin]
// DELETE /api/trainers/:id    — ลบ trainer [Admin]
// ============================================================

import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ======= GET /api/trainers/all =======
router.get('/all', async (req, res) => {
    try {
        const trainers = await prisma.trainer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trainers' });
    }
});

// ======= POST /api/trainers/create =======
router.post('/create', async (req, res) => {
    const { name, specialty, bio } = req.body;
    try {
        const trainer = await prisma.trainer.create({
            data: { name, specialty, bio: bio || null, imageUrl: null }
        });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create trainer' });
    }
});

// ======= DELETE /api/trainers/:id =======
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.trainer.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Trainer deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete trainer' });
    }
});

export default router;
