import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";

import type { Role_Old } from "#/entity";

export type RoleModalProps = {
	formValue: Role_Old;
	title: string;
	show: boolean;
	loading?: boolean;
	onOk: (values: Role_Old) => void | Promise<void>;
	onCancel: VoidFunction;
};
export function RoleModal({ title, show, formValue, loading, onOk, onCancel }: RoleModalProps) {
	const form = useForm<Role_Old>({
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
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} />
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
