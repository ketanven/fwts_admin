import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

type ReportTemplate = {
	id: string;
	name: string;
	description: string;
	exportFormats: string[];
};

type ReportRun = {
	id: string;
	reportType: string;
	requestedBy: string;
	timeRange: string;
	format: "PDF" | "CSV" | "XLSX";
	status: "Generated" | "In Queue";
	createdAt: string;
};

const reportTemplates: ReportTemplate[] = [
	{ id: "r-1", name: "Time Report", description: "Tracked hours by date range, freelancer, client, and project.", exportFormats: ["PDF", "CSV"] },
	{ id: "r-2", name: "Invoice Report", description: "Invoice status summary with paid, pending, and overdue splits.", exportFormats: ["PDF", "CSV", "XLSX"] },
	{ id: "r-3", name: "Client Report", description: "Client earnings, payment behavior, and engagement trend.", exportFormats: ["PDF", "CSV"] },
	{ id: "r-4", name: "Project Report", description: "Project profitability, completion risk, and utilization.", exportFormats: ["PDF", "XLSX"] },
];

const recentRuns: ReportRun[] = [
	{ id: "run-901", reportType: "Invoice Report", requestedBy: "Admin", timeRange: "Feb 2026", format: "PDF", status: "Generated", createdAt: "2026-02-28 09:40" },
	{ id: "run-902", reportType: "Time Report", requestedBy: "Ops", timeRange: "2026-02-01 to 2026-02-27", format: "CSV", status: "Generated", createdAt: "2026-02-27 18:10" },
	{ id: "run-903", reportType: "Project Report", requestedBy: "Admin", timeRange: "Q1 2026", format: "XLSX", status: "In Queue", createdAt: "2026-02-28 10:05" },
];

const columns: ColumnsType<ReportRun> = [
	{ title: "Run ID", dataIndex: "id", width: 120 },
	{ title: "Report", dataIndex: "reportType", width: 160 },
	{ title: "Requested By", dataIndex: "requestedBy", width: 130 },
	{ title: "Range", dataIndex: "timeRange" },
	{ title: "Format", dataIndex: "format", width: 90 },
	{
		title: "Status",
		dataIndex: "status",
		width: 120,
		render: (status: ReportRun["status"]) => <Badge variant={status === "Generated" ? "success" : "warning"}>{status}</Badge>,
	},
	{ title: "Created At", dataIndex: "createdAt", width: 160 },
];

export default function ReportsPage() {
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="text-xl font-semibold">Reports</h2>
				<p className="text-sm text-muted-foreground">Central report generation UI for time, invoice, client, and project analytics.</p>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				{reportTemplates.map((report) => (
					<Card key={report.id}>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>{report.name}</CardTitle>
							<Button size="sm">Generate</Button>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-3">{report.description}</p>
							<div className="flex gap-2">
								{report.exportFormats.map((format) => (
									<Badge key={format} variant="secondary">
										{format}
									</Badge>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Report Runs</CardTitle>
				</CardHeader>
				<CardContent>
					<Table rowKey="id" size="small" pagination={false} columns={columns} dataSource={recentRuns} />
				</CardContent>
			</Card>
		</div>
	);
}
