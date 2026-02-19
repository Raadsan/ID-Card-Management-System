import api from "./axios";

export const getCategories = async () => {
    const response = await api.get("/category");
    return response.data;
};

export const createCategory = async (data: any) => {
    const response = await api.post("/category/create", data);
    return response.data;
};

export const updateCategory = async (data: any) => {
    const response = await api.put("/category/update", data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await api.delete("/category/delete", { data: { id } });
    return response.data;
};
