import { useNavigate } from 'react-router-dom';
import { deleteResource } from '../api/resourceApi';
import { useState } from 'react'; // ✅ added

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

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // ✅ Slice data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = resources.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(resources.length / itemsPerPage);

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
        <>
            {/* ✅ YOUR ORIGINAL GRID (UNCHANGED) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
                padding: 16,
            }}>
                {currentItems.map((r) => (   // ✅ ONLY CHANGE HERE
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
                        {/* KEEP EVERYTHING SAME */}
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

                        <div style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', flex: 1, marginRight: 8 }}>
                                    {r.name}
                                </div>
                                <span style={{
                                    ...statusBadgeStyle[r.status],
                                    fontSize: 10, fontWeight: 500,
                                    padding: '2px 8px', borderRadius: 999,
                                }}>
                                    {r.status === 'ACTIVE' ? '● Active' : '● Out of Service'}
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

                            <div style={{ fontSize: 12, marginBottom: 14 }}>
                                📍 {r.location}<br />
                                👥 Capacity: {r.capacity}<br />
                                🕐 {formatTime(r.openingTime)} – {formatTime(r.closingTime)}
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

            {/* ✅ PAGINATION (NEW ONLY) */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                marginTop: 20
            }}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                            fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                        }}
                    >
                        {i + 1}
                    </button>
                ))}

                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </>
    );
}