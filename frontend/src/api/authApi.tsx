import api from "./axios";

/**
 * Login user
 * @param data { email, password }
 */
export const loginUser = async (data: any) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};
