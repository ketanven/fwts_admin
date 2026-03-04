import adminUserService from "@/api/services/adminUserService";
import type {
	AdminUserWorkspace,
	WorkspaceClient,
	WorkspaceInvoice,
	WorkspaceProject,
	WorkspaceTask,
} from "@/api/services/adminUserService";
import { useParams, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

type UserLite = {
	id: string | number;
	email?: string;
	first_name?: string;
	last_name?: string;
};

type UserWorkspace = {
	clients: WorkspaceClient[];
	projects: WorkspaceProject[];
	tasks: WorkspaceTask[];
	invoices: WorkspaceInvoice[];
};

const EMPTY_WORKSPACE: UserWorkspace = {
	clients: [],
	projects: [],
	tasks: [],
	invoices: [],
};

const toNumber = (value: unknown) => (typeof value === "number" ? value : Number(value) || 0);
const toString = (value: unknown) => (typeof value === "string" ? value : "");
const pick = <T,>(obj: Record<string, unknown>, ...keys: string[]): T | undefined => {
	for (const key of keys) {
		const value = obj[key];
		if (value !== undefined && value !== null) return value as T;
	}
	return undefined;
};

const toStatusKey = (value: unknown) =>
	toString(value)
		.replace(/([a-z])([A-Z])/g, "$1_$2")
		.trim()
		.toLowerCase()
		.replace(/[\s-]+/g, "_");

const toTitleCase = (value: unknown) => {
	const key = toStatusKey(value);
	if (!key) return "Unknown";
	return key
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

const getProjectStatusVariant = (value: unknown) => {
	const key = toStatusKey(value);
	if (key === "completed") return "success";
	if (key === "on_hold") return "warning";
	if (key === "cancelled" || key === "canceled" || key === "blocked") return "error";
	return "info";
};

const getTaskPriorityVariant = (value: unknown) => {
	const key = toStatusKey(value);
	if (key === "high" || key === "critical") return "error";
	if (key === "medium") return "warning";
	return "secondary";
};

const getTaskStatusVariant = (value: unknown) => {
	const key = toStatusKey(value);
	if (key === "completed" || key === "done") return "success";
	if (key === "in_progress" || key === "active") return "info";
	if (key === "blocked" || key === "cancelled" || key === "canceled") return "error";
	return "secondary";
};

const getInvoiceStatusVariant = (value: unknown) => {
	const key = toStatusKey(value);
	if (key === "paid") return "success";
	if (key === "overdue") return "error";
	if (key === "sent") return "info";
	return "secondary";
};

const formatCurrency = (value: unknown) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(toNumber(value));

function normalizeWorkspace(payload: AdminUserWorkspace | Record<string, unknown> | undefined): UserWorkspace {
	const source = (payload || {}) as Record<string, unknown>;
	const clients = (pick<unknown[]>(source, "clients", "client_list") || []).map((item, index) => {
		const row = (item || {}) as Record<string, unknown>;
		return {
			id: pick<string | number>(row, "id", "pk") ?? `client-${index}`,
			name: toString(pick(row, "name", "full_name")),
			company: toString(pick(row, "company", "company_name")),
			email: toString(pick(row, "email")),
			activeProjects: toNumber(pick(row, "activeProjects", "active_projects")),
			totalEarnings: toNumber(pick(row, "totalEarnings", "total_earnings")),
		} as WorkspaceClient;
	});
	const projects = (pick<unknown[]>(source, "projects", "project_list") || []).map((item, index) => {
		const row = (item || {}) as Record<string, unknown>;
		return {
			id: pick<string | number>(row, "id", "pk") ?? `project-${index}`,
			name: toString(pick(row, "name", "title")),
			status: toString(pick(row, "status")) || "Active",
			progress: toNumber(pick(row, "progress")),
			billingType: toString(pick(row, "billingType", "billing_type")),
			budget: toNumber(pick(row, "budget")),
			startDate: toString(pick(row, "startDate", "start_date")),
			endDate: toString(pick(row, "endDate", "end_date")),
		} as WorkspaceProject;
	});
	const tasks = (pick<unknown[]>(source, "tasks", "task_list") || []).map((item, index) => {
		const row = (item || {}) as Record<string, unknown>;
		return {
			id: pick<string | number>(row, "id", "pk") ?? `task-${index}`,
			name: toString(pick(row, "name", "title")),
			priority: toString(pick(row, "priority")) || "Low",
			status: toString(pick(row, "status")) || "Pending",
			estimatedHours: toNumber(pick(row, "estimatedHours", "estimated_hours")),
			trackedHours: toNumber(pick(row, "trackedHours", "tracked_hours")),
			dueDate: toString(pick(row, "dueDate", "due_date")),
		} as WorkspaceTask;
	});
	const invoices = (pick<unknown[]>(source, "invoices", "invoice_list") || []).map((item, index) => {
		const row = (item || {}) as Record<string, unknown>;
		return {
			id: pick<string | number>(row, "id", "pk") ?? `invoice-${index}`,
			clientName: toString(pick(row, "clientName", "client_name")),
			projectName: toString(pick(row, "projectName", "project_name")),
			status: toString(pick(row, "status")) || "Draft",
			amount: toNumber(pick(row, "amount")),
			paidAmount: toNumber(pick(row, "paidAmount", "paid_amount")),
			issuedDate: toString(pick(row, "issuedDate", "issued_date")),
			dueDate: toString(pick(row, "dueDate", "due_date")),
		} as WorkspaceInvoice;
	});
	return { clients, projects, tasks, invoices };
}

export default function UserWorkspacePage() {
	const { id } = useParams();
	const { back } = useRouter();
	const [user, setUser] = useState<UserLite | null>(null);
	const [workspace, setWorkspace] = useState<UserWorkspace>(EMPTY_WORKSPACE);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		const run = async () => {
			if (!id) return;
			setLoading(true);
			try {
				const [userRes, workspaceRes] = await Promise.allSettled([
					adminUserService.detail(id),
					adminUserService.workspace(id),
				]);
				if (!mounted) return;
				if (userRes.status === "fulfilled") {
					setUser(userRes.value as UserLite);
				} else {
					setUser(null);
				}
				if (workspaceRes.status === "fulfilled") {
					setWorkspace(normalizeWorkspace(workspaceRes.value as AdminUserWorkspace));
				} else {
					setWorkspace(EMPTY_WORKSPACE);
				}
			} catch {
				if (mounted) {
					setUser(null);
					setWorkspace(EMPTY_WORKSPACE);
				}
			} finally {
				if (mounted) setLoading(false);
			}
		};
		run();
		return () => {
			mounted = false;
		};
	}, [id]);

	const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || `User ${id}`;
	const invoicedTotal = workspace.invoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
	const paidTotal = workspace.invoices.reduce((sum, invoice) => sum + toNumber(invoice.paidAmount), 0);
	const pendingTotal = Math.max(invoicedTotal - paidTotal, 0);

	const clientColumns: ColumnsType<WorkspaceClient> = [
		{ title: "Client", dataIndex: "name", width: 180 },
		{ title: "Company", dataIndex: "company", width: 220 },
		{ title: "Email", dataIndex: "email", width: 220 },
		{ title: "Active Projects", dataIndex: "activeProjects", width: 130, align: "center" },
		{ title: "Total Earnings", dataIndex: "totalEarnings", width: 170, align: "right", render: (v?: number) => formatCurrency(v) },
	];

	const projectColumns: ColumnsType<WorkspaceProject> = [
		{ title: "Project", dataIndex: "name", width: 220 },
		{
			title: "Status",
			dataIndex: "status",
			width: 140,
			render: (status: WorkspaceProject["status"]) => (
				<Badge variant={getProjectStatusVariant(status)}>{toTitleCase(status)}</Badge>
			),
		},
		{
			title: "Progress",
			dataIndex: "progress",
			width: 180,
			render: (value?: number) => {
				const progress = Math.max(0, Math.min(100, toNumber(value)));
				return (
					<div className="space-y-1">
						<div className="text-xs font-medium text-foreground">{progress}%</div>
						<div className="h-1.5 w-full rounded-full bg-primary/15">
							<div className="h-1.5 rounded-full bg-primary" style={{ width: `${progress}%` }} />
						</div>
					</div>
				);
			},
		},
		{ title: "Billing", dataIndex: "billingType", width: 100 },
		{ title: "Budget", dataIndex: "budget", width: 140, align: "right", render: (v?: number) => formatCurrency(v) },
		{ title: "Start", dataIndex: "startDate", width: 120, render: (v?: string) => v || "--" },
		{ title: "End", dataIndex: "endDate", width: 120, render: (v?: string) => v || "--" },
	];

	const taskColumns: ColumnsType<WorkspaceTask> = [
		{ title: "Task", dataIndex: "name", width: 240 },
		{ title: "Priority", dataIndex: "priority", width: 130, render: (priority: WorkspaceTask["priority"]) => <Badge variant={getTaskPriorityVariant(priority)}>{toTitleCase(priority)}</Badge> },
		{ title: "Status", dataIndex: "status", width: 150, render: (status: WorkspaceTask["status"]) => <Badge variant={getTaskStatusVariant(status)}>{toTitleCase(status)}</Badge> },
		{ title: "Estimated", dataIndex: "estimatedHours", width: 100, align: "right", render: (h: number) => `${toNumber(h)}h` },
		{ title: "Tracked", dataIndex: "trackedHours", width: 100, align: "right", render: (h: number) => `${toNumber(h)}h` },
		{ title: "Due Date", dataIndex: "dueDate", width: 120, render: (v?: string) => v || "--" },
	];

	const invoiceColumns: ColumnsType<WorkspaceInvoice> = [
		{ title: "Invoice", dataIndex: "id", width: 140 },
		{ title: "Client", dataIndex: "clientName", width: 180 },
		{ title: "Project", dataIndex: "projectName", width: 190 },
		{ title: "Status", dataIndex: "status", width: 120, render: (status: WorkspaceInvoice["status"]) => <Badge variant={getInvoiceStatusVariant(status)}>{toTitleCase(status)}</Badge> },
		{ title: "Amount", dataIndex: "amount", width: 150, align: "right", render: (v?: number) => formatCurrency(v) },
		{ title: "Paid", dataIndex: "paidAmount", width: 150, align: "right", render: (v?: number) => formatCurrency(v) },
		{ title: "Issued", dataIndex: "issuedDate", width: 120, render: (v?: string) => v || "--" },
		{ title: "Due", dataIndex: "dueDate", width: 120, render: (v?: string) => v || "--" },
	];

	return (
		<div className="flex flex-col gap-5 pb-4">
			<Card className="relative overflow-hidden border-border bg-gradient-to-r from-primary/20 via-primary/10 to-info/20 shadow-sm">
				<div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-primary/20 blur-2xl" />
				<div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-info/20 blur-3xl" />
				<CardContent className="relative z-10 flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
					<div className="space-y-2">
						<Badge variant="outline" className="bg-background/40">
							Workspace Overview
						</Badge>
						<h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{userName}</h2>
						<p className="text-sm text-muted-foreground">
							{loading ? "Loading workspace..." : "Client, project, task and billing visibility for admins"}
						</p>
						<p className="text-xs text-muted-foreground/80">User ID: {id}</p>
					</div>
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
						<div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
							<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Invoiced</p>
							<p className="text-sm font-semibold text-foreground">{formatCurrency(invoicedTotal)}</p>
						</div>
						<div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
							<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Collected</p>
							<p className="text-sm font-semibold text-foreground">{formatCurrency(paidTotal)}</p>
						</div>
						<div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
							<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pending</p>
							<p className="text-sm font-semibold text-foreground">{formatCurrency(pendingTotal)}</p>
						</div>
						<div className="rounded-lg border border-border bg-background/50 px-3 py-2 text-center">
							<p className="text-[11px] uppercase tracking-wide text-muted-foreground">Records</p>
							<p className="text-sm font-semibold text-foreground">
								{workspace.clients.length + workspace.projects.length + workspace.tasks.length + workspace.invoices.length}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold">Freelancer Workspace</h3>
					<p className="text-sm text-muted-foreground">Operational drill-down by hierarchy and status</p>
				</div>
				<Button variant="outline" onClick={back}>
					Back
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<Card className="border-border bg-card">
					<CardContent className="pt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-primary">Clients</p>
						<p className="mt-1 text-2xl font-semibold text-foreground">{workspace.clients.length}</p>
						<p className="text-xs text-muted-foreground">Active client relationships</p>
					</CardContent>
				</Card>
				<Card className="border-border bg-card">
					<CardContent className="pt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-info">Projects</p>
						<p className="mt-1 text-2xl font-semibold text-foreground">{workspace.projects.length}</p>
						<p className="text-xs text-muted-foreground">Delivery pipelines</p>
					</CardContent>
				</Card>
				<Card className="border-border bg-card">
					<CardContent className="pt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-warning-dark dark:text-warning-light">Tasks</p>
						<p className="mt-1 text-2xl font-semibold text-foreground">{workspace.tasks.length}</p>
						<p className="text-xs text-muted-foreground">Execution checkpoints</p>
					</CardContent>
				</Card>
				<Card className="border-border bg-card">
					<CardContent className="pt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-success">Invoices</p>
						<p className="mt-1 text-2xl font-semibold text-foreground">{workspace.invoices.length}</p>
						<p className="text-xs text-muted-foreground">Billing records tracked</p>
					</CardContent>
				</Card>
			</div>

			<Card className="border-border bg-card shadow-sm">
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-3">
						<span>Hierarchy Details</span>
						<Badge variant="outline">
							{workspace.projects.length} Projects / {workspace.tasks.length} Tasks
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="clients">
						<TabsList className="h-auto flex-wrap gap-1 bg-muted p-1">
							<TabsTrigger value="clients" className="data-[state=active]:bg-background">
								Clients ({workspace.clients.length})
							</TabsTrigger>
							<TabsTrigger value="projects" className="data-[state=active]:bg-background">
								Projects ({workspace.projects.length})
							</TabsTrigger>
							<TabsTrigger value="tasks" className="data-[state=active]:bg-background">
								Tasks ({workspace.tasks.length})
							</TabsTrigger>
							<TabsTrigger value="invoices" className="data-[state=active]:bg-background">
								Invoices ({workspace.invoices.length})
							</TabsTrigger>
						</TabsList>
						<TabsContent value="clients" className="mt-4">
							<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={clientColumns} dataSource={workspace.clients} />
						</TabsContent>
						<TabsContent value="projects" className="mt-4">
							<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={projectColumns} dataSource={workspace.projects} />
						</TabsContent>
						<TabsContent value="tasks" className="mt-4">
							<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={taskColumns} dataSource={workspace.tasks} />
						</TabsContent>
						<TabsContent value="invoices" className="mt-4">
							<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={invoiceColumns} dataSource={workspace.invoices} />
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
