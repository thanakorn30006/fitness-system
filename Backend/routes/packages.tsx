import express from 'express';
const router = express.Router();
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// Get active packages
router.get('/', async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });

        return res.json(packages);
    } catch (error) {
        console.error('GET PACKAGES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Admin get all packages
router.get('/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            include: {
                _count: { select: { members: true } }
            },
            orderBy: { price: 'asc' }
        });

        return res.json(packages);
    } catch (error) {
        console.error('GET ALL PACKAGES ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Admin create package
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
                duration: parseInt(duration),
                description: description || null,
                isActive: true
            }
        });

        return res.json(newPackage);
    } catch (error) {
        console.error('CREATE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Subscribe to package
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
        endDate.setDate(endDate.getDate() + pkg.duration);

        const memberPackage = await prisma.memberPackage.create({
            data: {
                userId,
                packageId: pkg.id,
                name: pkg.name,
                price: pkg.price,
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

// Admin delete package
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

// Get my active package
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
            orderBy: { endDate: 'desc' }
        });

        return res.json(activePackage || null);
    } catch (error) {
        console.error('GET ACTIVE PACKAGE ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Get subscription history
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
