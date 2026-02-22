// ============================================================
// PaymentPage.tsx — หน้าชำระเงิน QR Code (mock)
// URL: /payment/:packageId
// กดปุ่ม "จ่ายแล้ว" → subscribe → redirect ไป /packages
// ============================================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { packagesAPI } from '../api/client';
import { Package } from '../types';

export default function PaymentPage() {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState<Package | null>(null);
    const [done, setDone] = useState(false);

    // โหลดข้อมูล package จาก packageId ใน URL
    useEffect(() => {
        packagesAPI.getAll().then(res => {
            const found = res.data.find(p => p.id === parseInt(packageId ?? '0'));
            if (!found) { navigate('/packages'); return; }
            setPkg(found);
        }).catch(() => navigate('/packages'));
    }, [packageId, navigate]);

    const handlePay = async () => {
        if (!pkg) return;
        try {
            await packagesAPI.subscribe(pkg.id);
            setDone(true);
            toast.success(`🎉 ชำระเงินสำเร็จ! ได้รับแพ็กเกจ "${pkg.name}"`);
            setTimeout(() => navigate('/packages'), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Subscription failed');
            navigate('/packages');
        }
    };

    if (!pkg) return <div style={{ padding: 30 }}>Loading...</div>;

    // หน้าสำเร็จ
    if (done) return (
        <div style={{ padding: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2>ชำระเงินสำเร็จ!</h2>
            <p>กำลังพาคุณกลับ...</p>
        </div>
    );

    return (
        <div style={{ padding: 30, maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
            <h2>ชำระเงิน</h2>

            {/* สรุปยอด */}
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                <div>{pkg.name}</div>
                <div style={{ fontSize: 28, fontWeight: 'bold' }}>฿{pkg.price.toLocaleString()}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{pkg.durationDays ?? pkg.duration} วัน</div>
            </div>
            {/* ปุ่มจ่าย */}
            <button onClick={handlePay} style={{ width: '100%', padding: '13px 0', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', marginBottom: 8 }}>
                ✅ จ่ายแล้ว
            </button>
            <button onClick={() => navigate('/packages')} style={{ width: '100%', padding: '10px 0', background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', color: '#888' }}>
                ยกเลิก
            </button>
        </div>
    );
}
