import api from "./axios";

const BASE_PATH = "/id-templates";

export interface IdCardTemplate {
    id: number;
    name: string;
    description?: string;
    width: number;
    height: number;
    frontBackground: string;
    backBackground?: string;
    layout?: any;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export const getAllTemplates = async () => {
    const response = await api.get(BASE_PATH);
    return response.data;
};

export const getTemplateById = async (id: number) => {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data;
};

export const createTemplate = async (data: any) => {
    const response = await api.post(BASE_PATH, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const updateTemplate = async (id: number, data: any) => {
    const response = await api.put(`${BASE_PATH}/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteTemplate = async (id: number) => {
    const response = await api.delete(`${BASE_PATH}/${id}`);
    return response.data;
};
