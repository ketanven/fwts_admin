import { Icon } from "@/components/icon";
import { useManagementActions, useManagementAdminStaff, useManagementRoles } from "@/store/managementStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import Table, { type ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Role_Old } from "#/entity";
import { BasicStatus } from "#/enum";
import { RoleModal, type RoleModalProps } from "./role-modal";

const DEFAULT_ROLE_VALUE: Role_Old = {
	id: "",
	name: "",
	code: "",
	status: BasicStatus.ENABLE,
	permission: [],
};

export default function RolePage() {
	const roles = useManagementRoles();
	const adminStaff = useManagementAdminStaff();
	const { createRole, updateRole, removeRole } = useManagementActions();

	const [saving, setSaving] = useState(false);
	const [query, setQuery] = useState("");
	const [roleModalProps, setRoleModalProps] = useState<RoleModalProps>({
		formValue: { ...DEFAULT_ROLE_VALUE },
		title: "Create Role",
		show: false,
		onOk: async () => {},
		onCancel: () => {
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
	});
	const [confirmRole, setConfirmRole] = useState<Role_Old | null>(null);

	const filteredRoles = useMemo(() => {
		const key = query.trim().toLowerCase();
		if (!key) return roles;
		return roles.filter((role) => {
			return role.name.toLowerCase().includes(key) || role.code.toLowerCase().includes(key) || (role.desc || "").toLowerCase().includes(key);
		});
	}, [roles, query]);

	const columns: ColumnsType<Role_Old> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 240,
		},
		{
			title: "Assigned Admins",
			key: "assigned",
			width: 150,
			align: "center",
			render: (_, record) => adminStaff.filter((member) => member.role_id === record.id).length,
		},
		{
			title: "Permissions",
			key: "permissions",
			width: 120,
			align: "center",
			render: (_, record) => record.permission?.length || 0,
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

	const hasDuplicateCode = (code: string, currentId?: string) => {
		return roles.some((role) => role.code.toLowerCase() === code.toLowerCase() && role.id !== currentId);
	};

	const makeCode = (name: string) =>
		name
			.trim()
			.toUpperCase()
			.replace(/[^A-Z0-9]+/g, "_")
			.replace(/^_+|_+$/g, "");

	const onCreate = () => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create Role",
			formValue: { ...DEFAULT_ROLE_VALUE },
			onOk: async (values) => {
				const cleanCode = makeCode(values.name);
				if (!cleanCode) {
					toast.error("Role name is required");
					return;
				}
				if (hasDuplicateCode(cleanCode)) {
					toast.error("Role code already exists");
					return;
				}
				setSaving(true);
				try {
					createRole({
						...values,
						id: "",
						code: cleanCode,
						name: values.name.trim(),
						status: BasicStatus.ENABLE,
					});
					setRoleModalProps((current) => ({ ...current, show: false }));
					toast.success("Role created");
				} finally {
					setSaving(false);
				}
			},
		}));
	};

	const onEdit = (formValue: Role_Old) => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit Role",
			formValue,
			onOk: async (values) => {
				const cleanCode = makeCode(values.name);
				if (!cleanCode) {
					toast.error("Role name is required");
					return;
				}
				if (hasDuplicateCode(cleanCode, formValue.id)) {
					toast.error("Role code already exists");
					return;
				}
				setSaving(true);
				try {
					updateRole(formValue.id, {
						...values,
						id: formValue.id,
						code: cleanCode,
						name: values.name.trim(),
						status: formValue.status ?? BasicStatus.ENABLE,
					});
					setRoleModalProps((current) => ({ ...current, show: false }));
					toast.success("Role updated");
				} finally {
					setSaving(false);
				}
			},
		}));
	};

	const onDelete = () => {
		if (!confirmRole) return;
		const assignedCount = adminStaff.filter((member) => member.role_id === confirmRole.id).length;
		if (assignedCount > 0) {
			toast.error("Cannot delete role assigned to admin staff");
			return;
		}
		removeRole(confirmRole.id);
		toast.success("Role deleted");
		setConfirmRole(null);
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
				<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={false} columns={columns} dataSource={filteredRoles} />
			</CardContent>
			<RoleModal {...roleModalProps} loading={saving} />

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
