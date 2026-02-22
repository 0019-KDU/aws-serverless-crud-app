const API_URL = import.meta.env.VITE_API_URL;

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const clearAccessToken = () => {
    accessToken = null;
};

const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return { success: true };
    }

    // Handle unauthorized - token might be expired
    if (response.status === 401) {
        clearAccessToken();
        throw new Error('Session expired. Please sign in again.');
    }

    // Try to parse JSON response
    let data;
    try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data;
};

export const userApi = {
    // Get all users
    getAll: async () => {
        const response = await fetch(`${API_URL}/users`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Get user by ID
    getById: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // Create new user
    create: async (userData) => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    // Update user
    update: async (userId, userData) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    // Delete user
    delete: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};
