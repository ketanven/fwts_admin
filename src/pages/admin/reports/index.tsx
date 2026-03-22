import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reportService from "@/api/services/reportService";
import { toast } from "sonner";

type ReportTemplate = {
	id: string;
	name: string;
	description: string;
	export_formats?: string[];
	exportFormats?: string[];
};

type ReportRun = {
	id: string;
	report_type?: string;
	reportType?: string;
	requested_by?: string;
	requestedBy?: string;
	time_range?: string;
	timeRange?: string;
	format: string;
	status: string;
	created_at?: string;
	createdAt?: string;
	download_url?: string;
};

const columns: ColumnsType<ReportRun> = [
	{ title: "Run ID", dataIndex: "id", width: 120 },
	{ title: "Report", width: 160, render: (_, row) => row.report_type || row.reportType || "—" },
	{ title: "Requested By", width: 130, render: (_, row) => row.requested_by || row.requestedBy || "—" },
	{ title: "Range", width: 200, render: (_, row) => row.time_range || row.timeRange || "—" },
	{ title: "Format", dataIndex: "format", width: 90 },
	{
		title: "Status",
		dataIndex: "status",
		width: 120,
		render: (status: string) => <Badge variant={status === "Generated" ? "success" : "warning"}>{status}</Badge>,
	},
	{ title: "Created At", width: 160, render: (_, row) => row.created_at || row.createdAt || "—" },
];

export default function ReportsPage() {
	const queryClient = useQueryClient();

	const { data: templatesResp } = useQuery({
		queryKey: ["report-templates"],
		queryFn: reportService.getTemplates,
	}) as { data: any };

	const { data: runsResp, isLoading: runsLoading } = useQuery({
		queryKey: ["report-runs"],
		queryFn: reportService.getRuns,
	}) as { data: any; isLoading: boolean };

	const templates: ReportTemplate[] = Array.isArray(templatesResp) ? templatesResp : templatesResp?.results || [];
	const runs: ReportRun[] = Array.isArray(runsResp) ? runsResp : runsResp?.results || [];

	const generateMutation = useMutation({
		mutationFn: reportService.generate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["report-runs"] });
			toast.success("Report generation started");
		},
		onError: () => {
			toast.error("Failed to generate report");
		},
	});

	const handleGenerate = (template: ReportTemplate) => {
		const formats = template.export_formats || template.exportFormats || ["PDF"];
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
		const end = now.toISOString().split("T")[0];
		generateMutation.mutate({
			template_id: template.id,
			format: formats[0],
			time_range: { start, end },
		});
	};

	return (
		<div className="flex flex-col gap-4">
			<div>
				<h2 className="text-xl font-semibold">Reports</h2>
				<p className="text-sm text-muted-foreground">Central report generation UI for time, invoice, client, and project analytics.</p>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
				{templates.map((report) => {
					const formats = report.export_formats || report.exportFormats || [];
					return (
						<Card key={report.id}>
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>{report.name}</CardTitle>
								<Button size="sm" onClick={() => handleGenerate(report)} disabled={generateMutation.isPending}>
									Generate
								</Button>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-3">{report.description}</p>
								<div className="flex gap-2">
									{formats.map((format) => (
										<Badge key={format} variant="secondary">{format}</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent Report Runs</CardTitle>
				</CardHeader>
				<CardContent>
					<Table rowKey="id" size="small" loading={runsLoading} pagination={false} columns={columns} dataSource={runs} />
				</CardContent>
			</Card>
		</div>
	);
}
