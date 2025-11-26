const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

let authToken = '';

export const setAuthToken = (token) => {
    authToken = token || '';
};

export const apiRequest = async (path, { method = 'GET', body, headers } = {}) => {
    const requestHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };

    if (authToken) {
        requestHeaders.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    });

    let parsed;
    try {
        parsed = await response.json();
    } catch (error) {
        parsed = null;
    }

    if (!response.ok) {
        const message = parsed?.message || `Request failed with status ${response.status}`;
        throw new Error(message);
    }

    return parsed ?? {};
};

export { API_BASE_URL };
