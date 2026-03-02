export type Freelancer = {
	id: string;
	name: string;
	email: string;
	status: "Active" | "Paused";
	activeClients: number;
	activeProjects: number;
	billableHoursMonth: number;
	outstandingAmount: number;
};

export type ClientRecord = {
	id: string;
	freelancerId: string;
	name: string;
	company: string;
	email: string;
	totalEarnings: number;
	activeProjects: number;
};

export type ProjectRecord = {
	id: string;
	freelancerId: string;
	clientId: string;
	name: string;
	status: "Active" | "Completed" | "On Hold";
	progress: number;
	billingType: "Hourly" | "Fixed";
	budget: number;
	startDate: string;
	endDate: string;
};

export type TaskRecord = {
	id: string;
	freelancerId: string;
	projectId: string;
	name: string;
	priority: "Low" | "Medium" | "High";
	status: "Pending" | "In Progress" | "Completed";
	estimatedHours: number;
	trackedHours: number;
	dueDate: string;
};

export type InvoiceRecord = {
	id: string;
	freelancerId: string;
	clientName: string;
	projectName: string;
	status: "Draft" | "Sent" | "Paid" | "Overdue";
	amount: number;
	paidAmount: number;
	issuedDate: string;
	dueDate: string;
};

export type PaymentRecord = {
	id: string;
	invoiceId: string;
	freelancerId: string;
	method: "Cash" | "Bank" | "UPI";
	date: string;
	amount: number;
};

export type ContentPage = {
	id: string;
	title: string;
	status: "Published" | "Draft";
	lastUpdatedAt: string;
	lastUpdatedBy: string;
	version: string;
};

export const freelancers: Freelancer[] = [
	{ id: "u-101", name: "Aarav Mehta", email: "aarav@freelancehub.com", status: "Active", activeClients: 5, activeProjects: 8, billableHoursMonth: 142, outstandingAmount: 52000 },
	{ id: "u-102", name: "Ira Nair", email: "ira@freelancehub.com", status: "Active", activeClients: 3, activeProjects: 6, billableHoursMonth: 118, outstandingAmount: 31000 },
	{ id: "u-103", name: "Kabir Shah", email: "kabir@freelancehub.com", status: "Paused", activeClients: 2, activeProjects: 3, billableHoursMonth: 47, outstandingAmount: 14000 },
	{ id: "u-104", name: "Nisha Reddy", email: "nisha@freelancehub.com", status: "Active", activeClients: 4, activeProjects: 7, billableHoursMonth: 129, outstandingAmount: 28000 },
];

export const clients: ClientRecord[] = [
	{ id: "c-201", freelancerId: "u-101", name: "Rohan Singh", company: "BluePeak Labs", email: "rohan@bluepeak.com", totalEarnings: 285000, activeProjects: 2 },
	{ id: "c-202", freelancerId: "u-101", name: "Maya Jain", company: "Tronix Systems", email: "maya@tronix.com", totalEarnings: 196000, activeProjects: 3 },
	{ id: "c-203", freelancerId: "u-102", name: "Neil Dsouza", company: "NorthGrid", email: "neil@northgrid.com", totalEarnings: 148000, activeProjects: 2 },
	{ id: "c-204", freelancerId: "u-104", name: "Aditi Khan", company: "SignalFlow", email: "aditi@signalflow.com", totalEarnings: 221000, activeProjects: 2 },
];

export const projects: ProjectRecord[] = [
	{ id: "p-301", freelancerId: "u-101", clientId: "c-201", name: "Web App Revamp", status: "Active", progress: 68, billingType: "Hourly", budget: 180000, startDate: "2026-01-12", endDate: "2026-03-28" },
	{ id: "p-302", freelancerId: "u-101", clientId: "c-202", name: "Invoice Automation", status: "On Hold", progress: 42, billingType: "Fixed", budget: 125000, startDate: "2025-12-20", endDate: "2026-04-15" },
	{ id: "p-303", freelancerId: "u-102", clientId: "c-203", name: "Client Portal", status: "Active", progress: 74, billingType: "Hourly", budget: 160000, startDate: "2026-01-01", endDate: "2026-03-10" },
	{ id: "p-304", freelancerId: "u-104", clientId: "c-204", name: "Time Tracking v2", status: "Completed", progress: 100, billingType: "Fixed", budget: 98000, startDate: "2025-11-05", endDate: "2026-01-15" },
];

