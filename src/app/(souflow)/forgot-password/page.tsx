import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/components/ForgotPasswordScreen";

export const metadata: Metadata = {
	title: "Quên mật khẩu | SouFlow",
	description: "Khôi phục lại mật khẩu cho tài khoản SouFlow của bạn.",
};

export default function ForgotPasswordPage() {
	return (
		<div className="container mx-auto px-4 py-8 md:py-12">
			<ForgotPasswordScreen />
		</div>
	);
}
