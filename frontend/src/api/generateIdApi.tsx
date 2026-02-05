import api from "./axios";

const BASE_PATH = "/id-generates";

export type IdGenerateStatus = "created" | "ready_to_print" | "printed";

export interface IdGenerate {
    id: number;
    employeeId: number;
    templateId: number;
    createdById: number;
    printedById?: number;
    qrCode: string;
    status: IdGenerateStatus;
    issueDate?: string;
    expiryDate?: string;
    createdAt: string;
    updatedAt: string;
    employee?: any; // Expanding this based on backend include
    template?: any;
    createdBy?: any;
    printedBy?: any;
}

/**
 * GET ALL IDS
 */
export const getAllIdGenerates = async (): Promise<IdGenerate[]> => {
    const response = await api.get(BASE_PATH);
    return response.data;
};

/**
 * GET SINGLE ID
 */
export const getIdGenerateById = async (id: number): Promise<IdGenerate> => {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data;
};

/**
 * CREATE ID
 */
export const createIdGenerate = async (data: {
    employeeId: number;
    templateId: number;
    issueDate?: string;
    expiryDate?: string;
}): Promise<any> => {
    const response = await api.post(BASE_PATH, data);
    return response.data;
};

/**
 * MARK READY TO PRINT
 */
export const markReadyToPrint = async (id: number): Promise<any> => {
    const response = await api.patch(`${BASE_PATH}/${id}/ready`);
    return response.data;
};

/**
 * PRINT ID
 */
export const printIdGenerate = async (id: number): Promise<any> => {
    const response = await api.patch(`${BASE_PATH}/${id}/print`);
    return response.data;
};

/**
 * VERIFY QR CODE (Public)
 */
export const verifyQrCode = async (qrCode: string): Promise<any> => {
    const response = await api.get(`${BASE_PATH}/verify/${qrCode}`);
    return response.data;
};
