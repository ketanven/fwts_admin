import { Icon } from "@/components/icon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminStaffService from "@/api/services/adminStaffService";
import roleService from "@/api/services/roleService";
import type { RoleData } from "../role";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BasicStatus } from "#/enum";
import AdminStaffModal, { type AdminStaffFormValues, type AdminStaffModalProps } from "./admin-staff-modal";

export interface AdminStaffData {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	is_active: boolean;
	role?: { id: string; name: string };
	created_at: string;
	phone?: string;
	last_login?: string;
}

const DEFAULT_FORM_VALUE: AdminStaffFormValues = {
	first_name: "",
	last_name: "",
	email: "",
	password: "",
	confirmPassword: "",
	phone: "",
	role_id: "",
	status: BasicStatus.ENABLE,
};

export default function AdminStaffPage() {
	const queryClient = useQueryClient();

	const { data: rolesResp } = useQuery({ queryKey: ["roles"], queryFn: roleService.listRoles });
	const { data: staffResp, isLoading } = useQuery({ queryKey: ["staff"], queryFn: adminStaffService.listStaff });

	const roles = (rolesResp as unknown as RoleData[]) || [];
	const adminStaff = (staffResp as unknown as AdminStaffData[]) || [];

	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [modalProps, setModalProps] = useState<AdminStaffModalProps>({
		title: "Create Admin Staff",
		show: false,
		formValue: { ...DEFAULT_FORM_VALUE },
		roles: [],
		onOk: async () => {},
		onCancel: () => {
			setModalProps((prev: any) => ({ ...prev, show: false }));
		},
	});
	const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

	const createMutation = useMutation({
		mutationFn: adminStaffService.createStaff,
		onSuccess: () => {
			toast.success("Admin staff created");
			queryClient.invalidateQueries({ queryKey: ["staff"] });
			setModalProps((prev: any) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to create staff");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) => adminStaffService.updateStaff(id, data),
		onSuccess: () => {
			toast.success("Admin staff updated");
			queryClient.invalidateQueries({ queryKey: ["staff"] });
			setModalProps((prev: any) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to update staff");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: adminStaffService.deleteStaff,
		onSuccess: () => {
			toast.success("Admin staff removed");
			queryClient.invalidateQueries({ queryKey: ["staff"] });
			setConfirmTarget(null);
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to remove staff");
		},
	});

	const roleOptions = useMemo(
		() => roles.map((role) => ({ id: role.id, name: role.name, status: BasicStatus.ENABLE })),
		[roles],
	);

	const filteredData = useMemo(() => {
		const key = query.trim().toLowerCase();
		return adminStaff.filter((member) => {
			const roleName = member.role?.name || "";
			const matchesSearch =
				!key ||
				`${member.first_name} ${member.last_name}`.toLowerCase().includes(key) ||
				member.email.toLowerCase().includes(key) ||
				roleName.toLowerCase().includes(key);
			const matchesRole = roleFilter === "all" || member.role?.id === roleFilter;
			const memberStatus = member.is_active ? String(BasicStatus.ENABLE) : String(BasicStatus.DISABLE);
			const matchesStatus = statusFilter === "all" || memberStatus === statusFilter;
			return matchesSearch && matchesRole && matchesStatus;
		});
	}, [adminStaff, query, roleFilter, statusFilter]);

	const enabledRolesCount = roles.length;
	const activeAdminsCount = adminStaff.filter((member) => member.is_active).length;

	const columns: ColumnsType<(typeof filteredData)[number]> = [
		{
			title: "Admin Staff",
			dataIndex: "first_name",
			width: 260,
			render: (_, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{record.first_name} {record.last_name}</span>
					<span className="text-xs text-muted-foreground">{record.email}</span>
				</div>
			),
		},
		{
			title: "Role",
			key: "role",
			width: 180,
			render: (_, record) => record.role?.name || "-",
		},
		{
			title: "Phone",
			dataIndex: "phone",
			width: 160,
			render: (phone?: string) => phone || "-",
		},
		{
			title: "Last Login",
			dataIndex: "last_login",
			width: 150,
			render: (lastLogin?: string) => lastLogin || "-",
		},
		{
			title: "Status",
			dataIndex: "is_active",
			width: 120,
			align: "center",
			render: (isActive: boolean) => (
				<Badge variant={!isActive ? "error" : "success"}>
					{!isActive ? "Disable" : "Enable"}
				</Badge>
			),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 130,
			render: (_, record) => (
				<div className="flex w-full justify-center">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record.id)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setConfirmTarget(record.id)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const hasDuplicateEmail = (email: string, currentId?: string) => {
		return adminStaff.some((member) => member.email.toLowerCase() === email.toLowerCase() && member.id !== currentId);
	};

	const openCreateModal = () => {
		if (!roleOptions.length) {
			toast.error("Please create at least one role first");
			return;
		}
		setModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "Create Admin Staff",
			formValue: { ...DEFAULT_FORM_VALUE, role_id: roleOptions[0].id },
			roles: roleOptions,
			onOk: async (values: any) => {
				if (hasDuplicateEmail(values.email)) {
					return { fieldErrors: { email: ["Email already exists"] } };
				}
				const { password, confirmPassword, ...restValues } = values;
				createMutation.mutate({
					...restValues,
					first_name: restValues.first_name.trim(),
					last_name: restValues.last_name.trim(),
					email: restValues.email.trim().toLowerCase(),
					password,
					role: restValues.role_id,
					is_active: restValues.status === BasicStatus.ENABLE,
				});
			},
		}));
	};

	const onEdit = (id: string) => {
		const target = adminStaff.find((member) => member.id === id);
		if (!target) return;
		setModalProps((prev: any) => ({
			...prev,
			show: true,
			title: "Edit Admin Staff",
			formValue: {
				id: target.id,
				first_name: target.first_name,
				last_name: target.last_name,
				email: target.email,
				phone: target.phone || "",
				role_id: target.role?.id || "",
				status: target.is_active ? BasicStatus.ENABLE : BasicStatus.DISABLE,
			},
			roles: roleOptions,
			onOk: async (values: any) => {
				if (hasDuplicateEmail(values.email, id)) {
					return { fieldErrors: { email: ["Email already exists"] } };
				}
				const { password, confirmPassword, ...restValues } = values;
				
				const payload: any = {
					first_name: restValues.first_name.trim(),
					last_name: restValues.last_name.trim(),
					email: restValues.email.trim().toLowerCase(),
					role: restValues.role_id,
					is_active: restValues.status === BasicStatus.ENABLE,
				};
				if (password) {
					payload.password = password;
				}

				updateMutation.mutate({
					id,
					data: payload,
				});
			},
		}));
	};

	const onDelete = () => {
		if (!confirmTarget) return;
		deleteMutation.mutate(confirmTarget);
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
						<p className="text-2xl font-semibold">{enabledRolesCount}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-6">
						<p className="text-xs uppercase text-muted-foreground">Active Admin Staff</p>
						<p className="text-2xl font-semibold">{activeAdminsCount}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<div className="text-base font-semibold">Admin Staff Management</div>
							<p className="text-xs text-muted-foreground">Master can create and manage sub-admins with role mapping.</p>
						</div>
						<Button onClick={openCreateModal}>Add Admin Staff</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="mb-4 flex flex-wrap items-center gap-2">
						<Input
							placeholder="Search by name/email/role"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							className="h-9 w-64"
						/>
						<Select value={roleFilter} onValueChange={setRoleFilter}>
							<SelectTrigger className="h-9 w-44">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								{roles.map((role) => (
									<SelectItem key={role.id} value={role.id}>
										{role.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="h-9 w-40">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value={String(BasicStatus.ENABLE)}>Enable</SelectItem>
								<SelectItem value={String(BasicStatus.DISABLE)}>Disable</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="ghost"
							onClick={() => {
								setQuery("");
								setRoleFilter("all");
								setStatusFilter("all");
							}}
						>
							Reset
						</Button>
					</div>
					<Table rowKey="id" size="small" scroll={{ x: "max-content" }} pagination={{ pageSize: 8 }} columns={columns} dataSource={filteredData} loading={isLoading} />
				</CardContent>
			</Card>

			<AdminStaffModal {...modalProps} loading={createMutation.isPending || updateMutation.isPending} />

			<Dialog open={Boolean(confirmTarget)} onOpenChange={(open) => !open && setConfirmTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Admin Staff</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">Are you sure you want to remove this admin staff member?</p>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmTarget(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={onDelete}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
