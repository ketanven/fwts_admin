import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Permission_Old, Role_Old } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";

export type AdminStaffMember = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	role_id: string;
	status: BasicStatus;
	last_login?: string;
	created_at: string;
	created_by: string;
};

type ManagementStore = {
	roles: Role_Old[];
	adminStaff: AdminStaffMember[];
	actions: {
		createRole: (payload: Role_Old) => void;
		updateRole: (id: string, payload: Role_Old) => void;
		removeRole: (id: string) => void;
		assignPermissionsToRole: (roleId: string, permissions: Permission_Old[]) => void;
		createRolePermission: (roleId: string, permission: Permission_Old) => void;
		updateRolePermission: (roleId: string, permissionId: string, permission: Permission_Old) => void;
		removeRolePermission: (roleId: string, permissionId: string) => void;
		createAdminStaff: (payload: Omit<AdminStaffMember, "id" | "created_at">) => void;
		updateAdminStaff: (id: string, payload: Omit<AdminStaffMember, "id" | "created_at">) => void;
		removeAdminStaff: (id: string) => void;
	};
};

const INITIAL_ROLES: Role_Old[] = [
	{
		id: "role-master-admin",
		name: "Master Admin",
		code: "MASTER_ADMIN",
		status: BasicStatus.ENABLE,
		order: 1,
		desc: "Full system control with user and role governance.",
		permission: [
			{
				id: "scope-dashboard-read",
				parentId: "",
				name: "Dashboard Read",
				label: "dashboard:read",
				type: PermissionType.MENU,
				route: "/analysis",
				status: BasicStatus.ENABLE,
				order: 1,
			},
			{
				id: "scope-dashboard-write",
				parentId: "",
				name: "Dashboard Write",
				label: "dashboard:write",
				type: PermissionType.MENU,
				route: "/analysis",
				status: BasicStatus.ENABLE,
				order: 2,
			},
			{
				id: "scope-admin_staff-read",
				parentId: "",
				name: "Admin Staff Read",
				label: "admin_staff:read",
				type: PermissionType.MENU,
				route: "/management/system/admin-staff",
				status: BasicStatus.ENABLE,
				order: 3,
			},
			{
				id: "scope-admin_staff-write",
				parentId: "",
				name: "Admin Staff Write",
				label: "admin_staff:write",
				type: PermissionType.MENU,
				route: "/management/system/admin-staff",
				status: BasicStatus.ENABLE,
				order: 4,
			},
		],
	},
	{
		id: "role-ops-admin",
		name: "Operations Admin",
		code: "OPS_ADMIN",
		status: BasicStatus.ENABLE,
		order: 2,
		desc: "Manages day-to-day operations and workforce data.",
		permission: [
			{
				id: "scope-user-read",
				parentId: "",
				name: "User Read",
				label: "user:read",
				type: PermissionType.MENU,
				route: "/management/system/user",
				status: BasicStatus.ENABLE,
				order: 1,
			},
			{
				id: "scope-user-write",
				parentId: "",
				name: "User Write",
				label: "user:write",
				type: PermissionType.MENU,
				route: "/management/system/user",
				status: BasicStatus.ENABLE,
				order: 2,
			},
			{
				id: "scope-role-read",
				parentId: "",
				name: "Role Read",
				label: "role:read",
				type: PermissionType.MENU,
				route: "/management/system/role",
				status: BasicStatus.ENABLE,
				order: 3,
			},
		],
	},
	{
		id: "role-finance-admin",
		name: "Finance Admin",
		code: "FINANCE_ADMIN",
		status: BasicStatus.ENABLE,
		order: 3,
		desc: "Access to invoices, settlements and billing controls.",
		permission: [
			{
				id: "scope-invoices-read",
				parentId: "",
				name: "Invoices Read",
				label: "invoices:read",
				type: PermissionType.MENU,
				route: "/admin/invoices",
				status: BasicStatus.ENABLE,
				order: 1,
			},
			{
				id: "scope-invoices-write",
				parentId: "",
				name: "Invoices Write",
				label: "invoices:write",
				type: PermissionType.MENU,
				route: "/admin/invoices",
				status: BasicStatus.ENABLE,
				order: 2,
			},
			{
				id: "scope-reports-read",
				parentId: "",
				name: "Reports Read",
				label: "reports:read",
				type: PermissionType.MENU,
				route: "/admin/reports",
				status: BasicStatus.ENABLE,
				order: 3,
			},
		],
	},
];

