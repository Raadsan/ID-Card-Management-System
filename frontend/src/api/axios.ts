import axios from "axios";

// Create axios instance with base configuration
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://id-card-management-system-qfgg.onrender.com/api";
// export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const UPLOAD_URL = BASE_URL.replace("/api", "/uploads");

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        // Enhance network errors
        if (error.message === "Network Error") {
            console.error("❌ Backend server might not be running or is unreachable.");
        }

        return Promise.reject(error);
    }
);

export default api;
