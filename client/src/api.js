import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
});

export const getClients = async () => {
    const response = await api.get('/clients');
    return response.data;
};

export const getInsights = async () => {
    const response = await api.get('/insights');
    return response.data;
};

export const getClient = async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
};

export const getClientMessages = async (id) => {
    const response = await api.get(`/clients/${id}/messages`);
    return response.data;
};

export const analyzeText = async (text, clientId, platform) => {
    const response = await api.post('/analyze', { text, client_id: clientId, platform });
    return response.data;
};

export default api;
