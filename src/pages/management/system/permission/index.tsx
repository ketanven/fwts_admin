import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import roleService from "@/api/services/roleService";
import permissionService from "@/api/services/permissionService";
import type { RoleData } from "../role";

export default function PermissionPage() {
	const queryClient = useQueryClient();

	const { data: rolesResp } = useQuery({ queryKey: ["roles"], queryFn: roleService.listRoles });
	const { data: permsResp } = useQuery({ queryKey: ["permissions"], queryFn: permissionService.getPermissions });

	const roles = (rolesResp as unknown as RoleData[]) || [];
	const permissionGroups = (permsResp as unknown as any[]) || [];

	const [selectedRoleId, setSelectedRoleId] = useState<string>("");
	const [checkedScopes, setCheckedScopes] = useState<string[]>([]);
	const [saving, setSaving] = useState(false);

	// Fetch detailed role permissions when a role is selected
	const { data: roleDetailResp, isFetching: detailLoading } = useQuery({
		queryKey: ["roleDetail", selectedRoleId],
		queryFn: () => roleService.getRole(selectedRoleId),
		enabled: !!selectedRoleId,
	});

	useEffect(() => {
		if (!selectedRoleId && roles.length > 0) {
			setSelectedRoleId(roles[0].id);
		}
	}, [roles, selectedRoleId]);

	useEffect(() => {
		if ((roleDetailResp as any)?.permissions) {
			setCheckedScopes((roleDetailResp as any).permissions);
		} else {
			setCheckedScopes([]);
		}
	}, [roleDetailResp]);

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
			await roleService.assignPermissions(selectedRoleId, { permission_codes: checkedScopes });
			queryClient.invalidateQueries({ queryKey: ["roleDetail", selectedRoleId] });
			queryClient.invalidateQueries({ queryKey: ["roles"] }); // update counts if needed
			toast.success("Permissions attached to role");
		} catch (error: any) {
			toast.error(error?.message || "Failed to save permissions");
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
						<p className="text-xs uppercase text-muted-foreground">Total Permissions Available</p>
						<p className="text-2xl font-semibold">
							{permissionGroups.reduce((acc, group) => acc + (group.permissions?.length || 0), 0)}
						</p>
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
							<Badge variant="success">
								Enable
							</Badge>
							<Button onClick={handleSave} disabled={!selectedRoleId || saving}>
								Save
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{permissionGroups.map((group: any) => (
							<div key={group.group_name} className="rounded-md border border-border p-3">
								<div className="mb-2 text-sm font-medium">{group.group_name}</div>
								<div className="flex flex-wrap gap-4">
									{group.permissions?.map((perm: any) => {
										return (
											<label key={perm.code} className="flex items-center gap-2 text-sm">
												<Checkbox
													disabled={detailLoading || saving}
													checked={checkedScopes.includes(perm.code)}
													onCheckedChange={(checked) => toggleScope(perm.code, Boolean(checked))}
												/>
												<span className="capitalize">{perm.name}</span>
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
