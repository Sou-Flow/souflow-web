import type { Metadata } from "next";
import { ForgotPasswordScreen } from "@/components/ForgotPasswordScreen";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Quên Mật Khẩu",
	description: "Khôi phục lại mật khẩu cho tài khoản SouFlow của bạn.",
	path: "/forgot-password",
});

export default function ForgotPasswordPage() {
	return (
		<div className="container mx-auto px-4 py-8 md:py-12">
			<ForgotPasswordScreen />
		</div>
	);
}
