import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/ui/toggle-group";
import { TreeSelect } from "antd";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Permission_Old } from "#/entity";
import { BasicStatus, PermissionType } from "#/enum";

export type PermissionModalProps = {
	title: string;
	show: boolean;
	loading?: boolean;
	formValue: Permission_Old;
	permissions: Permission_Old[];
	onOk: (values: Permission_Old) => void | Promise<void>;
	onCancel: VoidFunction;
};

export default function PermissionModal({ title, show, loading, formValue, permissions, onOk, onCancel }: PermissionModalProps) {
	const form = useForm<Permission_Old>({
		defaultValues: formValue,
	});

	useEffect(() => {
		form.reset(formValue);
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
							name="name"
							rules={{ required: "Name is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="label"
							rules={{ required: "Label is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Label</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type</FormLabel>
										<FormControl>
											<ToggleGroup type="single" value={String(field.value)} onValueChange={(value) => value && field.onChange(Number(value))}>
												<ToggleGroupItem value={String(PermissionType.CATALOGUE)}>Catalogue</ToggleGroupItem>
												<ToggleGroupItem value={String(PermissionType.MENU)}>Menu</ToggleGroupItem>
											</ToggleGroup>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<FormControl>
											<Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={String(BasicStatus.ENABLE)}>Enable</SelectItem>
													<SelectItem value={String(BasicStatus.DISABLE)}>Disable</SelectItem>
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="parentId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Parent Permission (Optional)</FormLabel>
									<FormControl>
										<TreeSelect
											allowClear
											treeData={permissions.filter((item) => item.id !== formValue.id)}
											value={field.value || undefined}
											onChange={(value) => field.onChange(value || "")}
											fieldNames={{ label: "name", value: "id", children: "children" }}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="route"
								rules={{ required: "Route is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Route</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="component"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Component</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="icon"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Icon</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="order"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Order</FormLabel>
										<FormControl>
											<Input
												type="number"
												value={field.value ?? ""}
												onChange={(event) => {
													const value = event.target.value;
													field.onChange(value ? Number(value) : undefined);
												}}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</div>
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
								await onOk(values);
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
