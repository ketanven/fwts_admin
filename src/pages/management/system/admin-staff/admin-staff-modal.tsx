import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import type { BasicStatus } from "#/enum";
import { BasicStatus as BasicStatusEnum } from "#/enum";

export type AdminStaffFormValues = {
	id?: string;
	first_name: string;
	last_name: string;
	email: string;
	phone?: string;
	role_id: string;
	status: BasicStatus;
};

export type RoleOption = {
	id: string;
	name: string;
	status: BasicStatus;
};

export type AdminStaffModalProps = {
	title: string;
	show: boolean;
	loading?: boolean;
	formValue: AdminStaffFormValues;
	roles: RoleOption[];
	onOk: (values: AdminStaffFormValues) => void | Promise<void | { fieldErrors?: Record<string, string[]> }>;
	onCancel: VoidFunction;
};

export default function AdminStaffModal({ title, show, loading, formValue, roles, onOk, onCancel }: AdminStaffModalProps) {
	const form = useForm<AdminStaffFormValues>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
		form.clearErrors();
	}, [formValue, form]);

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="first_name"
							rules={{ required: "First name is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">First Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="last_name"
							rules={{ required: "Last name is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Last Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							rules={{
								required: "Email is required",
								pattern: {
									value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
									message: "Enter a valid email address",
								},
							}}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Email</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Phone</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input placeholder="+91 98XXXXXX10" {...field} />
										</FormControl>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role_id"
							rules={{ required: "Role is required" }}
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Role</FormLabel>
									<div className="col-span-3">
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select role" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{roles.map((role) => (
													<SelectItem key={role.id} value={role.id}>
														{role.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Status</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<RadioGroup onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={String(BasicStatusEnum.ENABLE)} id="admin_staff_status_enable" />
													<Label htmlFor="admin_staff_status_enable">Enable</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value={String(BasicStatusEnum.DISABLE)} id="admin_staff_status_disable" />
													<Label htmlFor="admin_staff_status_disable">Disable</Label>
												</div>
											</RadioGroup>
										</FormControl>
									</div>
								</FormItem>
							)}
						/>
					</div>
				</Form>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel} disabled={loading}>
						Cancel
					</Button>
					<Button
						disabled={loading}
						onClick={() => {
							form.handleSubmit(async (values) => {
								const result = await onOk(values);
								if (result?.fieldErrors) {
									Object.entries(result.fieldErrors).forEach(([field, messages]) => {
										form.setError(field as keyof AdminStaffFormValues, {
											type: "server",
											message: Array.isArray(messages) ? messages[0] : String(messages),
										});
									});
								}
							})();
						}}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
