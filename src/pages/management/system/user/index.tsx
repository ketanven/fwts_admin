// import { USER_LIST } from "@/_mock/assets";
import adminUserService, { type AdminUser } from "@/api/services/adminUserService";
import { Icon } from "@/components/icon";
import UserAvatar from "@/components/user-avatar";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BasicStatus } from "#/enum";
import UserModal, { type UserFormValues, type UserModalProps } from "./user-modal";

type UserListResponse =
	| AdminUser[]
	| {
			results?: AdminUser[];
			count?: number;
			total?: number;
	  };

const DEFAULT_FORM_VALUE: UserFormValues = {
	email: "",
	first_name: "",
	last_name: "",
	password: "",
	status: BasicStatus.ENABLE,
};

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [modalProps, setModalProps] = useState<UserModalProps>({
		formValue: { ...DEFAULT_FORM_VALUE },
		title: "New User",
		show: false,
		onOk: async () => {},
		onCancel: () => {
			setModalProps((prev) => ({ ...prev, show: false }));
		},
	});
	const [confirmTarget, setConfirmTarget] = useState<AdminUser | null>(null);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [searchInput, setSearchInput] = useState("");
	const [statusInput, setStatusInput] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [total, setTotal] = useState(0);

	const normalizedUsers = useMemo(() => {
		return users.map((user) => {
			const status =
				typeof user.status === "number"
					? user.status
					: user.is_active === undefined
						? BasicStatus.ENABLE
						: user.is_active
							? BasicStatus.ENABLE
							: BasicStatus.DISABLE;
			return { ...user, status };
		});
	}, [users]);

	const fetchUsers = useCallback(
		async (options?: { page?: number; pageSize?: number }) => {
			setLoading(true);
			try {
				const currentPage = options?.page ?? page;
				const currentPageSize = options?.pageSize ?? pageSize;
				const params: Record<string, string | number | undefined> = {
					search: search.trim() || undefined,
					status: statusFilter === "all" ? undefined : statusFilter,
					page: currentPage,
					page_size: currentPageSize,
				};
				const res = (await adminUserService.list(params)) as UserListResponse;
				const list = Array.isArray(res) ? res : res.results || [];
				const count = Array.isArray(res) ? res.length : res.count ?? res.total ?? list.length;
				setUsers(list);
				setTotal(count);
			} finally {
				setLoading(false);
			}
		},
		[page, pageSize, search, statusFilter],
	);

	useEffect(() => {
		fetchUsers({ page, pageSize });
	}, [fetchUsers, page, pageSize, search, statusFilter]);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setSearch(searchInput);
			setPage(1);
		}, 400);
		return () => window.clearTimeout(timeoutId);
	}, [searchInput]);

	const columns: ColumnsType<AdminUser> = [
		{
			title: "Name",
			dataIndex: "first_name",
			width: 300,
			render: (_, record) => {
				const fullName = [record.first_name, record.last_name].filter(Boolean).join(" ").trim() || "-";
				return (
					<div className="flex">
						<UserAvatar src={record.avatar} name={fullName} email={record.email} size={40} />
						<div className="ml-2 flex flex-col">
							<span className="text-sm">{fullName}</span>
							<span className="text-xs text-text-secondary">{record.email || "-"}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status) => <Badge variant={status === BasicStatus.DISABLE ? "error" : "success"}>{status === BasicStatus.DISABLE ? "Disable" : "Enable"}</Badge>,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 220,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
					>
						<Icon icon="mdi:card-account-details" size={18} />
					</Button>
					<Button size="sm" variant="outline" onClick={() => push(`${pathname}/${record.id}/workspace`)}>
						Workspace
					</Button>
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => setConfirmTarget(record)}>
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create User",
			formValue: { ...DEFAULT_FORM_VALUE },
			onOk: async (values) => {
				setSaving(true);
				try {
					const payload = toPayload(values);
					await adminUserService.create(payload);
					toast.success("User created");
					setPage(1);
					setModalProps((current) => ({ ...current, show: false }));
					await fetchUsers({ page: 1, pageSize });
					return;
				} catch (error: any) {
					const fieldErrors = extractFieldErrors(error);
					if (fieldErrors) {
						return { fieldErrors };
					}
					toast.error("Failed to create user");
					return;
				} finally {
					setSaving(false);
				}
			},
		}));
	};

	const onEdit = (user: AdminUser) => {
		const statusValue =
			typeof user.status === "number"
				? user.status
				: user.is_active === undefined
					? BasicStatus.ENABLE
					: user.is_active
						? BasicStatus.ENABLE
						: BasicStatus.DISABLE;
		setModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit User",
				formValue: {
					id: user.id,
					email: user.email || "",
					first_name: user.first_name || "",
					last_name: user.last_name || "",
					password: "",
				status: statusValue,
			},
			onOk: async (values) => {
				setSaving(true);
				try {
					const payload = toPayload(values);
					await adminUserService.update(user.id, payload);
					toast.success("User updated");
					setModalProps((current) => ({ ...current, show: false }));
					await fetchUsers();
					return;
				} catch (error: any) {
					const fieldErrors = extractFieldErrors(error);
					if (fieldErrors) {
						return { fieldErrors };
					}
					toast.error("Failed to update user");
					return;
				} finally {
					setSaving(false);
				}
			},
		}));
	};

	const onDelete = async () => {
		if (!confirmTarget) return;
		setConfirmLoading(true);
		try {
			await adminUserService.remove(confirmTarget.id);
			toast.success("User deleted");
			setConfirmTarget(null);
			await fetchUsers();
		} finally {
			setConfirmLoading(false);
		}
	};

	const applyFilters = () => {
		setSearch(searchInput);
		setStatusFilter(statusInput);
		setPage(1);
	};

	const resetFilters = () => {
		setSearchInput("");
		setStatusInput("all");
		setSearch("");
		setStatusFilter("all");
		setPage(1);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>User List</div>
					<div className="flex flex-wrap items-center gap-2">
						<Input
							placeholder="Search by name or email"
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							className="h-9 w-56"
						/>
						<Select value={statusInput} onValueChange={setStatusInput}>
							<SelectTrigger className="h-9 w-36">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value={String(BasicStatus.ENABLE)}>Enable</SelectItem>
								<SelectItem value={String(BasicStatus.DISABLE)}>Disable</SelectItem>
							</SelectContent>
						</Select>
						<Button variant="outline" onClick={applyFilters}>
							Filter
						</Button>
						<Button variant="ghost" onClick={resetFilters}>
							Reset
						</Button>
						<Button onClick={onCreate}>New</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					loading={loading}
					pagination={{
						current: page,
						pageSize,
						total,
						showSizeChanger: true,
					}}
					onChange={(pagination) => {
						const nextPage = pagination.current ?? 1;
						const nextSize = pagination.pageSize ?? pageSize;
						setPage(nextPage);
						setPageSize(nextSize);
						fetchUsers({ page: nextPage, pageSize: nextSize });
					}}
					columns={columns}
					dataSource={normalizedUsers}
				/>
			</CardContent>
			<UserModal {...modalProps} loading={saving} />
			<Dialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete User</DialogTitle>
					</DialogHeader>
					<div className="text-sm text-muted-foreground">
						Are you sure you want to delete {confirmTarget?.email}? This action cannot be undone.
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setConfirmTarget(null)} disabled={confirmLoading}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={onDelete} disabled={confirmLoading}>
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}

const toPayload = (values: UserFormValues) => {
	const payload: Record<string, unknown> = {
		email: values.email,
		first_name: values.first_name || "",
		last_name: values.last_name || "",
		status: values.status,
		is_active: values.status === BasicStatus.ENABLE,
	};
	if (values.password) {
		payload.password = values.password;
	}
	return payload as any;
};

const extractFieldErrors = (error: any): Record<string, string[]> | null => {
	const data = error?.response?.data;
	if (!data || typeof data !== "object") return null;
	if ("data" in data && typeof data.data === "object" && data.data) {
		return data.data as Record<string, string[]>;
	}
	return data as Record<string, string[]>;
};
