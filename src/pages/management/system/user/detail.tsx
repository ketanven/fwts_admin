import adminUserService from "@/api/services/adminUserService";
import type { AdminUser } from "@/api/services/adminUserService";
import { useParams } from "@/routes/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { useEffect, useState } from "react";

export default function UserDetail() {
	const { id } = useParams();
	const [user, setUser] = useState<AdminUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		let mounted = true;
		setLoading(true);
		adminUserService
			.detail(id)
			.then((res) => {
				if (mounted) setUser(res as unknown as AdminUser);
			})
			.catch(() => {
				if (mounted) setUser(null);
			})
			.finally(() => {
				if (mounted) setLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [id]);

	if (loading) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">Loading user details...</CardContent>
			</Card>
		);
	}

	if (!user) {
		return (
			<Card>
				<CardContent className="py-12 text-center text-muted-foreground">User not found.</CardContent>
			</Card>
		);
	}

	const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "—";

	return (
		<Card>
			<CardHeader>
				<CardTitle>User Detail</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					<div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
						<span className="font-medium text-muted-foreground">Name</span>
						<span>{fullName}</span>
					</div>
					<div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
						<span className="font-medium text-muted-foreground">Email</span>
						<span>{user.email}</span>
					</div>
					<div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
						<span className="font-medium text-muted-foreground">Status</span>
						<span>
							<Badge variant={user.is_active ? "success" : "error"}>
								{user.is_active ? "Active" : "Inactive"}
							</Badge>
						</span>
					</div>
					{user.date_joined && (
						<div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
							<span className="font-medium text-muted-foreground">Joined</span>
							<span>{new Date(user.date_joined).toLocaleDateString()}</span>
						</div>
					)}
					<div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
						<span className="font-medium text-muted-foreground">User ID</span>
						<span className="font-mono text-xs text-muted-foreground">{user.id}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

