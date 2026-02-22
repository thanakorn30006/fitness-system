// ============================================================
// types.ts — TypeScript types/interfaces ทั้งหมดของแอป
//
// ทุก interface ตรงกับโครงสร้าง response ที่ได้จาก Backend API
// ถ้าเพิ่ม field ใน Prisma schema → มาเพิ่มที่นี่ด้วยเสมอ
// ============================================================

// ข้อมูล User (ตรงกับ Prisma model User)
export interface User {
    id: number;
    name: string;
    lastName?: string;  // นามสกุล (optional)
    phone?: string;     // เบอร์โทร (optional)
    email: string;
    role: 'MEMBER' | 'ADMIN';
    createdAt: string;
}

// ข้อมูล Trainer (ตรงกับ Prisma model Trainer)
export interface Trainer {
    id: number;
    name: string;
    specialty: string;
    bio?: string;       // optional — อาจไม่มี
    imageUrl?: string;  // optional — รูปภาพ trainer
    createdAt: string;
}

// ข้อมูล Fitness Class (ตรงกับ Prisma model Class)
export interface FitnessClass {
    id: number;
    name: string;
    description?: string;   // optional
    schedule: string;       // ISO datetime string
    capacity: number;       // จำนวนที่นั่งทั้งหมด
    isActive: boolean;      // false = ปิดการจอง
    trainerId?: number;     // optional FK ไปยัง Trainer
    trainer?: Trainer;      // populate มาจาก include: { trainer: true }
    _count?: {
        bookings: number;   // จำนวนที่นั่งที่ถูกจองแล้ว
    };
}

// ข้อมูล Booking (ตรงกับ Prisma model Booking)
export interface Booking {
    id: number;
    classId: number;
    userId: number;
    createdAt: string;
    class: FitnessClass; // populate มาจาก include: { class: true }
}

// ข้อมูล Package (แพ็กเกจสมาชิก) — ตรงกับ Prisma model Package
export interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    duration?: number;      // ชื่อ field ใน Backend (ใช้ตอนสร้าง)
    durationDays?: number;  // ชื่อ field ที่แสดงผล (อาจมีจาก prisma หรือ mapping)
    isActive: boolean;
}

// ข้อมูล UserPackage (แพ็กเกจที่ user ซื้อแล้ว) — ตรงกับ Prisma model MemberPackage
export interface UserPackage {
    id: number;
    userId: number;
    packageId: number;
    startDate: string;  // ISO date string
    endDate: string;    // ISO date string
    isActive: boolean;
    name?: string;      // ชื่อแพ็กเกจ — เก็บ snapshot ตอนซื้อ
    price?: number;     // ราคา — เก็บ snapshot ตอนซื้อ
    package: Package;   // populate มาจาก include: { package: true }
}
