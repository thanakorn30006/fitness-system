export interface User {
    id: number;
    name: string;
    email: string;
    role: 'MEMBER' | 'ADMIN';
    createdAt: string;
}

export interface FitnessClass {
    id: number;
    name: string;
    description?: string;
    schedule: string;
    capacity: number;
    isActive: boolean;
    _count?: {
        bookings: number;
    };
}

export interface Booking {
    id: number;
    classId: number;
    userId: number;
    createdAt: string;
    class: FitnessClass;
}

export interface Package {
    id: number;
    name: string;
    description: string;
    price: number;
    durationDays: number;
    isActive: boolean;
}

export interface UserPackage {
    id: number;
    userId: number;
    packageId: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    name?: string; // For history view
    price?: number; // For history view
    package: Package;
}
