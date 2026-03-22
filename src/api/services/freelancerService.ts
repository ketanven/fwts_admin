import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

const list = () => apiClient.get({ url: ENDPOINTS.ADMIN.FREELANCERS });

export default { list };
