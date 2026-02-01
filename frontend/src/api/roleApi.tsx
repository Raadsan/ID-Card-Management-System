import api from "./axios";

/**
 * Get all roles
 */
export const getRoles = async () => {
    const response = await api.get("/roles");
    return response.data;
};

/**
 * Get role by ID
 */
export const getRoleById = async (id: string) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
};

/**
 * Create new role
 */
export const createRole = async (data: any) => {
    const response = await api.post("/roles", data);
    return response.data;
};

/**
 * Update role
 */
export const updateRole = async (id: string, data: any) => {
    const response = await api.patch(`/roles/${id}`, data);
    return response.data;
};

/**
 * Delete role
 */
export const deleteRole = async (id: string) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
};
