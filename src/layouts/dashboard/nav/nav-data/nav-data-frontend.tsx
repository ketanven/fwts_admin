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
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
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
				children: [
					{
						title: "sys.nav.invoices_global",
						path: "/admin/invoices",
					},
					{
						title: "sys.nav.reports_admin",
						path: "/admin/reports",
					},
				],
			},
			// management
			{
				title: "sys.nav.management",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				children: [
					{
						title: "sys.nav.system.user",
						path: "/management/system/user",
					},
					{
						title: "sys.nav.system.role",
						path: "/management/system/role",
					},
					{
						title: "sys.nav.system.permission",
						path: "/management/system/permission",
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
			},
		],
	},
];
