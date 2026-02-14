import api from "./axios";

/**
 * Fetch all audit logs with optional filters
 * @param {Object} params - Query parameters (page, limit, userId, action, tableName, startDate, endDate)
 */
export const getAuditLogs = async (params: any = {}) => {
    try {
        const response = await api.get("/audit-logs", { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        throw error;
    }
};

/**
 * Fetch audit logs for a specific user
 */
export const getAuditLogsByUser = async (userId: string | number, params: any = {}) => {
    try {
        const response = await api.get(`/audit-logs/user/${userId}`, { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch user audit logs:", error);
        throw error;
    }
};

/**
 * Fetch audit logs for a specific table
 */
export const getAuditLogsByTable = async (tableName: string, params: any = {}) => {
    try {
        const response = await api.get(`/audit-logs/table/${tableName}`, { params });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch table audit logs:", error);
        throw error;
    }
};

/**
 * Delete an audit log entry
 */
export const deleteAuditLog = async (id: string | number) => {
    try {
        const response = await api.delete(`/audit-logs/${id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to delete audit log:", error);
        throw error;
    }
};
