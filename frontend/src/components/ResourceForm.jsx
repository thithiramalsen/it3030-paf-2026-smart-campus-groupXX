import { useState, useEffect } from 'react';

const RESOURCE_TYPES = [
    { value: 'LECTURE_HALL', label: 'Lecture Hall' },
    { value: 'LAB', label: 'Lab' },
    { value: 'MEETING_ROOM', label: 'Meeting Room' },
    { value: 'EQUIPMENT', label: 'Equipment' },
];

const RESOURCE_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

export default function ResourceForm({ initialData = {}, onSubmit, onCancel, loading = false }) {
    const [form, setForm] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        openingTime: '08:00',
        closingTime: '18:00',
        imageUrl: '',
        description: '',
        ...initialData,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setForm(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim())     newErrors.name     = 'Resource name is required';
        if (!form.type)            newErrors.type     = 'Type is required';
        if (!form.capacity)        newErrors.capacity = 'Capacity is required';
        if (form.capacity < 1)     newErrors.capacity = 'Capacity must be at least 1';
        if (!form.location.trim()) newErrors.location = 'Location is required';
        if (!form.status)          newErrors.status   = 'Status is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = {
            ...form,
            capacity: parseInt(form.capacity),
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

                {/* Column 1 — Resource Information */}
                <div style={cardStyle}>
                    <div style={cardTitleStyle}>Resource Information</div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Resource Name <span style={{ color: '#a32d2d' }}>*</span></label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Lecture Hall B"
                            style={{ ...inputStyle, borderColor: errors.name ? '#f09595' : '#ddd' }}
                        />
                        {errors.name && <span style={errorStyle}>{errors.name}</span>}
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Resource Type <span style={{ color: '#a32d2d' }}>*</span></label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            style={{ ...inputStyle, borderColor: errors.type ? '#f09595' : '#ddd' }}
                        >
                            {RESOURCE_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        {errors.type && <span style={errorStyle}>{errors.type}</span>}
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Capacity <span style={{ color: '#a32d2d' }}>*</span></label>
                        <input
                            name="capacity"
                            type="number"
                            min="1"
                            value={form.capacity}
                            onChange={handleChange}
                            placeholder="e.g. 120"
                            style={{ ...inputStyle, borderColor: errors.capacity ? '#f09595' : '#ddd' }}
                        />
                        {errors.capacity && <span style={errorStyle}>{errors.capacity}</span>}
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Location <span style={{ color: '#a32d2d' }}>*</span></label>
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Building A - Floor 2"
                            style={{ ...inputStyle, borderColor: errors.location ? '#f09595' : '#ddd' }}
                        />
                        {errors.location && <span style={errorStyle}>{errors.location}</span>}
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Brief description of the resource..."
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical' }}
                        />
                    </div>
                </div>

                {/* Column 2 — Availability */}
                <div style={cardStyle}>
                    <div style={cardTitleStyle}>Availability</div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Opening Time</label>
                        <input
                            name="openingTime"
                            type="time"
                            value={form.openingTime}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Closing Time</label>
                        <input
                            name="closingTime"
                            type="time"
                            value={form.closingTime}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Status <span style={{ color: '#a32d2d' }}>*</span></label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            style={{ ...inputStyle, borderColor: errors.status ? '#f09595' : '#ddd' }}
                        >
                            {RESOURCE_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                        {errors.status && <span style={errorStyle}>{errors.status}</span>}
                    </div>
                </div>

                {/* Column 3 — Image */}
                <div style={cardStyle}>
                    <div style={cardTitleStyle}>Upload Image (Optional)</div>

                    <div style={fieldStyle}>
                        <label style={labelStyle}>Image URL</label>
                        <input
                            name="imageUrl"
                            value={form.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={inputStyle}
                        />
                    </div>

                    {form.imageUrl ? (
                        <div style={{ marginTop: 12 }}>
                            <img
                                src={form.imageUrl}
                                alt="Preview"
                                style={{
                                    width: '100%', height: 160,
                                    objectFit: 'cover', borderRadius: 8,
                                    border: '0.5px solid #e0e0e0'
                                }}
                                onError={e => e.target.style.display = 'none'}
                            />
                        </div>
                    ) : (
                        <div style={{
                            marginTop: 12, height: 160, border: '1.5px dashed #ddd',
                            borderRadius: 8, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', color: '#aaa',
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
                            <div style={{ fontSize: 12 }}>Enter an image URL above</div>
                            <div style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG up to 5MB</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: '9px 24px', fontSize: 13, borderRadius: 8,
                        border: '0.5px solid #ddd', background: '#fff',
                        cursor: 'pointer', color: '#555',
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '9px 24px', fontSize: 13, borderRadius: 8,
                        border: 'none', background: loading ? '#aaa' : '#1a9a72',
                        color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 500,
                    }}
                >
                    {loading ? 'Saving...' : 'Save Resource'}
                </button>
            </div>
        </form>
    );
}

const cardStyle = {
    background: '#fff',
    border: '0.5px solid #e0e0e0',
    borderRadius: 10,
    padding: '20px',
};

const cardTitleStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: '0.5px solid #f0f0f0',
};

const fieldStyle = {
    marginBottom: 14,
};

const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontWeight: 500,
};

const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 7,
    border: '0.5px solid #ddd',
    fontSize: 13,
    background: '#fafafa',
    color: '#1a1a1a',
    boxSizing: 'border-box',
};

const errorStyle = {
    fontSize: 11,
    color: '#a32d2d',
    marginTop: 3,
    display: 'block',
};