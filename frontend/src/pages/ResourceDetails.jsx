import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResourceById, deleteResource } from '../api/resourceApi';

const typeBadgeStyle = {
    LECTURE_HALL: { background: '#eeedfe', color: '#534ab7' },
    LAB:          { background: '#e1f5ee', color: '#0f6e56' },
    MEETING_ROOM: { background: '#e6f1fb', color: '#185fa5' },
    EQUIPMENT:    { background: '#faeeda', color: '#854f0b' },
};

const statusBadgeStyle = {
    ACTIVE:         { background: '#e1f5ee', color: '#0f6e56' },
    OUT_OF_SERVICE: { background: '#faece7', color: '#993c1d' },
};

const formatType = (type) =>
    type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const formatTime = (time) => {
    if (!time) return '-';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

const detailRowStyle = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', fontSize: 13,
};
const detailLabelStyle = {
    color: '#888', fontWeight: 500, fontSize: 12,
};
const detailValueStyle = {
    color: '#1a1a1a', fontWeight: 400,
};

export default function ResourceDetails() {
    const navigate = useNavigate();
    const { id }   = useParams();

    const [resource, setResource] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showQR, setShowQR]     = useState(false);

    useEffect(() => {
        const loadResource = async () => {
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
        loadResource();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${resource.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await deleteResource(id);
            navigate('/manager/resources');
        } catch (err) {
            alert('Failed to delete resource.');
            setDeleting(false);
        }
    };

    const handleMarkOutOfService = async () => {
        navigate(`/manager/resources/edit/${id}`);
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13 }}>
                    Loading resource details...
                </div>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{
                    padding: '10px 14px', background: '#fcebeb',
                    border: '0.5px solid #f09595', borderRadius: 8,
                    fontSize: 13, color: '#a32d2d',
                }}>
                    {error || 'Resource not found.'}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>

            {/* Back link */}
            <div
                onClick={() => navigate('/manager/resources')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#555', cursor: 'pointer', marginBottom: 16,
                }}
            >
                Back to Resources
            </div>

            {/* Page title */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }}>
                    {resource.name}
                </h1>
                <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
                    Resource Details
                </p>
            </div>

            {/* Main grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

                {/* Left - Details */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e0e0e0',
                    borderRadius: 12, padding: '20px',
                }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span style={{
                            ...typeBadgeStyle[resource.type],
                            fontSize: 11, fontWeight: 500,
                            padding: '3px 10px', borderRadius: 999,
                        }}>
                            {formatType(resource.type)}
                        </span>
                        <span style={{
                            ...statusBadgeStyle[resource.status],
                            fontSize: 11, fontWeight: 500,
                            padding: '3px 10px', borderRadius: 999,
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <span>{resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}</span>
                        </span>
                    </div>

                    {/* Details grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Type</span>
                            <span style={{
                                ...typeBadgeStyle[resource.type],
                                fontSize: 11, fontWeight: 500,
                                padding: '3px 10px', borderRadius: 999,
                            }}>
                                {formatType(resource.type)}
                            </span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Capacity</span>
                            <span style={detailValueStyle}>{resource.capacity}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Location</span>
                            <span style={detailValueStyle}>{resource.location}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Opening Time</span>
                            <span style={detailValueStyle}>{formatTime(resource.openingTime)}</span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={detailLabelStyle}>Closing Time</span>
                            <span style={detailValueStyle}>{formatTime(resource.closingTime)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    {resource.description && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid #f0f0f0' }}>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 500 }}>Description</div>
                            <p style={{ fontSize: 13, color: '#444', margin: 0, lineHeight: 1.6 }}>
                                {resource.description}
                            </p>
                        </div>
                    )}

                    {/* Resource image */}
                    {resource.imageUrl && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid #f0f0f0' }}>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 8, fontWeight: 500 }}>Image</div>
                            <img
                                src={resource.imageUrl}
                                alt={resource.name}
                                style={{ width: '100%', borderRadius: 8, objectFit: 'cover', maxHeight: 200 }}
                            />
                        </div>
                    )}
                </div>

                {/* Right - Quick Actions */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e0e0e0',
                    borderRadius: 12, padding: '20px',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 16 }}>
                        Quick Actions
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                        {/* QR Code */}
                        <button
                            onClick={() => setShowQR(true)}
                            style={{
                                width: '100%', padding: '10px 14px',
                                fontSize: 13, borderRadius: 8, cursor: 'pointer',
                                border: '0.5px solid #bae6fd', background: '#f0f9ff',
                                color: '#0369a1', textAlign: 'left', fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            Generate QR Code
                        </button>

                        {/* Edit */}
                        <button
                            onClick={() => navigate(`/manager/resources/edit/${id}`)}
                            style={{
                                width: '100%', padding: '10px 14px',
                                fontSize: 13, borderRadius: 8, cursor: 'pointer',
                                border: '0.5px solid #ddd', background: '#fff',
                                color: '#1a1a1a', textAlign: 'left', fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            Edit Resource
                        </button>

                        {/* Mark Out of Service / Mark Active */}
                        <button
                            onClick={handleMarkOutOfService}
                            style={{
                                width: '100%', padding: '10px 14px',
                                fontSize: 13, borderRadius: 8, cursor: 'pointer',
                                border: '0.5px solid #faeeda', background: '#faeeda',
                                color: '#854f0b', textAlign: 'left', fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                        >
                            {resource.status === 'ACTIVE' ? 'Mark Out of Service' : 'Mark as Active'}
                        </button>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                width: '100%', padding: '10px 14px',
                                fontSize: 13, borderRadius: 8,
                                cursor: deleting ? 'not-allowed' : 'pointer',
                                border: '0.5px solid #f09595', background: '#fcebeb',
                                color: '#a32d2d', textAlign: 'left', fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: deleting ? 0.6 : 1,
                            }}
                        >
                            {deleting ? 'Deleting...' : 'Delete Resource'}
                        </button>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={() => setShowQR(false)}
                >
                    <div
                        style={{
                            background: '#fff', borderRadius: 16, padding: 32,
                            textAlign: 'center', maxWidth: 360, width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: '0 0 4px', fontSize: 18, color: '#111827' }}>
                            {resource.name}
                        </h3>
                        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#6b7280' }}>
                            Scan to view resource details
                        </p>
                        <img
                            src={`http://localhost:8080/api/resources/${id}/qrcode`}
                            alt="QR Code"
                            style={{ width: 200, height: 200, borderRadius: 8 }}
                        />
                        <p style={{ margin: '16px 0 0', fontSize: 12, color: '#9ca3af' }}>
                            {resource.location} - Capacity: {resource.capacity}
                        </p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                            
                                href={`http://localhost:8080/api/resources/${id}/qrcode`}
                                download={`${resource.name}-qr.png`}
                                style={{
                                    padding: '8px 16px', background: '#2563eb', color: '#fff',
                                    borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600,
                                }}
                            >
                                Download
                            </a>
                            <button
                                onClick={() => setShowQR(false)}
                                style={{
                                    padding: '8px 16px', background: '#f3f4f6', color: '#374151',
                                    border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}