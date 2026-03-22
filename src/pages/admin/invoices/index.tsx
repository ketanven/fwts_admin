import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import invoiceService from "@/api/services/invoiceService";
import freelancerService from "@/api/services/freelancerService";

type InvoiceRecord = {
	id: string;
	client_name?: string;
	clientName?: string;
	project_name?: string;
	projectName?: string;
	freelancer_id?: string;
	freelancerId?: string;
	status: string;
	issued_date?: string;
	issuedDate?: string;
	due_date?: string;
	dueDate?: string;
	amount: number;
	paid_amount?: number;
	paidAmount?: number;
};

type Freelancer = {
	id: string;
	name: string;
};

export default function InvoicesGlobalPage() {
	const [status, setStatus] = useState<string>("all");
	const [freelancerId, setFreelancerId] = useState<string>("all");
	const [query, setQuery] = useState("");

	const { data: invoicesResp, isLoading } = useQuery({
		queryKey: ["invoices", status, freelancerId, query],
		queryFn: () =>
			invoiceService.list({
				status: status !== "all" ? status : undefined,
				freelancer_id: freelancerId !== "all" ? freelancerId : undefined,
				search: query || undefined,
			}),
	}) as { data: any; isLoading: boolean };

	const { data: freelancersResp } = useQuery({
		queryKey: ["freelancers"],
		queryFn: freelancerService.list,
	}) as { data: any };

	const invoices: InvoiceRecord[] = useMemo(() => {
		if (!invoicesResp) return [];
		const list = Array.isArray(invoicesResp) ? invoicesResp : invoicesResp.results || [];
		return list;
	}, [invoicesResp]);

	const freelancers: Freelancer[] = useMemo(() => {
		if (!freelancersResp) return [];
		return Array.isArray(freelancersResp) ? freelancersResp : freelancersResp.results || [];
	}, [freelancersResp]);

	const columns: ColumnsType<InvoiceRecord> = [
		{ title: "Invoice #", dataIndex: "id", width: 120 },
		{ title: "Client", width: 180, render: (_, row) => row.client_name || row.clientName || "—" },
		{ title: "Project", width: 190, render: (_, row) => row.project_name || row.projectName || "—" },
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (value: string) => (
				<Badge variant={value === "Paid" ? "success" : value === "Overdue" ? "error" : value === "Sent" ? "warning" : "secondary"}>{value}</Badge>
			),
		},
		{ title: "Issued", width: 120, render: (_, row) => row.issued_date || row.issuedDate || "—" },
		{ title: "Due", width: 120, render: (_, row) => row.due_date || row.dueDate || "—" },
		{ title: "Amount", width: 130, align: "right", render: (_, row) => `₹${(row.amount || 0).toLocaleString()}` },
		{ title: "Paid", width: 120, align: "right", render: (_, row) => `₹${(row.paid_amount ?? row.paidAmount ?? 0).toLocaleString()}` },
		{
			title: "Balance",
			width: 130,
			align: "right",
			render: (_, row) => `₹${Math.max((row.amount || 0) - (row.paid_amount ?? row.paidAmount ?? 0), 0).toLocaleString()}`,
		},
	];

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="text-xl font-semibold">Invoices (Global)</h2>
				<p className="text-sm text-muted-foreground">Cross-freelancer invoice visibility for operations and collections follow-up.</p>
			</div>

			<Card>
				<CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
					<CardTitle>Invoice Register</CardTitle>
					<div className="flex flex-wrap gap-2">
						<Input placeholder="Search invoice, client, project" className="w-60" value={query} onChange={(e) => setQuery(e.target.value)} />
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="w-40">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="Draft">Draft</SelectItem>
								<SelectItem value="Sent">Sent</SelectItem>
								<SelectItem value="Paid">Paid</SelectItem>
								<SelectItem value="Overdue">Overdue</SelectItem>
							</SelectContent>
						</Select>
						<Select value={freelancerId} onValueChange={setFreelancerId}>
							<SelectTrigger className="w-48">
								<SelectValue placeholder="Freelancer" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Freelancers</SelectItem>
								{freelancers.map((freelancer) => (
									<SelectItem key={freelancer.id} value={freelancer.id}>
										{freelancer.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<Table rowKey="id" size="small" loading={isLoading} scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} columns={columns} dataSource={invoices} />
				</CardContent>
			</Card>
		</div>
	);
}
