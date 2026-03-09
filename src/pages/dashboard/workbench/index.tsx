import { Chart, useChart } from "@/components/chart";
import Icon from "@/components/icon/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { clients, freelancers, invoices, payments, projects, tasks } from "@/pages/admin/data";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Progress } from "@/ui/progress";
import { Text, Title } from "@/ui/typography";
import { cn } from "@/utils";

const currency = new Intl.NumberFormat("en-IN", {
	maximumFractionDigits: 0,
});

const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
const totalPipeline = invoices.reduce((sum, invoice) => sum + Math.max(invoice.amount - invoice.paidAmount, 0), 0);
const activeFreelancers = freelancers.filter((freelancer) => freelancer.status === "Active").length;
const activeProjects = projects.filter((project) => project.status === "Active").length;
const completedTasks = tasks.filter((task) => task.status === "Completed").length;
const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length;
const overdueInvoices = invoices.filter((invoice) => invoice.status === "Overdue").length;

const monthlyRevenueSeries = [
	{
		name: "Received",
		data: [125, 180, 136, 208, 184, 240, 265, 224, 210, 236, 258, 278],
	},
	{
		name: "Invoiced",
		data: [168, 212, 186, 255, 242, 280, 314, 274, 264, 296, 322, 341],
	},
];

const monthlyRevenueCategories = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

const invoiceStatusData = [
	{ label: "Paid", value: invoices.filter((invoice) => invoice.status === "Paid").length, color: "#16a34a" },
	{ label: "Sent", value: invoices.filter((invoice) => invoice.status === "Sent").length, color: "#2563eb" },
	{ label: "Overdue", value: invoices.filter((invoice) => invoice.status === "Overdue").length, color: "#ea580c" },
	{ label: "Draft", value: invoices.filter((invoice) => invoice.status === "Draft").length, color: "#7c3aed" },
];

const topFreelancers = freelancers
	.map((freelancer) => ({
		...freelancer,
		realization: freelancer.billableHoursMonth * 1800,
	}))
	.sort((a, b) => b.realization - a.realization)
	.slice(0, 3);

const taskDistribution = [
	{ label: "Completed", value: completedTasks, color: "#22c55e" },
	{ label: "In Progress", value: inProgressTasks, color: "#3b82f6" },
	{ label: "Pending", value: tasks.filter((task) => task.status === "Pending").length, color: "#f59e0b" },
];

const quickActions = [
	{ label: "Create Invoice", icon: "solar:bill-list-linear" },
	{ label: "Add Freelancer", icon: "solar:user-plus-linear" },
	{ label: "Add Project", icon: "solar:folder-with-files-linear" },
];

const activityFeed = [
	{
		title: "Invoice INV-1012 prepared",
		detail: "Tronix Systems invoice draft is ready for review",
		time: "12m ago",
		icon: "solar:document-add-linear",
	},
	{
		title: "Payment captured",
		detail: "UPI payment of ₹98,000 posted for INV-1011",
		time: "44m ago",
		icon: "solar:wallet-money-linear",
	},
	{
		title: "Task milestone reached",
		detail: "Client Portal crossed 74% completion",
		time: "2h ago",
		icon: "solar:graph-up-linear",
	},
];

function statusTone(status: string) {
	if (status === "Paid" || status === "Completed" || status === "Active")
		return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
	if (status === "Overdue" || status === "On Hold") return "bg-orange-500/15 text-orange-700 dark:text-orange-300";
	if (status === "Draft" || status === "Pending") return "bg-violet-500/15 text-violet-700 dark:text-violet-300";
	return "bg-blue-500/15 text-blue-700 dark:text-blue-300";
}

