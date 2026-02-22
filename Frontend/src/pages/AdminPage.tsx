// ============================================================
// AdminPage.tsx — หน้าจัดการระบบ (เฉพาะ ADMIN เท่านั้น)
//
// ส่วนประกอบ:
//   1. Create Class      — สร้างคลาสใหม่ + เลือก Trainer
//   2. Manage Trainers   — เพิ่ม/ลบ Trainer
//   3. Manage Classes    — toggle active / ลบ Class ที่มีอยู่
//   4. Create Package    — สร้าง Membership Package
//   5. Manage Packages   — ดู/ลบ Package ที่มีอยู่
//   6. Manage Users      — ดูรายชื่อ User ทั้งหมด (read only)
//
// ห้ามแก้: useEffect ที่เช็ค role → redirect ถ้าไม่ใช่ ADMIN
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { classesAPI, packagesAPI, authAPI, trainersAPI } from '../api/client';
import { FitnessClass, Package, User, Trainer } from '../types';

export default function AdminPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ======= State: ข้อมูลจาก API =======
    const [classes, setClasses] = useState<FitnessClass[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);

    // ======= State: ฟอร์มสร้าง Class =======
    const [className, setClassName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [schedule, setSchedule] = useState('');
    const [description, setDescription] = useState('');
    const [selectedTrainerId, setSelectedTrainerId] = useState('');

    // ======= State: ฟอร์มสร้าง Trainer =======
    const [trainerName, setTrainerName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [bio, setBio] = useState('');

    // ======= State: ฟอร์มสร้าง Package =======
    const [packageName, setPackageName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [packageDesc, setPackageDesc] = useState('');

    // ห้ามแก้: Guard สำหรับ Admin-only — redirect ถ้าไม่ใช่ ADMIN
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    // โหลดข้อมูลทุกอย่างพร้อมกัน
    const fetchData = async () => {
        try {
            const [classesRes, packagesRes, usersRes, trainersRes] = await Promise.all([
                classesAPI.getAll(),
                packagesAPI.getAllAdmin(),
                authAPI.getAllUsers(),
                trainersAPI.getAll(),
            ]);
            setClasses(classesRes.data);
            setPackages(packagesRes.data);
            setUsers(usersRes.data);
            setTrainers(trainersRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to load admin data');
        }
    };

    // ======= Handlers: Class =======

    // สร้างคลาสใหม่ — trainerId เป็น optional
    const handleCreateClass = async () => {
        try {
            await classesAPI.create({
                name: className,
                capacity: parseInt(capacity),
                schedule,
                description,
                trainerId: selectedTrainerId ? parseInt(selectedTrainerId) : undefined
            });
            toast.success('Class created!');
            // รีเซ็ตฟอร์ม
            setClassName('');
            setCapacity('');
            setSchedule('');
            setDescription('');
            setSelectedTrainerId('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create class');
        }
    };

    // toggle isActive ของ class (เปิด/ปิดการจอง)
    const handleToggleClass = async (id: number) => {
        try {
            await classesAPI.toggle(id);
            fetchData();
        } catch (error) {
            toast.error('Failed to toggle class');
        }
    };

    // ลบ class พร้อมยืนยันก่อน
    const handleDeleteClass = async (id: number) => {
        if (!window.confirm('Delete this class?')) return;
        try {
            await classesAPI.delete(id);
            toast.success('Class deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete class');
        }
    };

    // ======= Handlers: Package =======

    const handleCreatePackage = async () => {
        try {
            await packagesAPI.create({
                name: packageName,
                price: parseFloat(price),
                duration: parseInt(duration),  // ส่ง "duration" ตรงกับ backend (ไม่ใช่ durationDays)
                description: packageDesc,
            });
            toast.success('Package created!');
            // รีเซ็ตฟอร์ม
            setPackageName('');
            setPrice('');
            setDuration('');
            setPackageDesc('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to create package');
        }
    };

    const handleDeletePackage = async (id: number) => {
        if (!window.confirm('Delete this package?')) return;
        try {
            await packagesAPI.delete(id);
            toast.success('Package deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete package');
        }
    };

    // ======= Handlers: Trainer =======

    const handleCreateTrainer = async () => {
        try {
            await trainersAPI.create({ name: trainerName, specialty, bio });
            toast.success('Trainer added!');
            setTrainerName('');
            setSpecialty('');
            setBio('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add trainer');
        }
    };

    const handleDeleteTrainer = async (id: number) => {
        if (!window.confirm('Delete this trainer?')) return;
        try {
            await trainersAPI.delete(id);
            toast.success('Trainer deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete trainer');
        }
    };

    return (
        <div style={{ padding: 30 }}>
            <h1>Admin Panel</h1>

            <hr />

            {/* ======= 1. Create Class ======= */}
            <h2>Create Class</h2>
            <input
                placeholder="Class Name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
            />
            <br />
            <input
                placeholder="Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
            />
            <br />
            <input
                placeholder="Schedule (YYYY-MM-DDTHH:MM)"
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
            />
            <br />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <br />
            {/* Dropdown เลือก Trainer — populate จาก state trainers */}
            <select
                value={selectedTrainerId}
                onChange={(e) => setSelectedTrainerId(e.target.value)}
            >
                <option value="">Select Trainer (Optional)</option>
                {trainers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
            </select>
            <br />
            <button onClick={handleCreateClass} style={{ marginTop: 10 }}>Create Class</button>

            <hr />

            {/* ======= 2. Manage Trainers ======= */}
            <h2>Manage Trainers</h2>
            <input
                placeholder="Trainer Name"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
            />
            <br />
            <input
                placeholder="Specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
            />
            <br />
            <textarea
                placeholder="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <br />
            <button onClick={handleCreateTrainer}>Add Trainer</button>

            {/* List trainer ที่มีอยู่ทั้งหมด */}
            <div style={{ marginTop: 20 }}>
                {trainers.map(t => (
                    <div key={t.id} style={{ border: '1px solid #ddd', padding: 10, marginBottom: 10 }}>
                        <strong>{t.name}</strong> - {t.specialty}
                        <button
                            onClick={() => handleDeleteTrainer(t.id)}
                            style={{ marginLeft: 10, color: 'red' }}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            <hr />

            {/* ======= 3. Manage Classes ======= */}
            <h2>Manage Classes</h2>
            {classes.map((cls) => (
                <div key={cls.id} style={{ marginBottom: 15, border: '1px solid #ccc', padding: 10 }}>
                    <h3>{cls.name}</h3>
                    <p>Trainer: {cls.trainer?.name || 'Unassigned'}</p>
                    <p>Schedule: {new Date(cls.schedule).toLocaleString()}</p>
                    <p>Capacity: {cls.capacity}</p>
                    <p>Status: {cls.isActive ? 'Active' : 'Inactive'}</p>
                    {/* Toggle เปิด/ปิดการจอง */}
                    <button onClick={() => handleToggleClass(cls.id)}>
                        {cls.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteClass(cls.id)} style={{ marginLeft: 10 }}>
                        Delete
                    </button>
                </div>
            ))}

            <hr />

            {/* ======= 4. Create Package ======= */}
            <h2>Create Package</h2>
            <input
                placeholder="Package Name"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
            />
            <br />
            <input
                placeholder="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <br />
            <input
                placeholder="Duration (days)"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
            />
            <br />
            <textarea
                placeholder="Description"
                value={packageDesc}
                onChange={(e) => setPackageDesc(e.target.value)}
            />
            <br />
            <button onClick={handleCreatePackage}>Create Package</button>

            <hr />

            {/* ======= 5. Manage Packages ======= */}
            <h2>Manage Packages</h2>
            {packages.map((pkg) => (
                <div key={pkg.id} style={{ marginBottom: 15, border: '1px solid #ccc', padding: 10 }}>
                    <h3>{pkg.name}</h3>
                    <p>Price: {pkg.price}</p>
                    <p>Duration: {pkg.durationDays} days</p>
                    <p>Active: {pkg.isActive ? 'Yes' : 'No'}</p>
                    <button onClick={() => handleDeletePackage(pkg.id)}>Delete</button>
                </div>
            ))}
            <hr />

            {/* ======= 6. Manage Users (Read Only) ======= */}
            <h2>Manage Users</h2>
            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                        <th style={{ padding: 8 }}>ID</th>
                        <th style={{ padding: 8 }}>Name</th>
                        <th style={{ padding: 8 }}>Email</th>
                        <th style={{ padding: 8 }}>Role</th>
                        <th style={{ padding: 8 }}>Joined at</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id}>
                            <td style={{ padding: 8 }}>{u.id}</td>
                            <td style={{ padding: 8 }}>{u.name}</td>
                            <td style={{ padding: 8 }}>{u.email}</td>
                            <td style={{ padding: 8 }}>{u.role}</td>
                            <td style={{ padding: 8 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
