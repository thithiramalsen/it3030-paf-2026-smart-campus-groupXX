import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResourceById, deleteResource } from '../api/resourceApi';
import { useAppFeedback } from '../components/ui/AppFeedbackProvider';

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
    if (!time) return '—';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12  = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
};

export default function ResourceDetails() {
    const navigate = useNavigate();
    const { id }   = useParams();
    const { confirm, toast } = useAppFeedback();

    const [resource, setResource] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [deleting, setDeleting] = useState(false);

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
        const approved = await confirm({
            title: 'Delete resource?',
            message: `Are you sure you want to delete "${resource.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            tone: 'danger',
        });
        if (!approved) return;
        setDeleting(true);
        try {
            await deleteResource(id);
            toast('Resource deleted.', { type: 'success' });
            navigate('/manager/resources');
        } catch (err) {
            toast('Failed to delete resource.', { type: 'error' });
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
                ← Back to Resources
            </div>

            {/* Page title */}
            <h1 style={{ fontSize: 22, fontWeight: 500, margin: '0 0 20px', color: '#1a1a1a' }}>
                Resource Details
            </h1>

            {/* Main content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 20 }}>

                {/* Left — Image */}
                <div>
                    {resource.imageUrl ? (
                        <img
                            src={resource.imageUrl}
                            alt={resource.name}
                            style={{
                                width: '100%', height: 220,
                                objectFit: 'cover', borderRadius: 12,
                                border: '0.5px solid #e0e0e0',
                            }}
                            onError={e => e.target.style.display = 'none'}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: 220, borderRadius: 12,
                            background: '#f5f5f5', border: '0.5px solid #e0e0e0',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#aaa', fontSize: 13,
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
                    {/* Name + status badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                            {resource.name}
                        </h2>
                        <span style={{
                            ...statusBadgeStyle[resource.status],
                            fontSize: 11, fontWeight: 500,
                            padding: '3px 10px', borderRadius: 999,
                        }}>
                            {resource.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
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
                </div>

                {/* Right — Quick Actions */}
                <div style={{
                    background: '#fff', border: '0.5px solid #e0e0e0',
                    borderRadius: 12, padding: '20px',
                }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 16 }}>
                        Quick Actions
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

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
                            ✏️ Edit Resource
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
                            {resource.status === 'ACTIVE'
                                ? '⚠️ Mark Out of Service'
                                : '✅ Mark as Active'}
                        </button>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                width: '100%', padding: '10px 14px',
                                fontSize: 13, borderRadius: 8, cursor: deleting ? 'not-allowed' : 'pointer',
                                border: '0.5px solid #f09595', background: '#fcebeb',
                                color: '#a32d2d', textAlign: 'left', fontWeight: 500,
                                display: 'flex', alignItems: 'center', gap: 8,
                                opacity: deleting ? 0.6 : 1,
                            }}
                        >
                            🗑 {deleting ? 'Deleting...' : 'Delete Resource'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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