export const tasks: TaskRecord[] = [
	{ id: "t-401", freelancerId: "u-101", projectId: "p-301", name: "Dashboard KPI widgets", priority: "High", status: "In Progress", estimatedHours: 16, trackedHours: 12, dueDate: "2026-03-03" },
	{ id: "t-402", freelancerId: "u-101", projectId: "p-301", name: "Timer state restore", priority: "Medium", status: "Pending", estimatedHours: 10, trackedHours: 0, dueDate: "2026-03-06" },
	{ id: "t-403", freelancerId: "u-101", projectId: "p-302", name: "PDF invoice template", priority: "High", status: "In Progress", estimatedHours: 14, trackedHours: 8, dueDate: "2026-03-08" },
	{ id: "t-404", freelancerId: "u-102", projectId: "p-303", name: "Role-based guards", priority: "Low", status: "Completed", estimatedHours: 8, trackedHours: 7, dueDate: "2026-02-14" },
	{ id: "t-405", freelancerId: "u-104", projectId: "p-304", name: "Weekly report export", priority: "Medium", status: "Completed", estimatedHours: 12, trackedHours: 11, dueDate: "2026-01-10" },
];

export const invoices: InvoiceRecord[] = [
	{ id: "INV-1009", freelancerId: "u-101", clientName: "BluePeak Labs", projectName: "Web App Revamp", status: "Sent", amount: 52000, paidAmount: 12000, issuedDate: "2026-02-12", dueDate: "2026-03-05" },
	{ id: "INV-1010", freelancerId: "u-102", clientName: "NorthGrid", projectName: "Client Portal", status: "Overdue", amount: 36000, paidAmount: 0, issuedDate: "2026-01-28", dueDate: "2026-02-20" },
	{ id: "INV-1011", freelancerId: "u-104", clientName: "SignalFlow", projectName: "Time Tracking v2", status: "Paid", amount: 98000, paidAmount: 98000, issuedDate: "2026-02-02", dueDate: "2026-02-25" },
	{ id: "INV-1012", freelancerId: "u-101", clientName: "Tronix Systems", projectName: "Invoice Automation", status: "Draft", amount: 27500, paidAmount: 0, issuedDate: "2026-02-24", dueDate: "2026-03-12" },
];

export const payments: PaymentRecord[] = [
	{ id: "pay-501", invoiceId: "INV-1009", freelancerId: "u-101", method: "Bank", date: "2026-02-26", amount: 12000 },
	{ id: "pay-502", invoiceId: "INV-1011", freelancerId: "u-104", method: "UPI", date: "2026-02-25", amount: 98000 },
	{ id: "pay-503", invoiceId: "INV-1010", freelancerId: "u-102", method: "Cash", date: "2026-02-10", amount: 5000 },
];

export const contentPages: ContentPage[] = [
	{ id: "ct-1", title: "About", status: "Published", lastUpdatedAt: "2026-02-18 11:30", lastUpdatedBy: "Admin", version: "v3.2" },
	{ id: "ct-2", title: "Terms", status: "Draft", lastUpdatedAt: "2026-02-26 09:15", lastUpdatedBy: "Legal Team", version: "v4.1-draft" },
	{ id: "ct-3", title: "Privacy Policy", status: "Published", lastUpdatedAt: "2026-02-11 14:50", lastUpdatedBy: "Admin", version: "v2.9" },
];

export function getFreelancerById(id?: string) {
	return freelancers.find((freelancer) => freelancer.id === id);
}

export function getWorkspaceByFreelancerId(id?: string) {
	return {
		clients: clients.filter((client) => client.freelancerId === id),
		projects: projects.filter((project) => project.freelancerId === id),
		tasks: tasks.filter((task) => task.freelancerId === id),
		invoices: invoices.filter((invoice) => invoice.freelancerId === id),
	};
}
