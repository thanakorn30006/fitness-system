import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, packagesAPI, bookingsAPI } from '../api/client';
import { UserPackage, Booking } from '../types';

export default function ProfilePage() {
    const { user } = useAuth();
    const [packageHistory, setPackageHistory] = useState<UserPackage[]>([]);
    const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const [pkgRes, bookRes] = await Promise.all([
                packagesAPI.getHistory(),
                bookingsAPI.getMyBookings()
            ]);
            setPackageHistory(pkgRes.data);
            setBookingHistory(bookRes.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    if (!user) return <div>กรุณาเข้าสู่ระบบ</div>;

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1>โปรไฟล์ของฉัน</h1>

            <section style={{ marginBottom: 40, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
                <h3>ข้อมูลส่วนตัว</h3>
                <p><strong>ชื่อ:</strong> {user.name}</p>
                <p><strong>อีเมล:</strong> {user.email}</p>
            </section>

            <section style={{ marginBottom: 40 }}>
                <h3>ประวัติการจองคลาส</h3>
                {bookingHistory.length === 0 ? <p>ยังไม่มีประวัติการจอง</p> : (
                    <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th style={{ padding: 8 }}>คลาส</th>
                                <th style={{ padding: 8 }}>เวลาเรียน</th>
                                <th style={{ padding: 8 }}>วันที่จอง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingHistory.map(b => (
                                <tr key={b.id}>
                                    <td style={{ padding: 8 }}>{b.class.name}</td>
                                    <td style={{ padding: 8 }}>{new Date(b.class.schedule).toLocaleString()}</td>
                                    <td style={{ padding: 8 }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <section>
                <h3>ประวัติการซื้อแพ็กเกจ</h3>
                {packageHistory.length === 0 ? <p>ยังไม่มีประวัติการซื้อ</p> : (
                    <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f5f5f5' }}>
                            <tr>
                                <th style={{ padding: 8 }}>แพ็กเกจ</th>
                                <th style={{ padding: 8 }}>ราคา</th>
                                <th style={{ padding: 8 }}>เริ่ม - สิ้นสุด</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packageHistory.map(ph => (
                                <tr key={ph.id}>
                                    <td style={{ padding: 8 }}>{ph.name}</td>
                                    <td style={{ padding: 8 }}>{ph.price}</td>
                                    <td style={{ padding: 8 }}>
                                        {new Date(ph.startDate).toLocaleDateString()} - {new Date(ph.endDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}
