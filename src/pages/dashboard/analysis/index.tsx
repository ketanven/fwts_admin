import { useMemo, useState } from "react";
import { Chart } from "@/components/chart/chart";
import { useChart } from "@/components/chart/useChart";
import Icon from "@/components/icon/icon";
import dashboardService from "@/api/services/dashboardService";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text, Title } from "@/ui/typography";
import { cn } from "@/utils";
import { useQuery } from "@tanstack/react-query";

type Period = "day" | "week" | "month";

const PERIODS: { label: string; value: Period }[] = [
	{ label: "Today", value: "day" },
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
];

const CURRENCY = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function TrendPill({ value }: { value: number }) {
	const positive = value >= 0;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
				positive
					? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
					: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
			)}
		>
			<Icon icon={positive ? "mdi:trending-up" : "mdi:trending-down"} size={14} />
			{Math.abs(value).toFixed(1)}%
		</span>
	);
}

export default function Analysis() {
	const [period, setPeriod] = useState<Period>("week");

	const { data: analysisData } = useQuery({
		queryKey: ["dashboard-analysis", period],
		queryFn: () => dashboardService.getAnalysis(period),
	}) as { data: any };

	const d = analysisData || {};

	const revenueCollected = d.revenue_collected ?? 0;
	const revenueTrend = d.revenue_trend ?? 0;
	const hoursLogged = d.hours_logged ?? 0;
	const hoursTrend = d.hours_trend ?? 0;
	const activeProjects = d.active_projects ?? 0;
	const projectsTrend = d.projects_trend ?? 0;
	const freelancersBilled = d.freelancers_billed ?? 0;
	const freelancersTrend = d.freelancers_trend ?? 0;

	const productivityChart = d.productivity_chart || {};
	const throughputCategories = productivityChart.categories || [];
	const throughputHours = productivityChart.hours || [];
	const throughputTasks = productivityChart.tasks || [];

	const allocation = (d.allocation as any[]) || [];

	const throughputOptions = useChart({
		xaxis: { categories: throughputCategories },
		stroke: { curve: "smooth", width: [3, 3] },
		dataLabels: { enabled: false },
		legend: { position: "top", horizontalAlign: "left" },
		yaxis: [
			{ title: { text: "Hours" } },
			{ opposite: true, title: { text: "Tasks" } },
		],
	});

	const allocationOptions = useChart({
		labels: allocation.map((a: any) => a.name),
		legend: { show: false },
		stroke: { show: false },
		dataLabels: { enabled: false },
		plotOptions: { pie: { donut: { size: "68%" } } },
	});

	return (
		<div className="space-y-4">
			<Card className="relative overflow-hidden border-0 bg-gradient-to-r from-slate-900 via-cyan-900 to-sky-700 text-white shadow-xl">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.22),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.16),transparent_36%)]" />
				<CardContent className="relative p-6 md:p-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<Badge className="mb-3 bg-white/15 text-white hover:bg-white/20">Analytics Hub</Badge>
							<Title as="h2" className="text-2xl font-bold text-white md:text-3xl">
								Freelancer Operations Intelligence
							</Title>
							<Text className="mt-1 text-white/90">
								Live performance lens for delivery, billing, capacity, and risk.
							</Text>
						</div>
						<Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
							<SelectTrigger className="w-full border-white/25 bg-white/10 text-white md:w-44">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{PERIODS.map((item) => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{ label: "Revenue Collected", value: `₹${CURRENCY.format(revenueCollected)}`, change: revenueTrend, icon: "solar:wallet-money-linear" },
					{ label: "Hours Logged", value: hoursLogged.toLocaleString(), change: hoursTrend, icon: "solar:clock-circle-linear" },
					{ label: "Active Projects", value: activeProjects, change: projectsTrend, icon: "solar:folder-open-linear" },
					{ label: "Freelancers Billed", value: freelancersBilled, change: freelancersTrend, icon: "solar:users-group-rounded-linear" },
				].map((item) => (
					<Card key={item.label} className="gap-3 py-4">
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between">
								<Text variant="caption" className="text-muted-foreground">{item.label}</Text>
								<Icon icon={item.icon} size={18} className="text-cyan-600" />
							</div>
							<Title as="h3" className="text-2xl font-bold">{item.value}</Title>
							<TrendPill value={item.change} />
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader className="pb-1">
						<CardTitle>Delivery Throughput</CardTitle>
					</CardHeader>
					<CardContent className="pt-1">
						<Chart
							type="line"
							height={300}
							options={throughputOptions}
							series={[
								{ name: "Logged Hours", type: "line", data: throughputHours },
								{ name: "Delivered Tasks", type: "line", data: throughputTasks },
							]}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-1">
						<CardTitle>Work Allocation</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-1">
						{allocation.length > 0 ? (
							<>
								<Chart type="donut" height={220} options={allocationOptions} series={allocation.map((a: any) => a.value)} />
								<div className="space-y-2">
									{allocation.map((item: any) => (
										<div key={item.name} className="flex items-center justify-between text-sm">
											<span>{item.name}</span>
											<span className="font-semibold">{item.value}%</span>
										</div>
									))}
								</div>
							</>
						) : (
							<Text className="text-muted-foreground text-sm">No allocation data available.</Text>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
