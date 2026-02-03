// import PlaceholderImg from "@/assets/images/background/placeholder.svg";
import LocalePicker from "@/components/locale-picker";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import SettingButton from "@/layouts/components/setting-button";
import { useUserToken } from "@/store/userStore";
import { Navigate } from "react-router";
import LoginForm from "./login-form";
import MobileForm from "./mobile-form";
import { LoginProvider } from "./providers/login-provider";
import QrCodeFrom from "./qrcode-form";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";

function LoginPage() {
	const token = useUserToken();

	if (token.accessToken) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-4">
					<div className="flex justify-center gap-2">
						<div className="flex items-center gap-2 font-medium">
							<Logo size={28} />
							<span className="text-xl font-bold">{GLOBAL_CONFIG.appName}</span>
						</div>
					</div>
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full">
							<LoginProvider>
								<LoginForm />
								<MobileForm />
								<QrCodeFrom />
								<RegisterForm />
								<ResetForm />
							</LoginProvider>
						</div>
					</div>
				</div>
			</div>

			<div className="absolute right-4 top-4 flex flex-row">
				<LocalePicker />
				<SettingButton />
			</div>
		</div>
	);
}
export default LoginPage;
