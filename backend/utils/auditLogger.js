import { prisma } from "../lib/prisma.js";

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {number} params.userId - ID of the user performing the action
 * @param {string} params.action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')
 * @param {string} params.tableName - Name of the table affected
 * @param {number} [params.recordId] - ID of the record affected (optional)
 * @param {Object} [params.oldData] - Previous data before the action (optional)
 * @param {Object} [params.newData] - New data after the action (optional)
 * @param {string} [params.ipAddress] - IP address of the user (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
export const logAudit = async ({
    userId,
    action,
    tableName,
    recordId = null,
    oldData = null,
    newData = null,
    ipAddress = null,
}) => {
    try {
        const auditLog = await prisma.auditLog.create({
            data: {
                userId: Number(userId),
                action,
                tableName,
                recordId: recordId ? Number(recordId) : null,
                oldData,
                newData,
                ipAddress,
            },
        });

        return auditLog;
    } catch (error) {
        console.error("Failed to create audit log:", error);
        // Don't throw error to prevent audit logging from breaking the main operation
        return null;
    }
};

/**
 * Express middleware to extract IP address from request
 * @param {Object} req - Express request object
 * @returns {string} IP address
 */
export const getClientIp = (req) => {
    return (
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "unknown"
    );
};

/**
 * Common audit actions
 */
export const AUDIT_ACTIONS = {
    CREATE: "CREATE",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    VIEW: "VIEW",
    EXPORT: "EXPORT",
    IMPORT: "IMPORT",
    APPROVE: "APPROVE",
    REJECT: "REJECT",
    TRANSFER: "TRANSFER",
    PRINT: "PRINT",
};

/**
 * Common table names
 */
export const TABLE_NAMES = {
    USER: "User",
    EMPLOYEE: "Employee",
    DEPARTMENT: "Department",
    ROLE: "Role",
    ID_CARD_TEMPLATE: "IdCardTemplate",
    ID_GENERATE: "IdGenerate",
    DEPARTMENT_TRANSFER: "DepartmentTransfer",
    MENU: "Menu",
    ROLE_PERMISSIONS: "RolePermissions",
    REPORT_ID_CARD: "IdCardReport",
    REPORT_DEPARTMENT: "DepartmentReport",
    REPORT_EMPLOYEE: "EmployeeReport",
    REPORT_TRANSFER: "DepartmentTransferReport",
};
