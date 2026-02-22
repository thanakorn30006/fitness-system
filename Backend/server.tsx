// ============================================================
// server.tsx — Entry Point ของ Backend Express Server
//
// สิ่งที่ทำ:
//   1. โหลด .env (PORT, JWT_SECRET, DATABASE_URL)
//   2. เปิด CORS ให้ Frontend localhost:3000 เข้าได้
//   3. Mount routes ทุกตัวใต้ /api/...
//   4. ฟัง port (default 5001)
//
// ถ้าเพิ่ม route ใหม่:
//   1. สร้างไฟล์ใน routes/yourRoute.tsx
//   2. import มาที่นี่
//   3. เพิ่ม app.use('/api/xxx', xxxRoutes)
//
// ห้ามแก้: CORS origin → ต้องตรงกับ URL ของ Frontend
// ============================================================

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './lib/prisma';

// Routes — import ทุก route จาก ./routes/
import authRoutes from './routes/auth';
import bookingsRoutes from './routes/bookings';
import classesRoutes from './routes/classes';
import packagesRoutes from './routes/packages';
import trainersRoutes from './routes/trainers';

const app = express();
const PORT = process.env.PORT || 5001;

// ======= Middleware =======
// ห้ามแก้ origin — ต้องตรงกับ URL ของ Frontend
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json()); // parse JSON body อัตโนมัติ

// ======= Routes =======
// ทุก request จะผ่าน /api ก่อนเสมอ
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/trainers', trainersRoutes);

// Health check — เช็คว่า server ทำงานอยู่
app.get('/', (req, res) => {
    res.json({ message: 'Fitness Backend API is running!' });
});

// เริ่มรับ request
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown — ตัดการเชื่อมต่อ Prisma ก่อนปิด server
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
