import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { bookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../types';

export default function MyBookingsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getMyBookings();
            setBookings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await bookingsAPI.cancelBooking(bookingId);
            toast.success('Booking cancelled');
            fetchBookings();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Cancellation failed');
        }
    };

    if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

    return (
        <div style={{ padding: '30px' }}>
            <h1>My Bookings</h1>

            {bookings.length === 0 && <p>No bookings yet.</p>}

            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    style={{
                        border: '1px solid #ccc',
                        padding: '15px',
                        marginBottom: '15px',
                        width: '400px',
                    }}
                >
                    <h3>{booking.class.name}</h3>

                    <p>
                        <strong>Schedule:</strong>
                        <br />
                        {new Date(booking.class.schedule).toLocaleString()}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        <br />
                        {booking.class.description || 'No description'}
                    </p>

                    <p>
                        <strong>Capacity:</strong> {booking.class.capacity}
                    </p>

                    <p>
                        <strong>Status:</strong> {booking.class.isActive ? 'Active' : 'Inactive'}
                    </p>

                    <p>
                        <strong>Booked at:</strong>
                        <br />
                        {new Date(booking.createdAt).toLocaleString()}
                    </p>

                    <button
                        onClick={() => handleCancel(booking.id)}
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            padding: '8px 16px',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel Booking
                    </button>
                </div>
            ))}
        </div>
    );
}
