import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";

export interface InvoiceListParams {
  status?: string;
  freelancer_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

const list = (params?: InvoiceListParams) => apiClient.get({ url: ENDPOINTS.ADMIN.INVOICES, params });

export default { list };
