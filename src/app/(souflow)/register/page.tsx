import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterScreen } from "@/components/RegisterScreen";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Đăng Ký Tài Khoản",
	description: "Tạo tài khoản SouFlow để tích điểm thành viên và nhận ưu đãi khi mua hoa tươi.",
	path: "/register",
});

export default function RegisterPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center">
					Loading...
				</div>
			}
		>
			<RegisterScreen />
		</Suspense>
	);
}
