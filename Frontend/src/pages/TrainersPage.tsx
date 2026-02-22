import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { trainersAPI } from '../api/client';
import { Trainer } from '../types';

export default function TrainersPage() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            const response = await trainersAPI.getAll();
            setTrainers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching trainers:', error);
            toast.error('Failed to load trainers');
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading Trainers...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h1>Trainers</h1>
            <hr />

            {trainers.length === 0 ? (
                <p>No trainers listed.</p>
            ) : (
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Specialty</th>
                            <th style={{ padding: '10px' }}>Bio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trainers.map(trainer => (
                            <tr key={trainer.id}>
                                <td style={{ padding: '10px' }}>{trainer.name}</td>
                                <td style={{ padding: '10px' }}>{trainer.specialty}</td>
                                <td style={{ padding: '10px' }}>{trainer.bio || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
