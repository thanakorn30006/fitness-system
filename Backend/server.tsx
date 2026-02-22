import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';

// Import routes
import authRoutes from './routes/auth';
import bookingsRoutes from './routes/bookings';
import classesRoutes from './routes/classes';
import packagesRoutes from './routes/packages';
import trainersRoutes from './routes/trainers';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/trainers', trainersRoutes);

// Test server
app.get('/', (req, res) => {
    res.json({ message: 'Fitness Backend API is running!' });
});

// Run server
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});

// Disconnect prisma
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
