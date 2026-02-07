import api from "./axios";

export const getEmployeeReport = async (filters?: { status?: string, departmentId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.departmentId && filters.departmentId !== 'all') params.append('departmentId', filters.departmentId);

    const response = await api.get(`/employee-report?${params.toString()}`);
    return response.data;
};

export const getDepartmentReport = async (filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const response = await api.get(`/department-report?${params.toString()}`);
    return response.data;
};

export const getDepartmentTransferReport = async (filters?: {
    period?: string,
    startDate?: string,
    endDate?: string
}) => {
    const params = new URLSearchParams();
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/department-transfer-report?${params.toString()}`);
    return response.data;
};
