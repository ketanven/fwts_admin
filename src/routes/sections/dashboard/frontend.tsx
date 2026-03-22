import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";
import { AuthGuard } from "@/components/auth/auth-guard";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ path: "workbench", element: <AuthGuard check="dashboard_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/dashboard/workbench")}</AuthGuard> },
		{ path: "analysis", element: <AuthGuard check="dashboard_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/dashboard/analysis")}</AuthGuard> },
		{
			path: "admin",
			children: [
				{ index: true, element: <Navigate to="invoices" replace /> },
				{ path: "invoices", element: <AuthGuard check="invoices_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/admin/invoices")}</AuthGuard> },
				{ path: "reports", element: <AuthGuard check="reports_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/admin/reports")}</AuthGuard> },
			],
		},
		{
			path: "management",
			children: [
				{ index: true, element: <Navigate to="user" replace /> },
				{
					path: "user",
					children: [
						{ index: true, element: <Navigate to="profile" replace /> },
						{ path: "profile", element: Component("/pages/management/user/profile") },
						{ path: "account", element: Component("/pages/management/user/account") },
					],
				},
				{
					path: "system",
					children: [
						{ index: true, element: <Navigate to="permission" replace /> },
						{ path: "permission", element: <AuthGuard check="permission_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/permission")}</AuthGuard> },
						{ path: "role", element: <AuthGuard check="role_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/role")}</AuthGuard> },
						{ path: "admin-staff", element: <AuthGuard check="admin_staff_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/admin-staff")}</AuthGuard> },
						{ path: "user", element: <AuthGuard check="user_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/user")}</AuthGuard> },
						{ path: "user/:id", element: <AuthGuard check="user_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/user/detail")}</AuthGuard> },
						{ path: "user/:id/workspace", element: <AuthGuard check="user_read" fallback={<Navigate to="/error/403" replace />}>{Component("/pages/management/system/user/workspace")}</AuthGuard> },
					],
				},
			],
		},
		{
			path: "error",
			children: [
				{ index: true, element: <Navigate to="403" replace /> },
				{ path: "403", element: Component("/pages/sys/error/Page403") },
				{ path: "404", element: Component("/pages/sys/error/Page404") },
				{ path: "500", element: Component("/pages/sys/error/Page500") },
			],
		},
		{ path: "calendar", element: Component("/pages/sys/others/calendar") },
		{ path: "blank", element: Component("/pages/sys/others/blank") },
	];
	return frontendDashboardRoutes;
}
