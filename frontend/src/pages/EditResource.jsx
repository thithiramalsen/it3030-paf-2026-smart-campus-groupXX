import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getResourceById, updateResource } from '../api/resourceApi';
import ResourceForm from '../components/ResourceForm';

export default function EditResource() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading]         = useState(false);
    const [fetching, setFetching]       = useState(true);
    const [error, setError]             = useState(null);

    // Load existing resource data on mount
    useEffect(() => {
        const loadResource = async () => {
            setFetching(true);
            try {
                const data = await getResourceById(id);
                // Format times for the time input (HH:MM format)
                setInitialData({
                    ...data,
                    openingTime: data.openingTime
                        ? data.openingTime.substring(0, 5)
                        : '08:00',
                    closingTime: data.closingTime
                        ? data.closingTime.substring(0, 5)
                        : '18:00',
                });
            } catch (err) {
                setError('Failed to load resource details.');
            } finally {
                setFetching(false);
            }
        };
        loadResource();
    }, [id]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            await updateResource(id, formData);
            navigate('/manager/dashboard', { state: { tab: 'resources' } });
        } catch (err) {
            setError('Failed to update resource. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/manager/dashboard', { state: { tab: 'resources' } });
    };

    // Loading state while fetching resource
    if (fetching) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 13 }}>
                    Loading resource details...
                </div>
            </div>
        );
    }

    // Error state if resource not found
    if (error && !initialData) {
        return (
            <div style={{ padding: '24px' }}>
                <div style={{
                    padding: '10px 14px', background: '#fcebeb',
                    border: '0.5px solid #f09595', borderRadius: 8,
                    fontSize: 13, color: '#a32d2d',
                }}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>

            {/* Back link */}
            <div
                onClick={handleCancel}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 13, color: '#555', cursor: 'pointer',
                    marginBottom: 16,
                }}
            >
                ← Back to Resources
            </div>

            {/* Header */}
            <div style={{ marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: '#1a1a1a' }}>
                    Edit Resource
                </h1>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                    Update the facility details below.
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div style={{
                    margin: '16px 0', padding: '10px 14px',
                    background: '#fcebeb', border: '0.5px solid #f09595',
                    borderRadius: 8, fontSize: 13, color: '#a32d2d',
                }}>
                    {error}
                </div>
            )}

            {/* Form pre-filled with existing data */}
            <div style={{ marginTop: 20 }}>
                <ResourceForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    submitLabel="Update Resource"
                />
            </div>
        </div>
    );
}