import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireAdmin } from '../middleware/auth';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

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
                email,
                password,
                role: 'MEMBER'
            }
        });

        return res.json(newUser);
    } catch (error) {
        console.error('REGISTER ERROR:', error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// POST /api/auth/login
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

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user.id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '7d' }
        );

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

// GET /api/auth/session
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

// PUT /api/auth/profile - Update user profile
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

router.put('/profile', authenticateToken, async (req: any, res) => {
    try {
        const userId = parseInt(req.user.id);
        const { name, password } = req.body;

        const data: any = {};
        if (name) data.name = name;
        if (password) data.password = password;

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
