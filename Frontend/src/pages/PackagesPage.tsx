// ============================================================
// PackagesPage.tsx — หน้าแสดงและสมัคร Membership Package
// กด Subscribe Now → navigate ไปหน้า /payment/:packageId
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { packagesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Package, UserPackage } from '../types';

export default function PackagesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [packages, setPackages] = useState<Package[]>([]);
    const [activePackage, setActivePackage] = useState<UserPackage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, [user]);

    const fetchData = async () => {
        try {
            const [pkgsRes, activeRes] = await Promise.all([
                packagesAPI.getAll(),
                user ? packagesAPI.getActive() : Promise.resolve({ data: null })
            ]);
            setPackages(pkgsRes.data);
            setActivePackage(activeRes.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    // กด Subscribe Now → ไปหน้าชำระเงิน
    const handleSubscribe = (pkg: Package) => {
        if (!user) { toast.error('Please login to subscribe'); return; }
        if (activePackage) { toast.error('คุณยังมีแพ็กเกจที่ยังไม่หมดอายุ'); return; }
        navigate(`/payment/${pkg.id}`);
    };

    if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

    return (
        <div style={{ padding: 30 }}>
            <h1>Membership Packages</h1>



            {packages.map((pkg) => (
                <div key={pkg.id} style={{ marginBottom: 20, border: '1px solid #ddd', padding: 20, borderRadius: 8 }}>
                    <strong style={{ fontSize: 18 }}>{pkg.name}</strong>
                    <p>ราคา: <strong>{pkg.price} บาท</strong></p>
                    <p>{pkg.durationDays ?? pkg.duration} วัน</p>
                    {pkg.description && <p style={{ color: '#666' }}>{pkg.description}</p>}
                    <button
                        onClick={() => handleSubscribe(pkg)}
                        style={{
                            backgroundColor: activePackage ? '#aaa' : '#4CAF50',
                            color: 'white', padding: '10px 20px', border: 'none',
                            cursor: activePackage ? 'not-allowed' : 'pointer',
                            borderRadius: 6, fontWeight: 'bold'
                        }}
                    >
                        {activePackage ? 'มีแพ็กเกจอยู่แล้ว' : 'Subscribe Now →'}
                    </button>
                </div>
            ))}
        </div>
    );
}
