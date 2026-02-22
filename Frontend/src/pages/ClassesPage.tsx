import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { classesAPI, bookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FitnessClass } from '../types';

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState<FitnessClass[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await classesAPI.getAll();
            setClasses(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Failed to load classes');
            setLoading(false);
        }
    };

    const handleBook = async (classId: number) => {
        if (!user) {
            toast.error('Please login to book a class');
            return;
        }

        try {
            await bookingsAPI.createBooking(classId);
            toast.success('Booked successfully!');
            fetchClasses();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Booking failed');
        }
    };

    // Calendar logic
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const groupedByDay: { [key: string]: FitnessClass[] } = {};

    daysOfWeek.forEach(day => groupedByDay[day] = []);
    classes.forEach(cls => {
        const dayName = daysOfWeek[(new Date(cls.schedule).getDay() + 6) % 7];
        if (groupedByDay[dayName]) {
            groupedByDay[dayName].push(cls);
        }
    });

    if (loading) return <div style={{ padding: 30 }}>Loading Classes...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h1>Classes Schedule</h1>

            <table border={1} style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        {daysOfWeek.map(day => (
                            <th key={day} style={{ padding: '10px', width: '14.28%' }}>{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {daysOfWeek.map(day => (
                            <td key={day} style={{ verticalAlign: 'top', padding: '10px', height: '400px' }}>
                                {groupedByDay[day].length === 0 ? (
                                    <p style={{ color: '#ccc', textAlign: 'center', fontSize: '0.8rem' }}>-</p>
                                ) : (
                                    groupedByDay[day].sort((a, b) => new Date(a.schedule).getTime() - new Date(b.schedule).getTime()).map(cls => (
                                        <div
                                            key={cls.id}
                                            style={{
                                                padding: '8px',
                                                marginBottom: '10px',
                                                border: '1px solid #ddd',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                backgroundColor: '#fff'
                                            }}
                                            onClick={() => setSelectedClass(cls)}
                                        >
                                            <strong>{cls.name}</strong>
                                            <div>{new Date(cls.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                                                {cls.trainer?.name || 'No Trainer'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666' }}>{cls._count?.bookings}/{cls.capacity} Booked</div>
                                        </div>
                                    ))
                                )}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>

            {/* Modal */}
            {selectedClass && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setSelectedClass(null)}>
                    <div style={{
                        backgroundColor: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '500px', width: '90%', position: 'relative'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedClass(null)}
                            style={{ position: 'absolute', top: 10, right: 10, border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h2>{selectedClass.name}</h2>
                        <p><strong>ผู้ฝึกสอน:</strong> {selectedClass.trainer?.name || 'ไม่ระบุ'}</p>
                        <p><strong>เวลา:</strong> {new Date(selectedClass.schedule).toLocaleString()}</p>
                        <p><strong>รายละเอียด:</strong><br />{selectedClass.description || 'ไม่มีรายละเอียด'}</p>
                        <p><strong>จำนวนคนจอง:</strong> {selectedClass._count?.bookings}/{selectedClass.capacity}</p>

                        <div style={{ marginTop: '20px' }}>
                            {selectedClass.isActive && new Date(selectedClass.schedule) > new Date() && user ? (
                                <button
                                    onClick={() => {
                                        handleBook(selectedClass.id);
                                        setSelectedClass(null);
                                    }}
                                    style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    จองคลาสนี้
                                </button>
                            ) : (
                                <p style={{ color: 'red' }}>คลาสไม่เปิดให้จอง</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
