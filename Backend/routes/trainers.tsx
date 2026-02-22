import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Get trainers
router.get('/all', async (req, res) => {
    try {
        const trainers = await prisma.trainer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(trainers);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Create trainer
router.post('/create', async (req, res) => {
    const { name, specialty, bio } = req.body;
    try {
        const trainer = await prisma.trainer.create({
            data: { name, specialty, bio: bio || null, imageUrl: null }
        });
        res.json(trainer);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Delete trainer
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.trainer.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
