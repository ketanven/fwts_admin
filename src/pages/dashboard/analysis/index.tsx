import { useMemo, useState } from "react";
import { Chart } from "@/components/chart/chart";
import { useChart } from "@/components/chart/useChart";
import Icon from "@/components/icon/icon";
import { clients, freelancers, invoices, projects, tasks } from "@/pages/admin/data";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Text, Title } from "@/ui/typography";
import { cn } from "@/utils";

type Period = "day" | "week" | "month";

const PERIODS: { label: string; value: Period }[] = [
	{ label: "Today", value: "day" },
	{ label: "This Week", value: "week" },
	{ label: "This Month", value: "month" },
];

const PERIOD_SCALE: Record<Period, number> = {
	day: 0.24,
	week: 1,
	month: 4.1,
};

const THROUGHPUT_SERIES: Record<Period, { categories: string[]; hours: number[]; tasks: number[] }> = {
	day: {
		categories: ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"],
		hours: [8, 14, 12, 16, 11, 9],
		tasks: [2, 4, 3, 5, 4, 2],
	},
	week: {
		categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		hours: [42, 58, 64, 52, 60, 22, 14],
		tasks: [8, 9, 11, 8, 10, 4, 3],
	},
	month: {
		categories: ["W1", "W2", "W3", "W4"],
		hours: [192, 228, 214, 236],
		tasks: [34, 40, 37, 43],
	},
};

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

	const baseRevenueCollected = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
	const baseInvoiceTotal = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
	const baseBillableHours = freelancers.reduce((sum, freelancer) => sum + freelancer.billableHoursMonth, 0);
	const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue").length;
	const completedTasks = tasks.filter((task) => task.status === "Completed").length;
	const activeProjects = projects.filter((project) => project.status === "Active").length;

	const scale = PERIOD_SCALE[period];
	const kpi = useMemo(() => {
		const billedHours = Math.round(baseBillableHours * scale);
		const deliveredTasks = Math.max(1, Math.round(completedTasks * scale));
		const revenueCollected = Math.round(baseRevenueCollected * scale);
		const invoiceCoverage = Math.round((baseRevenueCollected / Math.max(baseInvoiceTotal, 1)) * 100);
		const utilization = Math.min(98, Math.round((billedHours / Math.max(freelancers.length * 40, 1)) * 100));
		return {
			billedHours,
			deliveredTasks,
			revenueCollected,
			invoiceCoverage,
			utilization,
		};
	}, [baseBillableHours, baseInvoiceTotal, baseRevenueCollected, completedTasks, scale]);

	const throughputData = THROUGHPUT_SERIES[period];

	const throughputOptions = useChart({
		xaxis: { categories: throughputData.categories },
		stroke: { curve: "smooth", width: [3, 3] },
		dataLabels: { enabled: false },
		legend: { position: "top", horizontalAlign: "left" },
		yaxis: [
			{
				title: { text: "Hours" },
			},
			{
				opposite: true,
				title: { text: "Tasks" },
			},
		],
	});

	const taskMixSeries = [
		tasks.filter((task) => task.status === "Completed").length,
		tasks.filter((task) => task.status === "In Progress").length,
		tasks.filter((task) => task.status === "Pending").length,
	];

	const taskMixOptions = useChart({
		labels: ["Completed", "In Progress", "Pending"],
		colors: ["#22c55e", "#3b82f6", "#f59e0b"],
		legend: { show: false },
		stroke: { show: false },
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: "68%",
				},
			},
		},
	});

	const freelancerOutput = freelancers
		.map((freelancer) => {
			const workload = Math.min(100, Math.round((freelancer.billableHoursMonth / 160) * 100));
			const collected = invoices
				.filter((invoice) => invoice.freelancerId === freelancer.id)
				.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
			return {
				...freelancer,
				workload,
				collected,
			};
		})
		.sort((a, b) => b.collected - a.collected);

	const capacityOptions = useChart({
		plotOptions: {
			bar: {
				horizontal: true,
				borderRadius: 4,
			},
		},
		xaxis: {
			categories: freelancerOutput.map((freelancer) => freelancer.name.split(" ")[0]),
		},
		dataLabels: { enabled: false },
		legend: { show: false },
	});

	const riskItems = [
		{ label: "Overdue invoices", value: overdueInvoices, tone: "text-orange-600" },
		{
			label: "Projects on hold",
			value: projects.filter((project) => project.status === "On Hold").length,
			tone: "text-amber-600",
		},
		{
			label: "High-priority pending tasks",
			value: tasks.filter((task) => task.priority === "High" && task.status !== "Completed").length,
			tone: "text-rose-600",
		},
	];

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

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
				{[
					{
						label: "Billed Hours",
						value: kpi.billedHours.toLocaleString(),
						change: 6.2,
						icon: "solar:clock-circle-linear",
					},
					{
						label: "Delivered Tasks",
						value: kpi.deliveredTasks.toLocaleString(),
						change: 4.1,
						icon: "solar:check-square-linear",
					},
					{
						label: "Collected Revenue",
						value: `₹${CURRENCY.format(kpi.revenueCollected)}`,
						change: 8.8,
						icon: "solar:wallet-money-linear",
					},
					{
						label: "Invoice Coverage",
						value: `${kpi.invoiceCoverage}%`,
						change: -1.4,
						icon: "solar:chart-square-linear",
					},
					{ label: "Team Utilization", value: `${kpi.utilization}%`, change: 2.6, icon: "solar:bolt-circle-linear" },
				].map((item) => (
					<Card key={item.label} className="gap-3 py-4">
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between">
								<Text variant="caption" className="text-muted-foreground">
									{item.label}
								</Text>
								<Icon icon={item.icon} size={18} className="text-cyan-600" />
							</div>
							<Title as="h3" className="text-2xl font-bold">
								{item.value}
							</Title>
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
								{ name: "Logged Hours", type: "line", data: throughputData.hours },
								{ name: "Delivered Tasks", type: "line", data: throughputData.tasks },
							]}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-1">
						<CardTitle>Task Mix</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-1">
						<Chart type="donut" height={220} options={taskMixOptions} series={taskMixSeries} />
						<div className="space-y-2">
							{[
								{ label: "Completed", value: taskMixSeries[0], color: "#22c55e" },
								{ label: "In Progress", value: taskMixSeries[1], color: "#3b82f6" },
								{ label: "Pending", value: taskMixSeries[2], color: "#f59e0b" },
							].map((item) => (
								<div key={item.label} className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
										{item.label}
									</div>
									<span className="font-semibold">{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card className="xl:col-span-2">
					<CardHeader className="pb-1">
						<CardTitle>Freelancer Performance Grid</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto pt-1">
						<table className="w-full min-w-[720px] text-sm">
							<thead>
								<tr className="border-b text-muted-foreground">
									<th className="py-3 text-left font-medium">Freelancer</th>
									<th className="py-3 text-left font-medium">Clients</th>
									<th className="py-3 text-left font-medium">Projects</th>
									<th className="py-3 text-left font-medium">Hours</th>
									<th className="py-3 text-left font-medium">Collected</th>
									<th className="py-3 text-left font-medium">Load</th>
								</tr>
							</thead>
							<tbody>
								{freelancerOutput.map((freelancer) => (
									<tr key={freelancer.id} className="border-b last:border-b-0">
										<td className="py-3">
											<div className="font-medium">{freelancer.name}</div>
											<div className="text-xs text-muted-foreground">{freelancer.email}</div>
										</td>
										<td className="py-3">{freelancer.activeClients}</td>
										<td className="py-3">{freelancer.activeProjects}</td>
										<td className="py-3">{freelancer.billableHoursMonth}h</td>
										<td className="py-3">₹{CURRENCY.format(freelancer.collected)}</td>
										<td className="py-3">
											<div className="flex items-center gap-2">
												<Progress value={freelancer.workload} />
												<span className="w-10 text-xs">{freelancer.workload}%</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-1">
						<CardTitle>Capacity Snapshot</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-1">
						<Chart
							type="bar"
							height={180}
							options={capacityOptions}
							series={[
								{
									name: "Hours",
									data: freelancerOutput.map((freelancer) => freelancer.billableHoursMonth),
								},
							]}
						/>
						<div className="space-y-2">
							{riskItems.map((item) => (
								<div
									key={item.label}
									className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm"
								>
									<span>{item.label}</span>
									<span className={cn("font-semibold", item.tone)}>{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle>Insights</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-3">
					<div className="rounded-xl border bg-cyan-500/10 p-4">
						<Text variant="caption" className="text-cyan-700 dark:text-cyan-300">
							Growth Signal
						</Text>
						<Text className="mt-1 font-medium">
							Collected revenue trend is improving with {clients.length} active clients and {activeProjects} active
							projects.
						</Text>
					</div>
					<div className="rounded-xl border bg-indigo-500/10 p-4">
						<Text variant="caption" className="text-indigo-700 dark:text-indigo-300">
							Delivery Signal
						</Text>
						<Text className="mt-1 font-medium">
							{completedTasks} tasks are completed, while in-progress pipeline remains healthy for the current sprint.
						</Text>
					</div>
					<div className="rounded-xl border bg-orange-500/10 p-4">
						<Text variant="caption" className="text-orange-700 dark:text-orange-300">
							Risk Signal
						</Text>
						<Text className="mt-1 font-medium">
							{overdueInvoices} overdue invoice(s) need follow-up to protect cash flow predictability.
						</Text>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
