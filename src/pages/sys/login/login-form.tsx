import type { SignInReq } from "@/api/services/userService";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSignIn } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();

	const form = useForm<SignInReq>({
		defaultValues: {
			email: "",
			password: "",
		},
	});

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: SignInReq) => {
		setLoading(true);
		console.log("Starting login...", values);
		try {
			await signIn(values);
			console.log("Login successful, navigating to:", GLOBAL_CONFIG.defaultRoute);
			navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
			toast.success(t("sys.login.loginSuccessTitle"), {
				closeButton: true,
			});
		} catch (error: any) {
			console.error("Login failed:", error);
            // Handle backend validation errors
            if (error.response && error.response.status === 400 && error.response.data) {
                const errors = error.response.data;
                Object.keys(errors).forEach((key) => {
                    const messages = errors[key];
                     // Check if field exists in form before setting error
                     // Backend might return "detail" or other non-field errors
                     if (key === 'email' || key === 'password') {
                        form.setError(key as any, {
                            type: "manual",
                            message: Array.isArray(messages) ? messages[0] : messages
                        });
                     } else {
                         // Fallback for non-field errors
                         toast.error(Array.isArray(messages) ? messages[0] : messages);
                     }
                });
            } else {
                 // Fallback for other errors (already toasted in apiClient for non-400, but ensuring safety)
                 // If apiClient suppressed 400 toast, we handle it here.
            }
        } finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)}>
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
					<div className="flex flex-col items-center gap-2 text-center">
						<h1 className="text-2xl font-bold">{t("sys.login.signInFormTitle")}</h1>
						<p className="text-balance text-sm text-muted-foreground">{t("sys.login.signInFormDescription")}</p>
					</div>

					<FormField
						control={form.control}
						name="email"
						rules={{ required: t("sys.login.accountPlaceholder") }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input placeholder="Email" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{ required: t("sys.login.passwordPlaceholder") }}
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("sys.login.password")}</FormLabel>
								<FormControl>
									<Input type="password" placeholder={t("sys.login.password")} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* 忘记密码 */}
					<div className="flex flex-row justify-end">
						<Button variant="link" onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)} size="sm" className="px-0">
							{t("sys.login.forgetPassword")}
						</Button>
					</div>

					{/* 登录按钮 */}
					<Button type="submit" className="w-full">
						{loading && <Loader2 className="animate-spin mr-2" />}
						{t("sys.login.loginButton")}
					</Button>


				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
