import api from "./axios";

/**
 * Get all departments
 */
export const getDepartments = async () => {
    const response = await api.get("/departments");
    return response.data;
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (id: string) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
};

/**
 * Create new department
 */
export const createDepartment = async (data: any) => {
    const response = await api.post("/departments", data);
    return response.data;
};

/**
 * Update department
 */
export const updateDepartment = async (id: string, data: any) => {
    const response = await api.patch(`/departments/${id}`, data);
    return response.data;
};

/**
 * Delete department
 */
export const deleteDepartment = async (id: string) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
};
