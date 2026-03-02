import adminUserService from "@/api/services/adminUserService";
import { useParams, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { getWorkspaceByFreelancerId, type ClientRecord, type ProjectRecord, type TaskRecord } from "@/pages/admin/data";

type UserLite = {
	id: string | number;
	email?: string;
	first_name?: string;
	last_name?: string;
};

export default function UserWorkspacePage() {
	const { id } = useParams();
	const { back } = useRouter();
	const [user, setUser] = useState<UserLite | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		const run = async () => {
			if (!id) return;
			setLoading(true);
			try {
				const res = (await adminUserService.detail(id)) as UserLite;
				if (mounted) setUser(res);
			} catch {
				if (mounted) setUser(null);
			} finally {
				if (mounted) setLoading(false);
			}
		};
		run();
		return () => {
			mounted = false;
		};
	}, [id]);

	const workspace = useMemo(() => getWorkspaceByFreelancerId(id), [id]);
	const userName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email || `User ${id}`;

	const clientColumns: ColumnsType<ClientRecord> = [
		{ title: "Client", dataIndex: "name", width: 180 },
		{ title: "Company", dataIndex: "company", width: 220 },
		{ title: "Email", dataIndex: "email", width: 220 },
		{ title: "Active Projects", dataIndex: "activeProjects", width: 130, align: "center" },
		{ title: "Total Earnings", dataIndex: "totalEarnings", width: 140, align: "right", render: (v: number) => `₹${v.toLocaleString()}` },
	];

	const projectColumns: ColumnsType<ProjectRecord> = [
		{ title: "Project", dataIndex: "name", width: 220 },
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (status: ProjectRecord["status"]) => (
				<Badge variant={status === "Completed" ? "success" : status === "On Hold" ? "warning" : "info"}>{status}</Badge>
			),
		},
		{ title: "Progress", dataIndex: "progress", width: 100, align: "center", render: (value: number) => `${value}%` },
		{ title: "Billing", dataIndex: "billingType", width: 100 },
		{ title: "Budget", dataIndex: "budget", width: 120, align: "right", render: (v: number) => `₹${v.toLocaleString()}` },
		{ title: "Start", dataIndex: "startDate", width: 120 },
		{ title: "End", dataIndex: "endDate", width: 120 },
	];

	const taskColumns: ColumnsType<TaskRecord> = [
		{ title: "Task", dataIndex: "name", width: 240 },
		{ title: "Priority", dataIndex: "priority", width: 110, render: (priority: TaskRecord["priority"]) => <Badge variant={priority === "High" ? "error" : priority === "Medium" ? "warning" : "secondary"}>{priority}</Badge> },
		{ title: "Status", dataIndex: "status", width: 130, render: (status: TaskRecord["status"]) => <Badge variant={status === "Completed" ? "success" : status === "In Progress" ? "info" : "secondary"}>{status}</Badge> },
		{ title: "Estimated", dataIndex: "estimatedHours", width: 100, align: "right", render: (h: number) => `${h}h` },
		{ title: "Tracked", dataIndex: "trackedHours", width: 100, align: "right", render: (h: number) => `${h}h` },
		{ title: "Due Date", dataIndex: "dueDate", width: 120 },
	];

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">Freelancer Workspace</h2>
					<p className="text-sm text-muted-foreground">
						{loading ? "Loading user..." : `${userName} - Client to project to task hierarchy`}
					</p>
				</div>
				<Button variant="outline" onClick={back}>
					Back
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Clients</p>
						<p className="text-xl font-semibold">{workspace.clients.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Projects</p>
						<p className="text-xl font-semibold">{workspace.projects.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Tasks</p>
						<p className="text-xl font-semibold">{workspace.tasks.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-sm text-muted-foreground">Invoices</p>
						<p className="text-xl font-semibold">{workspace.invoices.length}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Hierarchy Details</CardTitle>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="clients">
						<TabsList>
							<TabsTrigger value="clients">Clients</TabsTrigger>
							<TabsTrigger value="projects">Projects</TabsTrigger>
							<TabsTrigger value="tasks">Tasks</TabsTrigger>
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
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
