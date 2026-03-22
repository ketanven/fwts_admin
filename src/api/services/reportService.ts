import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

export interface GenerateReportPayload {
  template_id: string;
  format: string;
  time_range: { start: string; end: string };
}

const getTemplates = () => apiClient.get({ url: ENDPOINTS.ADMIN.REPORT_TEMPLATES });
const generate = (data: GenerateReportPayload) => apiClient.post({ url: ENDPOINTS.ADMIN.REPORT_GENERATE, data });
const getRuns = () => apiClient.get({ url: ENDPOINTS.ADMIN.REPORT_RUNS });

export default { getTemplates, generate, getRuns };