const INITIAL_STAFF: AdminStaffMember[] = [
	{
		id: "staff-1001",
		first_name: "Arjun",
		last_name: "Patel",
		email: "arjun.patel@fwtsadmin.com",
		phone: "+91 98765 10011",
		role_id: "role-ops-admin",
		status: BasicStatus.ENABLE,
		last_login: "2026-03-04 10:42",
		created_at: "2026-01-11 08:10",
		created_by: "Master Admin",
	},
	{
		id: "staff-1002",
		first_name: "Meera",
		last_name: "Nair",
		email: "meera.nair@fwtsadmin.com",
		phone: "+91 98765 10012",
		role_id: "role-finance-admin",
		status: BasicStatus.ENABLE,
		last_login: "2026-03-03 19:15",
		created_at: "2026-01-19 10:25",
		created_by: "Master Admin",
	},
	{
		id: "staff-1003",
		first_name: "Rohan",
		last_name: "Sinha",
		email: "rohan.sinha@fwtsadmin.com",
		phone: "+91 98765 10013",
		role_id: "role-ops-admin",
		status: BasicStatus.DISABLE,
		last_login: "2026-02-22 13:03",
		created_at: "2026-02-05 16:48",
		created_by: "Master Admin",
	},
];

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const useManagementStore = create<ManagementStore>()(
	persist(
		(set) => ({
			roles: INITIAL_ROLES,
			adminStaff: INITIAL_STAFF,
			actions: {
				createRole: (payload) =>
					set((state) => ({
						roles: [
							...state.roles,
							{
								...payload,
								id: payload.id || createId("role"),
								permission: payload.permission || [],
							},
						],
					})),
				updateRole: (id, payload) =>
					set((state) => ({
						roles: state.roles.map((role) =>
							role.id === id
								? {
										...payload,
										id,
										permission: payload.permission || [],
									}
								: role,
						),
					})),
				removeRole: (id) =>
					set((state) => ({
						roles: state.roles.filter((role) => role.id !== id),
					})),
				assignPermissionsToRole: (roleId, permissions) =>
					set((state) => ({
						roles: state.roles.map((role) =>
							role.id === roleId
								? {
										...role,
										permission: permissions,
									}
								: role,
						),
					})),
				createRolePermission: (roleId, permission) =>
					set((state) => ({
						roles: state.roles.map((role) =>
							role.id === roleId
								? {
										...role,
										permission: [...(role.permission || []), { ...permission, id: permission.id || createId("perm") }],
									}
								: role,
						),
					})),
				updateRolePermission: (roleId, permissionId, permission) =>
					set((state) => ({
						roles: state.roles.map((role) =>
							role.id === roleId
								? {
										...role,
										permission: (role.permission || []).map((item) => (item.id === permissionId ? { ...permission, id: permissionId } : item)),
									}
								: role,
						),
					})),
				removeRolePermission: (roleId, permissionId) =>
					set((state) => ({
						roles: state.roles.map((role) =>
							role.id === roleId
								? {
										...role,
										permission: (role.permission || []).filter((item) => item.id !== permissionId),
									}
								: role,
						),
					})),
				createAdminStaff: (payload) =>
					set((state) => ({
						adminStaff: [
							...state.adminStaff,
							{
								...payload,
								id: createId("staff"),
								created_at: new Date().toISOString().slice(0, 16).replace("T", " "),
							},
						],
					})),
				updateAdminStaff: (id, payload) =>
					set((state) => ({
						adminStaff: state.adminStaff.map((member) =>
							member.id === id
								? {
										...member,
										...payload,
										id,
									}
								: member,
						),
					})),
				removeAdminStaff: (id) =>
					set((state) => ({
						adminStaff: state.adminStaff.filter((member) => member.id !== id),
					})),
			},
		}),
		{
			name: "managementStore",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

export const useManagementRoles = () => useManagementStore((state) => state.roles);
export const useManagementAdminStaff = () => useManagementStore((state) => state.adminStaff);
export const useManagementActions = () => useManagementStore((state) => state.actions);

export default useManagementStore;
