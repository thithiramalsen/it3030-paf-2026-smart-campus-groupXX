import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchResources } from '../api/resourceApi';
import ResourceTable from '../components/ResourceTable';

export default function ResourceManagement() {
    const navigate = useNavigate();

    const [resources, setResources] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    // Filter state
    const [search,   setSearch]   = useState('');
    const [type,     setType]     = useState('');
    const [status,   setStatus]   = useState('');
    const [location, setLocation] = useState('');

    const fetchResources = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await searchResources(filters);
            setResources(data);
        } catch (err) {
            setError('Failed to load resources. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount — no filters
    useEffect(() => {
        fetchResources({});
    }, []);

    // Fetch when filters change (debounced)
    useEffect(() => {
        const filters = {};
        if (search)   filters.search   = search;
        if (type)     filters.type     = type;
        if (status)   filters.status   = status;
        if (location) filters.location = location;

        const timer = setTimeout(() => {
            fetchResources(filters);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, type, status, location]);

    return (
        <div style={{ padding: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                        Resources Management
                    </h1>
                    <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                        View and manage all campus facilities, labs and equipment
                    </p>
                </div>
                <button
                    onClick={() => navigate('/manager/resources/add')}
                    style={{
                        padding: '8px 18px', fontSize: 13, fontWeight: 500,
                        background: '#1a9a72', color: '#fff', border: 'none',
                        borderRadius: 8, cursor: 'pointer',
                    }}
                >
                    + Add Resource
                </button>
            </div>

            {/* Filter bar */}
            <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap',
                background: '#fff', border: '0.5px solid #e0e0e0',
                borderRadius: 10, padding: '12px 14px', margin: '20px 0',
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
                <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
                <input
                    placeholder="Filter by location..."
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={inputStyle}
                />
            </div>

            {/* Table */}
            <div style={{
                background: '#fff', border: '0.5px solid #e0e0e0',
                borderRadius: 10, overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13 }}>
                        Loading resources...
                    </div>
                ) : error ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#a32d2d', fontSize: 13 }}>
                        {error}
                    </div>
                ) : (
                    <>
                        <ResourceTable resources={resources} onRefresh={() => fetchResources({})} />
                        <div style={{ padding: '10px 14px', fontSize: 12, color: '#aaa', borderTop: '0.5px solid #f0f0f0' }}>
                            Showing {resources.length} resource{resources.length !== 1 ? 's' : ''}
                        </div>
                    </>
                )}
            </div>
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