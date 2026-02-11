import api from "./axios";

/**
 * Get all menus
 */
export const getMenus = async () => {
    const response = await api.get("/menus");
    return response.data;
};

/**
 * Get user menus (based on role)
 */
export const getUserMenus = async () => {
    const response = await api.get("/menus/my-menus");
    return response.data;
};

/**
 * Get menu by ID
 */
export const getMenuById = async (id: string) => {
    const response = await api.get(`/menus/${id}`);
    return response.data;
};

/**
 * Create new menu
 */
export const createMenu = async (data: any) => {
    const response = await api.post("/menus", data);
    return response.data;
};

/**
 * Update menu
 */
export const updateMenu = async (id: string, data: any) => {
    const response = await api.patch(`/menus/${id}`, data);
    return response.data;
};

/**
 * Delete menu
 */
export const deleteMenu = async (id: string) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
};
