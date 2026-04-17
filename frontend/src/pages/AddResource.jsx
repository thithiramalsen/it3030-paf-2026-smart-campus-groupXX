import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createResource } from '../api/resourceApi';
import ResourceForm from '../components/ResourceForm';

export default function AddResource() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            await createResource(formData);
            navigate('/manager/dashboard', { state: { tab: 'resources' } });
        } catch (err) {
            setError('Failed to create resource. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/manager/dashboard');
    };

    return (
        <div style={{ padding: '24px' }}>

            {/* Back link */}
            <div
                onClick={() => navigate('/manager/dashboard')}
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
                    Add New Resource
                </h1>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                    Fill in the details to register a new facility or equipment.
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

            {/* Form */}
            <div style={{ marginTop: 20 }}>
                <ResourceForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                />
            </div>
        </div>
    );
}