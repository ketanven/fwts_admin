import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

export interface RolePayload {
    name: string;
}

export interface AssignPermissionsPayload {
    permission_codes: string[];
}

const listRoles = () => apiClient.get({ url: ENDPOINTS.ADMIN.ROLES });
const createRole = (data: RolePayload) => apiClient.post({ url: ENDPOINTS.ADMIN.ROLES, data });
const getRole = (id: string) => apiClient.get({ url: `${ENDPOINTS.ADMIN.ROLES}${id}/` });
const updateRole = (id: string, data: RolePayload) => apiClient.request({ url: `${ENDPOINTS.ADMIN.ROLES}${id}/`, method: "PATCH", data });
const deleteRole = (id: string) => apiClient.delete({ url: `${ENDPOINTS.ADMIN.ROLES}${id}/` });
const assignPermissions = (id: string, data: AssignPermissionsPayload) => apiClient.post({ url: `${ENDPOINTS.ADMIN.ROLES}${id}/permissions/`, data });

export default {
    listRoles,
    createRole,
    getRole,
    updateRole,
    deleteRole,
    assignPermissions,
};
