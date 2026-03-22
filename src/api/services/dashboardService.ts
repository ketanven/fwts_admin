import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

const getStats = () => apiClient.get({ url: ENDPOINTS.ADMIN.DASHBOARD_STATS });
const getRevenueChart = (year?: number) =>
  apiClient.get({ url: ENDPOINTS.ADMIN.DASHBOARD_REVENUE_CHART, params: year ? { year } : undefined });
const getTaskStats = () => apiClient.get({ url: ENDPOINTS.ADMIN.DASHBOARD_TASK_STATS });
const getActivity = () => apiClient.get({ url: ENDPOINTS.ADMIN.DASHBOARD_ACTIVITY });
const getAnalysis = (period: "day" | "week" | "month" = "week") =>
  apiClient.get({ url: ENDPOINTS.ADMIN.DASHBOARD_ANALYSIS, params: { period } });

export default {
  getStats,
  getRevenueChart,
  getTaskStats,
  getActivity,
  getAnalysis,
};
