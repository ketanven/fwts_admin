import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import dashboardService from "@/api/services/dashboardService";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Text, Title } from "@/ui/typography";
import { useQuery } from "@tanstack/react-query";

const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const quickActions = [
	{ label: "Create Invoice", icon: "solar:bill-list-linear" },
	{ label: "Add Freelancer", icon: "solar:user-plus-linear" },
	{ label: "Add Project", icon: "solar:folder-with-files-linear" },
];

export default function Workbench() {
	const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: dashboardService.getStats }) as { data: any };
	const { data: revenueData } = useQuery({ queryKey: ["dashboard-revenue"], queryFn: () => dashboardService.getRevenueChart() }) as { data: any };
	const { data: taskStats } = useQuery({ queryKey: ["dashboard-tasks"], queryFn: dashboardService.getTaskStats }) as { data: any };
	const { data: activityFeed } = useQuery({ queryKey: ["dashboard-activity"], queryFn: dashboardService.getActivity }) as { data: any };

	const s = stats || {};
	const revenueCollected = s.revenue_collected ?? 0;
	const openPipeline = s.open_pipeline ?? 0;
	const activeFreelancers = s.active_freelancers ?? 0;
	const totalFreelancers = s.total_freelancers ?? 0;
	const overdueInvoices = s.overdue_invoices ?? 0;

	const monthlyRevenueCategories = revenueData?.months || [];
	const monthlyRevenueSeries = [
		{ name: "Received", data: revenueData?.received || [] },
		{ name: "Invoiced", data: revenueData?.invoiced || [] },
	];

	const ts = taskStats || {};
	const taskDistribution = [
		{ label: "Completed", value: ts.completed ?? 0, color: "#22c55e" },
		{ label: "In Progress", value: ts.in_progress ?? 0, color: "#3b82f6" },
		{ label: "Pending", value: ts.pending ?? 0, color: "#f59e0b" },
	];
	const totalTasks = taskDistribution.reduce((sum, t) => sum + t.value, 0) || 1;

	const activity = (activityFeed as any[]) || [];

	const revenueChartOptions = useChart({
		xaxis: { categories: monthlyRevenueCategories },
		stroke: { curve: "smooth", width: 3 },
		legend: { position: "top", horizontalAlign: "left" },
		grid: { borderColor: "hsl(var(--border))" },
		dataLabels: { enabled: false },
		yaxis: {
			labels: {
				formatter: (value: number) => `₹${value}k`,
			},
		},
		tooltip: {
			y: {
				formatter: (value: number) => `₹${value}k`,
			},
		},
	});

	return (
		<div className="space-y-4">
			<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-600 text-white shadow-xl">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.22),transparent_40%)]" />
				<CardContent className="relative p-6 md:p-8">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-4">
							<Badge className="bg-white/20 text-white hover:bg-white/25">Freelancer Work Management</Badge>
							<div>
								<Title as="h2" className="text-2xl font-bold md:text-3xl text-white">
									{GLOBAL_CONFIG.appName} Command Center
								</Title>
								<Text className="text-white/90">
									Track projects, invoices, payouts, and workload in one admin cockpit.
								</Text>
							</div>
							<div className="flex flex-wrap gap-2">
								{quickActions.map((action) => (
									<Button
										key={action.label}
										size="sm"
										variant="secondary"
										className="bg-white/90 text-slate-900 hover:bg-white"
									>
										<Icon icon={action.icon} size={18} />
										{action.label}
									</Button>
								))}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">Revenue Collected</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">₹{currency.format(revenueCollected)}</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">Open Pipeline</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">₹{currency.format(openPipeline)}</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">Active Freelancers</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">{activeFreelancers}/{totalFreelancers}</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">Overdue Invoices</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">{overdueInvoices}</Title>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader className="pb-0">
						<CardTitle>Revenue Flow (12 Months)</CardTitle>
					</CardHeader>
					<CardContent className="pt-2">
						<Chart type="line" height={300} options={revenueChartOptions} series={monthlyRevenueSeries} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Task Distribution</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{taskDistribution.map((item) => {
							const percentage = Math.round((item.value / totalTasks) * 100);
							return (
								<div key={item.label} className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<div className="flex items-center gap-2">
											<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
											<span>{item.label}</span>
										</div>
										<span className="font-semibold">{item.value}</span>
									</div>
									<Progress value={percentage} />
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle>Live Activity</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{activity.length === 0 && (
						<Text className="text-muted-foreground text-sm">No recent activity.</Text>
					)}
					{activity.map((item: any, idx: number) => (
						<div key={idx} className="flex gap-3 rounded-lg border bg-muted/20 p-3">
							<div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
								<Icon icon={item.icon || "solar:document-add-linear"} size={18} />
							</div>
							<div className="min-w-0">
								<Text className="font-medium">{item.title}</Text>
								<Text variant="caption" className="text-muted-foreground">{item.detail}</Text>
								<Text variant="caption" className="block text-muted-foreground/80">{item.time}</Text>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
