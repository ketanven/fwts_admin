import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse } from "axios";
import { toast } from "sonner";
import type { Result } from "#/api";
import { ResultStatus } from "#/enum";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
	(config) => {
		const accessToken = userStore.getState().userToken.accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<Result<any>>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		// Support both legacy { status, data, message } and raw REST responses
		if (typeof res.data === "object" && ("status" in res.data || "success" in res.data)) {
			const dataObj = res.data as any;
			const isSuccess = dataObj.status === ResultStatus.SUCCESS || 
				(typeof dataObj.status === "number" && dataObj.status >= 200 && dataObj.status < 300) ||
				dataObj.success === true;
			
			if (isSuccess) {
				return dataObj.data !== undefined ? dataObj.data : dataObj;
			}
			throw new Error(dataObj.message || t("sys.api.apiRequestFailed"));
		}
		return res.data;
	},
	(error: AxiosError<Result>) => {
		const { response, message, config } = error || {};
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		
		// Check if this request should skip error toast
		const skipErrorToast = (config as any)?.skipErrorToast;
		
		// toast.error(errMsg, { position: "top-center" }); // Let caller handle toast if needed, or keep it but allow caller to access validation errors
        // For validation errors (400), we probably want to handle them specifically in the form, not just a generic toast.
        // However, keeping toast for generic errors is good.
        if (!skipErrorToast && response?.status !== 400) {
		    toast.error(errMsg, { position: "top-center" });
        }
		if (response?.status === 401) {
			userStore.getState().actions.clearUserInfoAndToken();
		}
		return Promise.reject(error);
	},
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
