import api from "./axios";

/**
 * Get all department transfers
 */
export const getDepartmentTransfers = async () => {
    const response = await api.get("/department-transfers");
    return response.data;
};

/**
 * Get department transfer by ID
 */
export const getDepartmentTransferById = async (id: string) => {
    const response = await api.get(`/department-transfers/${id}`);
    return response.data;
};

/**
 * Create new department transfer
 */
export const createDepartmentTransfer = async (data: any) => {
    const response = await api.post("/department-transfers", data);
    return response.data;
};

/**
 * Update department transfer
 */
export const updateDepartmentTransfer = async (id: string, data: any) => {
    const response = await api.patch(`/department-transfers/${id}`, data);
    return response.data;
};

/**
 * Delete department transfer
 */
export const deleteDepartmentTransfer = async (id: string) => {
    const response = await api.delete(`/department-transfers/${id}`);
    return response.data;
};
