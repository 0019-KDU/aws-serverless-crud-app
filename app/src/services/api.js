const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    return data;
};

export const userApi = {
    // Get all users
    getAll: async () => {
        const response = await fetch(`${API_URL}/users`);
        return handleResponse(response);
    },

    // Get user by ID
    getById: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`);
        return handleResponse(response);
    },

    // Create new user
    create: async (userData) => {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    // Update user
    update: async (userId, userData) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return handleResponse(response);
    },

    // Delete user
    delete: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'DELETE',
        });
        return handleResponse(response);
    },
};
