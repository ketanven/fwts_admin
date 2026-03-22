import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
import { Badge } from "@/ui/badge";

export const frontendNavData: NavProps["data"] = [
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.workbench",
				path: "/workbench",
				icon: <Icon icon="local:ic-workbench" size="24" />,
				auth: ["dashboard_read"],
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
				auth: ["dashboard_read"],
			},
		],
	},
	{
		name: "sys.nav.pages",
		items: [
			{
				title: "sys.nav.admin_suite",
				path: "/admin",
				icon: <Icon icon="solar:buildings-bold-duotone" size="24" />,
				auth: ["invoices_read", "reports_read"],
				children: [
					{
						title: "sys.nav.invoices_global",
						path: "/admin/invoices",
						auth: ["invoices_read"],
					},
					{
						title: "sys.nav.reports_admin",
						path: "/admin/reports",
						auth: ["reports_read"],
					},
				],
			},
			// management
			{
				title: "sys.nav.management",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				auth: ["user_read", "role_read", "permission_read", "admin_staff_read"],
				children: [
					{
						title: "sys.nav.system.user",
						path: "/management/system/user",
						auth: ["user_read"],
					},
					{
						title: "sys.nav.system.role",
						path: "/management/system/role",
						auth: ["role_read"],
					},
					{
						title: "sys.nav.system.permission",
						path: "/management/system/permission",
						auth: ["permission_read"],
					},
					{
						title: "sys.nav.system.admin_staff",
						path: "/management/system/admin-staff",
						auth: ["admin_staff_read"],
					},
				],
			},
			// menulevel
			// errors
			// {
			// 	title: "sys.nav.error.index",
			// 	path: "/error",
			// 	icon: <Icon icon="bxs:error-alt" size="24" />,
			// 	children: [
			// 		{
			// 			title: "sys.nav.error.403",
			// 			path: "/error/403",
			// 		},
			// 		{
			// 			title: "sys.nav.error.404",
			// 			path: "/error/404",
			// 		},
			// 		{
			// 			title: "sys.nav.error.500",
			// 			path: "/error/500",
			// 		},
			// 	],
			// },
		],
	},
	{
		name: "sys.nav.others",
		items: [
			{
				title: "sys.nav.calendar",
				path: "/calendar",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				info: <Badge variant="warning">+12</Badge>,
				auth: ["calendar_read"],
			},
		],
	},
];
