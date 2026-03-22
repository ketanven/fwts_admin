import { Icon } from "@/components/icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import roleService from "@/api/services/roleService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import Table, { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RoleModal } from "./role-modal";

export interface RoleData {
	id: string;
	name: string;
	permissions_count: number;
	assigned_admins_count: number;
	created_at: string;
}

const DEFAULT_ROLE_VALUE: Partial<RoleData> = {
	name: "",
};

export default function RolePage() {
	const queryClient = useQueryClient();
	const { data: rolesResponse, isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: roleService.listRoles,
	});

	const roles = (rolesResponse as unknown as RoleData[]) || [];

	const createMutation = useMutation({
		mutationFn: roleService.createRole,
		onSuccess: () => {
			toast.success("Role created");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev: any) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to create role");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) => roleService.updateRole(id, data),
		onSuccess: () => {
			toast.success("Role updated");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev: any) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to update role");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: roleService.deleteRole,
		onSuccess: () => {
			toast.success("Role deleted");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setConfirmRole(null);
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to delete role");
		},
	});

	const [query, setQuery] = useState("");
	const [roleModalProps, setRoleModalProps] = useState<any>({
		formValue: { ...DEFAULT_ROLE_VALUE },
		title: "Create Role",
		show: false,
		onOk: async () => {},
		onCancel: () => {
			setRoleModalProps((prev: any) => ({ ...prev, show: false }));
		},
	});
	const [confirmRole, setConfirmRole] = useState<RoleData | null>(null);

	const filteredRoles = useMemo(() => {
		const key = query.trim().toLowerCase();
		if (!key) return roles;
		return roles.filter((role) => {
			return role.name.toLowerCase().includes(key);
		});
	}, [roles, query]);

	const columns: ColumnsType<RoleData> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 240,
		},
		{
			title: "Assigned Admins",
			dataIndex: "assigned_admins_count",
			width: 150,
			align: "center",
		},
		{
			title: "Permissions",
			dataIndex: "permissions_count",
			width: 120,
			align: "center",
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 120,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setConfirmRole(record)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setRoleModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "Create Role",
			formValue: { ...DEFAULT_ROLE_VALUE },
			onOk: async (values: any) => {
				if (!values.name?.trim()) {
					toast.error("Role name is required");
					return;
				}
				createMutation.mutate({ name: values.name.trim() });
			},
		}));
	};

	const onEdit = (formValue: RoleData) => {
		setRoleModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "Edit Role",
			formValue,
			onOk: async (values: any) => {
				if (!values.name?.trim()) {
					toast.error("Role name is required");
					return;
				}
				updateMutation.mutate({ id: formValue.id, data: { name: values.name.trim() } });
			},
		}));
	};

	const onDelete = () => {
		if (!confirmRole) return;
		if (confirmRole.assigned_admins_count > 0) {
			toast.error("Cannot delete role assigned to admin staff");
			setConfirmRole(null);
			return;
		}
		deleteMutation.mutate(confirmRole.id);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="text-base font-semibold">Role Management</div>
					<div className="flex items-center gap-2">
						<Input placeholder="Search role name/code" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-56" />
						<Button onClick={onCreate}>New Role</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={columns} dataSource={filteredRoles} loading={isLoading} />
			</CardContent>
			<RoleModal {...roleModalProps} loading={createMutation.isPending || updateMutation.isPending} />

			<Dialog open={Boolean(confirmRole)} onOpenChange={(open) => !open && setConfirmRole(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Role</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete role <span className="font-medium text-foreground">{confirmRole?.name}</span>?
					</p>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmRole(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={onDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
