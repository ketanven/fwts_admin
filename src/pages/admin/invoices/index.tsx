import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { freelancers, invoices, type InvoiceRecord } from "../data";

export default function InvoicesGlobalPage() {
	const [status, setStatus] = useState<string>("all");
	const [freelancerId, setFreelancerId] = useState<string>("all");
	const [query, setQuery] = useState("");

	const rows = useMemo(() => {
		return invoices.filter((invoice) => {
			const matchesStatus = status === "all" || invoice.status === status;
			const matchesFreelancer = freelancerId === "all" || invoice.freelancerId === freelancerId;
			const key = query.trim().toLowerCase();
			const matchesQuery =
				!key ||
				invoice.id.toLowerCase().includes(key) ||
				invoice.clientName.toLowerCase().includes(key) ||
				invoice.projectName.toLowerCase().includes(key);
			return matchesStatus && matchesFreelancer && matchesQuery;
		});
	}, [status, freelancerId, query]);

	const columns: ColumnsType<InvoiceRecord> = [
		{ title: "Invoice #", dataIndex: "id", width: 120 },
		{ title: "Client", dataIndex: "clientName", width: 180 },
		{ title: "Project", dataIndex: "projectName", width: 190 },
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (value: InvoiceRecord["status"]) => (
				<Badge variant={value === "Paid" ? "success" : value === "Overdue" ? "error" : value === "Sent" ? "warning" : "secondary"}>{value}</Badge>
			),
		},
		{ title: "Issued", dataIndex: "issuedDate", width: 120 },
		{ title: "Due", dataIndex: "dueDate", width: 120 },
		{ title: "Amount", dataIndex: "amount", width: 130, align: "right", render: (v: number) => `₹${v.toLocaleString()}` },
		{ title: "Paid", dataIndex: "paidAmount", width: 120, align: "right", render: (v: number) => `₹${v.toLocaleString()}` },
		{
			title: "Balance",
			width: 130,
			align: "right",
			render: (_, row) => `₹${Math.max(row.amount - row.paidAmount, 0).toLocaleString()}`,
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
					<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} columns={columns} dataSource={rows} />
				</CardContent>
			</Card>
		</div>
	);
}
