import httpClient from './httpClient';

export const getAllResources = async () => {
    const res = await httpClient.get('/api/resources');
    return res.data;
};

export const getResourceById = async (id) => {
    const res = await httpClient.get(`/api/resources/${id}`);
    return res.data;
};

export const searchResources = async (filters = {}) => {
    const res = await httpClient.get('/api/resources/search', {
        params: {
            ...(filters.type ? { type: filters.type } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.location ? { location: filters.location } : {}),
            ...(filters.capacity ? { capacity: filters.capacity } : {}),
            ...(filters.search ? { search: filters.search } : {}),
        },
    });
    return res.data;
};

export const createResource = async (data) => {
    const res = await httpClient.post('/api/resources', data);
    return res.data;
};

export const updateResource = async (id, data) => {
    const res = await httpClient.put(`/api/resources/${id}`, data);
    return res.data;
};

export const deleteResource = async (id) => {
    const res = await httpClient.delete(`/api/resources/${id}`);
    return res.data;
};