export default function Workbench() {
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

	const invoiceChartOptions = useChart({
		labels: invoiceStatusData.map((item) => item.label),
		colors: invoiceStatusData.map((item) => item.color),
		legend: { show: false },
		stroke: { show: false },
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
				},
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
								<Text variant="caption" className="text-white/80">
									Revenue Collected
								</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">
									₹{currency.format(totalRevenue)}
								</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">
									Open Pipeline
								</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">
									₹{currency.format(totalPipeline)}
								</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">
									Active Freelancers
								</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">
									{activeFreelancers}/{freelancers.length}
								</Title>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
								<Text variant="caption" className="text-white/80">
									Overdue Invoices
								</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold text-white">
									{overdueInvoices}
								</Title>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{
						label: "Total Clients",
						value: clients.length,
						icon: "solar:users-group-rounded-linear",
						tone: "text-cyan-600",
					},
					{
						label: "Active Projects",
						value: activeProjects,
						icon: "solar:folder-open-linear",
						tone: "text-indigo-600",
					},
					{
						label: "Tasks In Progress",
						value: inProgressTasks,
						icon: "solar:checklist-minimalistic-linear",
						tone: "text-blue-600",
					},
					{
						label: "Payments Logged",
						value: payments.length,
						icon: "solar:card-transfer-linear",
						tone: "text-emerald-600",
					},
				].map((item) => (
					<Card key={item.label} className="gap-4 py-4">
						<CardContent className="flex items-center justify-between">
							<div>
								<Text variant="body2" className="text-muted-foreground">
									{item.label}
								</Text>
								<Title as="h3" className="mt-1 text-2xl font-bold">
									{item.value}
								</Title>
							</div>
							<div className="rounded-lg bg-muted p-3">
								<Icon icon={item.icon} size={20} className={item.tone} />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

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
					<CardHeader className="pb-0">
						<CardTitle>Invoice Health</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-2">
						<Chart
							type="donut"
							height={220}
							options={invoiceChartOptions}
							series={invoiceStatusData.map((item) => item.value)}
						/>
						<div className="space-y-2">
							{invoiceStatusData.map((item) => (
								<div key={item.label} className="flex items-center justify-between text-sm">
									<div className="flex items-center gap-2">
										<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
										<span>{item.label}</span>
									</div>
									<span className="font-semibold">{item.value}</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Freelancer Realization</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{topFreelancers.map((freelancer) => {
							const utilization = Math.min(Math.round((freelancer.billableHoursMonth / 160) * 100), 100);
							return (
								<div key={freelancer.id} className="space-y-2 rounded-lg border bg-muted/30 p-3">
									<div className="flex items-center justify-between gap-2">
										<div>
											<Text className="font-medium">{freelancer.name}</Text>
											<Text variant="caption" className="text-muted-foreground">
												{freelancer.activeProjects} active projects
											</Text>
										</div>
										<Badge className={cn("font-medium", statusTone(freelancer.status))}>{freelancer.status}</Badge>
									</div>
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span>{freelancer.billableHoursMonth}h billed</span>
										<span>₹{currency.format(freelancer.realization)}</span>
									</div>
									<Progress value={utilization} />
								</div>
							);
						})}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Task Distribution</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{taskDistribution.map((item) => {
							const total = tasks.length || 1;
							const percentage = Math.round((item.value / total) * 100);
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

				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Live Activity</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						{activityFeed.map((item) => (
							<div key={item.title} className="flex gap-3 rounded-lg border bg-muted/20 p-3">
								<div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
									<Icon icon={item.icon} size={18} />
								</div>
								<div className="min-w-0">
									<Text className="font-medium">{item.title}</Text>
									<Text variant="caption" className="text-muted-foreground">
										{item.detail}
									</Text>
									<Text variant="caption" className="block text-muted-foreground/80">
										{item.time}
									</Text>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle>Recent Invoices</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<table className="w-full min-w-[700px] text-sm">
						<thead>
							<tr className="border-b text-muted-foreground">
								<th className="py-3 text-left font-medium">Invoice</th>
								<th className="py-3 text-left font-medium">Client</th>
								<th className="py-3 text-left font-medium">Project</th>
								<th className="py-3 text-left font-medium">Amount</th>
								<th className="py-3 text-left font-medium">Due Date</th>
								<th className="py-3 text-left font-medium">Status</th>
							</tr>
						</thead>
						<tbody>
							{invoices.map((invoice) => (
								<tr key={invoice.id} className="border-b last:border-b-0">
									<td className="py-3 font-medium">{invoice.id}</td>
									<td className="py-3">{invoice.clientName}</td>
									<td className="py-3">{invoice.projectName}</td>
									<td className="py-3">₹{currency.format(invoice.amount)}</td>
									<td className="py-3">{invoice.dueDate}</td>
									<td className="py-3">
										<Badge className={cn("font-medium", statusTone(invoice.status))}>{invoice.status}</Badge>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</CardContent>
			</Card>
		</div>
	);
}
