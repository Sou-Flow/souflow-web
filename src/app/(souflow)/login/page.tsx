import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { constructMetadata } from "@/lib/souflow/seo";
import GoogleProvider from "@/providers/GoogleProvider";

export const metadata: Metadata = constructMetadata({
	title: "Đăng Nhập",
	description: "Đăng nhập tài khoản SouFlow để quản lý đơn hàng và nhận ưu đãi độc quyền.",
	path: "/login",
});

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center">
					Loading...
				</div>
			}
		>
			<GoogleProvider>
				<LoginScreen />
			</GoogleProvider>
		</Suspense>
	);
}
