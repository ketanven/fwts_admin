import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

const getPermissions = () => apiClient.get({ url: ENDPOINTS.ADMIN.PERMISSIONS });

export default {
    getPermissions,
};
