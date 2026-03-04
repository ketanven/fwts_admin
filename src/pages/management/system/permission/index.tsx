import { useManagementActions, useManagementRoles } from "@/store/managementStore";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Permission_Old } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";

const MODULE_CATALOG = [
	{ id: "dashboard", name: "Dashboard", route: "/analysis" },
	{ id: "user", name: "User", route: "/management/system/user" },
	{ id: "role", name: "Role", route: "/management/system/role" },
	{ id: "permission", name: "Permission", route: "/management/system/permission" },
	{ id: "admin_staff", name: "Admin Staff", route: "/management/system/admin-staff" },
	{ id: "invoices", name: "Invoices", route: "/admin/invoices" },
	{ id: "reports", name: "Reports", route: "/admin/reports" },
];

const ACTIONS = ["read", "write"] as const;

const toScope = (moduleId: string, action: (typeof ACTIONS)[number]) => `${moduleId}:${action}`;
const toTitle = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function PermissionPage() {
	const roles = useManagementRoles();
	const { assignPermissionsToRole } = useManagementActions();
	const [selectedRoleId, setSelectedRoleId] = useState<string>("");
	const [checkedScopes, setCheckedScopes] = useState<string[]>([]);
	const [saving, setSaving] = useState(false);

	const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
	const enabledRoles = useMemo(() => roles.filter((role) => role.status === BasicStatus.ENABLE), [roles]);

	useEffect(() => {
		if (!selectedRoleId && roles.length > 0) {
			setSelectedRoleId(roles[0].id);
		}
	}, [roles, selectedRoleId]);

	useEffect(() => {
		const scopes = (selectedRole?.permission || [])
			.map((permission) => permission.label)
			.filter((label) => label && label.includes(":")) as string[];
		setCheckedScopes(scopes);
	}, [selectedRole]);

	const toggleScope = (scope: string, checked: boolean) => {
		setCheckedScopes((prev) => (checked ? Array.from(new Set([...prev, scope])) : prev.filter((item) => item !== scope)));
	};

	const selectedCount = checkedScopes.length;

	const handleSave = async () => {
		if (!selectedRoleId) {
			toast.error("Please select role first");
			return;
		}
		setSaving(true);
		try {
			const permissions: Permission_Old[] = checkedScopes.map((scope, index) => {
				const [moduleId, action] = scope.split(":");
				const module = MODULE_CATALOG.find((item) => item.id === moduleId);
				return {
					id: `scope-${moduleId}-${action}`,
					parentId: "",
					name: `${module?.name || moduleId} ${toTitle(action)}`,
					label: scope,
					type: PermissionType.MENU,
					route: module?.route || "/",
					status: BasicStatus.ENABLE,
					order: index + 1,
				};
			});
			assignPermissionsToRole(selectedRoleId, permissions);
			toast.success("Permissions attached to role");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card>
					<CardContent className="pt-6">
						<p className="text-xs uppercase text-muted-foreground">Total Roles</p>
						<p className="text-2xl font-semibold">{roles.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-xs uppercase text-muted-foreground">Enabled Roles</p>
						<p className="text-2xl font-semibold">{enabledRoles.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-xs uppercase text-muted-foreground">Selected Permissions</p>
						<p className="text-2xl font-semibold">{selectedCount}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<div className="text-base font-semibold">Role Permission Matrix</div>
							<p className="text-xs text-muted-foreground">
								Select role, then attach module-level read/write permissions.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
								<SelectTrigger className="w-64">
									<SelectValue placeholder="Select Role" />
								</SelectTrigger>
								<SelectContent>
									{roles.map((role) => (
										<SelectItem key={role.id} value={role.id}>
											{role.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Badge variant={selectedRole?.status === BasicStatus.DISABLE ? "error" : "success"}>
								{selectedRole?.status === BasicStatus.DISABLE ? "Disable" : "Enable"}
							</Badge>
							<Button onClick={handleSave} disabled={!selectedRoleId || saving}>
								Save
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{MODULE_CATALOG.map((module) => (
							<div key={module.id} className="rounded-md border border-border p-3">
								<div className="mb-2 text-sm font-medium">{module.name}</div>
								<div className="flex flex-wrap gap-4">
									{ACTIONS.map((action) => {
										const scope = toScope(module.id, action);
										return (
											<label key={scope} className="flex items-center gap-2 text-sm">
												<Checkbox
													checked={checkedScopes.includes(scope)}
													onCheckedChange={(checked) => toggleScope(scope, Boolean(checked))}
												/>
												<span className="capitalize">{action}</span>
											</label>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
