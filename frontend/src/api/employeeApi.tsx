import api from "./axios";

/**
 * Get all employees
 */
export const getEmployees = async () => {
    const response = await api.get("/employee");
    return response.data;
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id: string) => {
    const response = await api.get(`/employee/${id}`);
    return response.data;
};

/**
 * Create new employee
 * Supports FormData if file upload is needed
 */
export const createEmployee = async (data: any) => {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const response = await api.post("/employee", data, config);
    return response.data;
};

/**
 * Update employee
 * Supports FormData if file upload is needed
 */
export const updateEmployee = async (id: string, data: any) => {
    const config = data instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
    const response = await api.patch(`/employee/${id}`, data, config);
    return response.data;
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id: string) => {
    const response = await api.delete(`/employee/${id}`);
    return response.data;
};
