import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResourceById } from '../api/resourceApi';

const typeBadgeStyle = {
    LECTURE_HALL:  { background: '#eeedfe', color: '#534ab7' },
    LAB:           { background: '#e1f5ee', color: '#0f6e56' },
    MEETING_ROOM:  { background: '#e6f1fb', color: '#185fa5' },
    EQUIPMENT:     { background: '#faeeda', color: '#854f0b' },
};

const formatType = (type) =>
    type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const formatTime = (time) => {
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

export default function UserResourceDetail() {
    const navigate  = useNavigate();
    const { id }    = useParams();

    const [resource, setResource] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getResourceById(id);
                setResource(data);
            } catch (err) {
                setError('Failed to load resource details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return (
        <div style={{ padding: 24 }}>
            <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 13 }}>
                Loading...
            </div>
        </div>
    );

    if (error || !resource) return (
        <div style={{ padding: 24 }}>
            <div style={{ padding: '10px 14px', background: '#fcebeb', border: '0.5px solid #f09595', borderRadius: 8, fontSize: 13, color: '#a32d2d' }}>
                {error || 'Resource not found.'}
            </div>
        </div>
    );

    const isAvailable = resource.status === 'ACTIVE';

    return (
        <div style={{ padding: '24px' }}>

            {/* Back link */}
            <div
                onClick={() => navigate('/resources')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#555', cursor: 'pointer', marginBottom: 16,
                }}
            >
                ← Back to Resources
            </div>

            {/* Main layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 20 }}>

                {/* Left — Image */}
                <div>
                    {resource.imageUrl ? (
                        <img
                            src={resource.imageUrl}
                            alt={resource.name}
                            style={{
                                width: '100%', height: 240,
                                objectFit: 'cover', borderRadius: 12,
                                border: '0.5px solid #e0e0e0',
                            }}
                            onError={e => e.target.style.display = 'none'}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: 240, borderRadius: 12,
                            background: '#f5f5f5', border: '0.5px solid #e0e0e0',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#bbb', fontSize: 13,
                        }}>
                            No image
                        </div>
                    )}
                </div>

                {/* Centre — Resource Info */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e0e0e0',
                    borderRadius: 12, padding: '20px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                            {resource.name}
                        </h2>
                        <span style={{
                            background: isAvailable ? '#e1f5ee' : '#faece7',
                            color: isAvailable ? '#0f6e56' : '#993c1d',
                            fontSize: 11, fontWeight: 500,
                            padding: '3px 10px', borderRadius: 999,
                        }}>
                            {isAvailable ? '● Available' : '● Unavailable'}
                        </span>
                    </div>

                    <span style={{
                        ...typeBadgeStyle[resource.type],
                        fontSize: 11, fontWeight: 500,
                        padding: '3px 10px', borderRadius: 999,
                        display: 'inline-block', marginBottom: 16,
                    }}>
                        {formatType(resource.type)}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Capacity</span>
                            <span style={valueStyle}>{resource.capacity} people</span>
                        </div>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Location</span>
                            <span style={valueStyle}>{resource.location}</span>
                        </div>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Opening Time</span>
                            <span style={valueStyle}>{formatTime(resource.openingTime)}</span>
                        </div>
                        <div style={rowStyle}>
                            <span style={labelStyle}>Closing Time</span>
                            <span style={valueStyle}>{formatTime(resource.closingTime)}</span>
                        </div>
                    </div>

                    {resource.description && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid #f0f0f0' }}>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>Description</div>
                            <p style={{ fontSize: 13, color: '#444', margin: 0, lineHeight: 1.6 }}>
                                {resource.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right — Booking panel */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e0e0e0',
                    borderRadius: 12, padding: '20px',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 16 }}>
                        Book this Resource
                    </div>

                    {isAvailable ? (
                        <>
                            <p style={{ fontSize: 12, color: '#888', marginBottom: 16, lineHeight: 1.6 }}>
                                This resource is available for booking. Click below to submit a booking request.
                            </p>
                            <button
                                onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)}
                                style={{
                                    width: '100%', padding: '11px',
                                    fontSize: 13, fontWeight: 500,
                                    borderRadius: 8, border: 'none',
                                    background: '#1a9a72', color: '#fff',
                                    cursor: 'pointer', marginBottom: 10,
                                }}
                            >
                                📅 Request Booking
                            </button>
                            <div style={{ fontSize: 11, color: '#aaa', textAlign: 'center' }}>
                                Bookings require admin approval
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '14px', background: '#faece7',
                            border: '0.5px solid #f09595', borderRadius: 8,
                            fontSize: 13, color: '#993c1d', textAlign: 'center',
                        }}>
                            ⚠️ This resource is currently out of service and not available for booking.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 };
const labelStyle = { color: '#888', fontWeight: 500, fontSize: 12 };
const valueStyle = { color: '#1a1a1a' };