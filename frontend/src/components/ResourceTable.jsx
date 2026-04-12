/*import { useNavigate } from 'react-router-dom';
import { deleteResource } from '../api/resourceApi';

const typeBadgeStyle = {
    LECTURE_HALL:  { background: '#eeedfe', color: '#534ab7' },
    LAB:           { background: '#e1f5ee', color: '#0f6e56' },
    MEETING_ROOM:  { background: '#e6f1fb', color: '#185fa5' },
    EQUIPMENT:     { background: '#faeeda', color: '#854f0b' },
};

const statusBadgeStyle = {
    ACTIVE:          { background: '#e1f5ee', color: '#0f6e56' },
    OUT_OF_SERVICE:  { background: '#faece7', color: '#993c1d' },
};

const formatType = (type) =>
    type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function ResourceTable({ resources, onRefresh }) {
    const navigate = useNavigate();

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteResource(id);
            onRefresh();
        } catch (err) {
            alert('Failed to delete resource.');
        }
    };

    if (!resources || resources.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                No resources found.
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ borderBottom: '0.5px solid #e0e0e0', textAlign: 'left' }}>
                        <th style={thStyle}>Image</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Capacity</th>
                        <th style={thStyle}>Location</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {resources.map((r) => (
                        <tr key={r.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                            <td style={tdStyle}>
                                {r.imageUrl ? (
                                    <img
                                        src={r.imageUrl}
                                        alt={r.name}
                                        style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }}
                                    />
                                ) : (
                                    <div style={{
                                        width: 48, height: 36, borderRadius: 6,
                                        background: '#f0f0f0', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontSize: 11, color: '#aaa'
                                    }}>No img</div>
                                )}
                            </td>
                            <td style={{ ...tdStyle, fontWeight: 500, color: '#1a1a1a' }}>{r.name}</td>
                            <td style={tdStyle}>
                                <span style={{
                                    ...badgeBase,
                                    ...(typeBadgeStyle[r.type] || {}),
                                }}>
                                    {formatType(r.type)}
                                </span>
                            </td>
                            <td style={tdStyle}>{r.capacity}</td>
                            <td style={tdStyle}>{r.location}</td>
                            <td style={tdStyle}>
                                <span style={{
                                    ...badgeBase,
                                    ...(statusBadgeStyle[r.status] || {}),
                                }}>
                                    {r.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
                                </span>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    
                                    <button
                                        onClick={() => navigate(`/manager/resources/${r.id}`)}
                                        style={actionBtn}
                                        title="View"
                                    >👁</button>
                                    
                                    <button
                                        onClick={() => navigate(`/manager/resources/edit/${r.id}`)}
                                        style={actionBtn}
                                        title="Edit"
                                    >✏️</button>
                                    
                                    <button
                                        onClick={() => handleDelete(r.id, r.name)}
                                        style={{ ...actionBtn, color: '#a32d2d' }}
                                        title="Delete"
                                    >🗑</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const thStyle = {
    padding: '10px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: '#666',
    whiteSpace: 'nowrap',
};

const tdStyle = {
    padding: '10px 12px',
    verticalAlign: 'middle',
};

const badgeBase = {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
};

const actionBtn = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 15,
    padding: '2px 4px',
    borderRadius: 4,
};
*/
import { useNavigate } from 'react-router-dom';
import { deleteResource } from '../api/resourceApi';

const typeBadgeStyle = {
    LECTURE_HALL:  { background: '#eeedfe', color: '#534ab7' },
    LAB:           { background: '#e1f5ee', color: '#0f6e56' },
    MEETING_ROOM:  { background: '#e6f1fb', color: '#185fa5' },
    EQUIPMENT:     { background: '#faeeda', color: '#854f0b' },
};

const statusBadgeStyle = {
    ACTIVE:          { background: '#e1f5ee', color: '#0f6e56' },
    OUT_OF_SERVICE:  { background: '#faece7', color: '#993c1d' },
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

export default function ResourceTable({ resources, onRefresh }) {
    const navigate = useNavigate();

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await deleteResource(id);
            onRefresh();
        } catch (err) {
            alert('Failed to delete resource.');
        }
    };

    if (!resources || resources.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontSize: 13 }}>
                No resources found.
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            padding: 16,
        }}>
            {resources.map((r) => (
                <div
                    key={r.id}
                    style={{
                        background: '#fff',
                        border: '0.5px solid #e0e0e0',
                        borderRadius: 12,
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    {/* Card Image */}
                    {r.imageUrl ? (
                        <img
                            src={r.imageUrl}
                            alt={r.name}
                            style={{ width: '100%', height: 160, objectFit: 'cover' }}
                            onError={e => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div style={{
                        display: r.imageUrl ? 'none' : 'flex',
                        width: '100%', height: 160,
                        background: '#f5f5f5',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb', fontSize: 13,
                    }}>
                        No image
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '14px 16px' }}>

                        {/* Name + Status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', flex: 1, marginRight: 8 }}>
                                {r.name}
                            </div>
                            <span style={{
                                ...statusBadgeStyle[r.status],
                                fontSize: 10, fontWeight: 500,
                                padding: '2px 8px', borderRadius: 999,
                                whiteSpace: 'nowrap',
                            }}>
                                {r.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
                            </span>
                        </div>

                        {/* Type badge */}
                        <span style={{
                            ...typeBadgeStyle[r.type],
                            fontSize: 10, fontWeight: 500,
                            padding: '2px 8px', borderRadius: 999,
                            display: 'inline-block', marginBottom: 10,
                        }}>
                            {formatType(r.type)}
                        </span>

                        {/* Details */}
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

                        {/* Colored Action buttons */}
                        <div style={{ display: 'flex', gap: 8, borderTop: '0.5px solid #f0f0f0', paddingTop: 12 }}>
                            {/* View — blue */}
                            <button
                                onClick={() => navigate(`/manager/resources/${r.id}`)}
                                style={{
                                    flex: 1, padding: '7px 0', fontSize: 12,
                                    borderRadius: 7, border: 'none',
                                    background: '#e6f1fb', color: '#185fa5',
                                    cursor: 'pointer', fontWeight: 500,
                                }}
                            >
                                👁 View
                            </button>

                            {/* Edit — green */}
                            <button
                                onClick={() => navigate(`/manager/resources/edit/${r.id}`)}
                                style={{
                                    flex: 1, padding: '7px 0', fontSize: 12,
                                    borderRadius: 7, border: 'none',
                                    background: '#e1f5ee', color: '#0f6e56',
                                    cursor: 'pointer', fontWeight: 500,
                                }}
                            >
                                ✏️ Edit
                            </button>

                            {/* Delete — red */}
                            <button
                                onClick={() => handleDelete(r.id, r.name)}
                                style={{
                                    flex: 1, padding: '7px 0', fontSize: 12,
                                    borderRadius: 7, border: 'none',
                                    background: '#fcebeb', color: '#a32d2d',
                                    cursor: 'pointer', fontWeight: 500,
                                }}
                            >
                                🗑 Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}