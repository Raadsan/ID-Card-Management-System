import api from "./axios";

const BASE_PATH = "/role-permissions";

export const getRolePermissions = async () => {
    const response = await api.get(BASE_PATH);
    return response.data;
};

export const getRolePermissionById = async (roleId: string) => {
    const response = await api.get(`${BASE_PATH}/${roleId}`);
    return response.data;
};

export const createRolePermission = async (data: any) => {
    const response = await api.post(BASE_PATH, data);
    return response.data;
};

export const updateRolePermission = async (roleId: string, data: any) => {
    const response = await api.put(`${BASE_PATH}/${roleId}`, data);
    return response.data;
};

export const deleteRolePermission = async (roleId: string) => {
    const response = await api.delete(`${BASE_PATH}/${roleId}`);
    return response.data;
};
