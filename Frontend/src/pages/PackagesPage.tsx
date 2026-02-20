import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { packagesAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Package, UserPackage } from '../types';

export default function PackagesPage() {
    const { user } = useAuth();
    const [packages, setPackages] = useState<Package[]>([]);
    const [activePackage, setActivePackage] = useState<UserPackage | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

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
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    const handleSubscribe = async (packageId: number) => {
        if (!user) {
            toast.error('Please login to subscribe');
            return;
        }

        if (activePackage) {
            toast.error('คุณยังมีแพ็กเกจที่ยังไม่หมดอายุ');
            return;
        }

        try {
            await packagesAPI.subscribe(packageId);
            toast.success('Subscribed successfully!');
            fetchData(); // Refresh to update active status
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Subscription failed');
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

    return (
        <div style={{ padding: 30 }}>
            <h1>Membership Packages</h1>

            {packages.map((pkg) => (
                <div key={pkg.id} style={{ marginBottom: '20px' }}>
                    <p>
                        <strong>{pkg.name}</strong> <br />
                        Price: {pkg.price} <br />
                        <p>{pkg.durationDays} วัน</p>
                        <br />
                        {pkg.description && (
                            <>
                                Description: {pkg.description}
                                <br />
                            </>
                        )}
                    </p>

                    <button
                        onClick={() => handleSubscribe(pkg.id)}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Subscribe Now
                    </button>
                </div>
            ))}
        </div>
    );
}
