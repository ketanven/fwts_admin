import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

export interface AdminStaffPayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    role?: string;
    is_active?: boolean;
}

const listStaff = () => apiClient.get({ url: ENDPOINTS.ADMIN.STAFF });
const createStaff = (data: AdminStaffPayload) => apiClient.post({ url: ENDPOINTS.ADMIN.STAFF, data });
const updateStaff = (id: string, data: AdminStaffPayload) => apiClient.request({ url: `${ENDPOINTS.ADMIN.STAFF}${id}/`, method: "PATCH", data });
const toggleStaffStatus = (id: string) => apiClient.request({ url: `${ENDPOINTS.ADMIN.STAFF}${id}/toggle-status/`, method: "PATCH" });
const deleteStaff = (id: string) => apiClient.delete({ url: `${ENDPOINTS.ADMIN.STAFF}${id}/` });

export default {
    listStaff,
    createStaff,
    updateStaff,
    toggleStaffStatus,
    deleteStaff,
};
