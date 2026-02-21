import api from "./axios";

/**
 * Get all employees
 */
export const getEmployees = async (limit?: number) => {
    const url = limit ? `/employee?limit=${limit}` : "/employee";
    const response = await api.get(url);
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
    // Note: Axios automatically handles FormData and sets the correct 
    // Content-Type with boundary when passed a FormData object.
    const response = await api.post("/employee", data);
    return response.data;
};

/**
 * Update employee
 * Supports FormData if file upload is needed
 */
export const updateEmployee = async (id: string, data: any) => {
    // Note: Axios automatically handles FormData and sets the correct 
    // Content-Type with boundary when passed a FormData object.
    const response = await api.patch(`/employee/${id}`, data);
    return response.data;
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id: string) => {
    const response = await api.delete(`/employee/${id}`);
    return response.data;
};
