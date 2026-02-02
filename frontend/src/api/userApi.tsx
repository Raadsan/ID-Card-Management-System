import api from "./axios";

/**
 * Get current user profile
 */
export const getMe = async () => {
    const response = await api.get("/users/me");
    return response.data;
};

/**
 * Get all users
 */
export const getUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

/**
 * Create new user
 * Note: Use FormData if including a photo
 */
export const createUser = async (data: any) => {
    // Check if data is FormData to set appropriate headers, though axios often handles this automatically
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const response = await api.post("/users", data, config);
    return response.data;
};

/**
 * Update user
 * Note: Use FormData if including a photo
 */
export const updateUser = async (id: string, data: any) => {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const response = await api.patch(`/users/${id}`, data, config);
    return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};
