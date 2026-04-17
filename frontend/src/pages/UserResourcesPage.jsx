import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchResources } from '../api/resourceApi';

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

export default function UserResourcesPage() {
    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    const [search,   setSearch]   = useState('');
    const [type,     setType]     = useState('');
    const [location, setLocation] = useState('');

    const fetchResources = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchResources({ ...filters, status: 'ACTIVE' });
            setResources(data);
        } catch (err) {
            setError('Failed to load resources. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResources({}); }, []);

    useEffect(() => {
        const filters = {};
        if (search)   filters.search   = search;
        if (type)     filters.type     = type;
        if (location) filters.location = location;
        const timer = setTimeout(() => { fetchResources(filters); }, 400);
        return () => clearTimeout(timer);
    }, [search, type, location]);

    return (
        <div style={{ padding: '24px' }}>

            {/* Back link */}
            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#555', cursor: 'pointer', marginBottom: 16,
                }}
            >
                ← Back to Home
            </div>

            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                    Campus Resources
                </h1>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                    Browse and request available campus facilities and equipment
                </p>
            </div>

            {/* Filter bar */}
            <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap',
                background: '#fff', border: '0.5px solid #e0e0e0',
                borderRadius: 10, padding: '12px 14px', marginBottom: 20,
            }}>
                <input
                    placeholder="Search resources..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={inputStyle}
                />
                <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Lab</option>
                    <option value="MEETING_ROOM">Meeting Room</option>
                    <option value="EQUIPMENT">Equipment</option>
                </select>
                <input
                    placeholder="Filter by location..."
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={inputStyle}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 13 }}>
                    Loading resources...
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#a32d2d', fontSize: 13 }}>
                    {error}
                </div>
            ) : resources.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#888', fontSize: 13 }}>
                    No resources available at the moment.
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 16,
                    }}>
                        {resources.map((r) => (
                            <div
                                key={r.id}
                                onClick={() => navigate(`/resources/${r.id}`)}
                                style={{
                                    background: '#fff',
                                    border: '0.5px solid #e0e0e0',
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                            >
                                {/* Image */}
                                {r.imageUrl ? (
                                    <img
                                        src={r.imageUrl}
                                        alt={r.name}
                                        style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: 160, background: '#f5f5f5',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', color: '#bbb', fontSize: 13,
                                    }}>
                                        No image
                                    </div>
                                )}

                                {/* Card body */}
                                <div style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', flex: 1, marginRight: 8 }}>
                                            {r.name}
                                        </div>
                                        <span style={{
                                            background: '#e1f5ee', color: '#0f6e56',
                                            fontSize: 10, fontWeight: 500,
                                            padding: '2px 8px', borderRadius: 999,
                                        }}>
                                            ● Available
                                        </span>
                                    </div>

                                    <span style={{
                                        ...typeBadgeStyle[r.type],
                                        fontSize: 10, fontWeight: 500,
                                        padding: '2px 8px', borderRadius: 999,
                                        display: 'inline-block', marginBottom: 10,
                                    }}>
                                        {formatType(r.type)}
                                    </span>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                                        <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                                            <span style={{ color: '#888' }}>📍</span>
                                            <span style={{ color: '#555' }}>{r.location}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                                            <span style={{ color: '#888' }}>👥</span>
                                            <span style={{ color: '#555' }}>Capacity: {r.capacity}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                                            <span style={{ color: '#888' }}>🕐</span>
                                            <span style={{ color: '#555' }}>{formatTime(r.openingTime)} – {formatTime(r.closingTime)}</span>
                                        </div>
                                    </div>

                                    {/* Two buttons */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/resources/${r.id}`);
                                            }}
                                            style={{
                                                flex: 1, padding: '8px 0',
                                                fontSize: 12, fontWeight: 500,
                                                borderRadius: 8, border: 'none',
                                                background: '#e6f1fb', color: '#185fa5',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            View Details →
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/bookings/new?resourceId=${r.id}`);
                                            }}
                                            style={{
                                                flex: 1, padding: '8px 0',
                                                fontSize: 12, fontWeight: 500,
                                                borderRadius: 8, border: 'none',
                                                background: '#1a9a72', color: '#fff',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            📅 Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 16, textAlign: 'center' }}>
                        Showing {resources.length} available resource{resources.length !== 1 ? 's' : ''}
                    </div>
                </>
            )}
        </div>
    );
}

const inputStyle = {
    flex: 1, minWidth: 160, padding: '7px 10px',
    borderRadius: 8, border: '0.5px solid #ddd',
    fontSize: 13, background: '#fafafa', color: '#1a1a1a',
};
const selectStyle = {
    padding: '7px 10px', borderRadius: 8,
    border: '0.5px solid #ddd', fontSize: 13,
    background: '#fafafa', color: '#1a1a1a',
};