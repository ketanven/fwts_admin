import apiClient from "../apiClient";
import { ENDPOINTS } from "@/config/apiConfig";
import type { BasicStatus } from "#/enum";

export type AdminUser = {
	id: number | string;
	email: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
	status?: BasicStatus;
	is_active?: boolean;
	date_joined?: string;
};

export type AdminUserListParams = {
	search?: string;
	status?: BasicStatus | string;
	page?: number;
	page_size?: number;
};

export type AdminUserPayload = {
	email: string;
	password?: string;
	first_name?: string;
	last_name?: string;
	status?: BasicStatus;
	is_active?: boolean;
};

export type WorkspaceClient = {
	id: string | number;
	name?: string;
	company?: string;
	email?: string;
	activeProjects?: number;
	totalEarnings?: number;
};

export type WorkspaceProject = {
	id: string | number;
	name?: string;
	status?: "Active" | "Completed" | "On Hold" | string;
	progress?: number;
	billingType?: "Hourly" | "Fixed" | string;
	budget?: number;
	startDate?: string;
	endDate?: string;
};

export type WorkspaceTask = {
	id: string | number;
	name?: string;
	priority?: "Low" | "Medium" | "High" | string;
	status?: "Pending" | "In Progress" | "Completed" | string;
	estimatedHours?: number;
	trackedHours?: number;
	dueDate?: string;
};

export type WorkspaceInvoice = {
	id: string | number;
	clientName?: string;
	projectName?: string;
	status?: "Draft" | "Sent" | "Paid" | "Overdue" | string;
	amount?: number;
	paidAmount?: number;
	issuedDate?: string;
	dueDate?: string;
};

export type AdminUserWorkspace = {
	clients?: WorkspaceClient[];
	projects?: WorkspaceProject[];
	tasks?: WorkspaceTask[];
	invoices?: WorkspaceInvoice[];
};

const list = (params?: AdminUserListParams) => apiClient.get({ url: ENDPOINTS.ADMIN.USERS, params });
const detail = (id: AdminUser["id"]) => apiClient.get({ url: `${ENDPOINTS.ADMIN.USERS}${id}/` });
const workspace = (id: AdminUser["id"]) => apiClient.get<AdminUserWorkspace>({ url: `${ENDPOINTS.ADMIN.USERS}${id}/workspace/` });
const create = (data: AdminUserPayload) => apiClient.post({ url: ENDPOINTS.ADMIN.USERS, data });
const update = (id: AdminUser["id"], data: AdminUserPayload) => apiClient.request({ url: `${ENDPOINTS.ADMIN.USERS}${id}/`, method: "PATCH", data });
const remove = (id: AdminUser["id"]) => apiClient.delete({ url: `${ENDPOINTS.ADMIN.USERS}${id}/` });

export default {
	list,
	detail,
	workspace,
	create,
	update,
	remove,
};
