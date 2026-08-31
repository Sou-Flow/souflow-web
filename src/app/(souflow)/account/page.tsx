import type { Metadata } from "next";
import { MyAccount } from "@/components/MyAccount";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Tài Khoản Của Tôi",
	description: "Quản lý thông tin tài khoản và theo dõi lịch sử đơn hàng tại SouFlow.",
	path: "/account",
	noIndex: true,
});

export default function AccountPage() {
	return <MyAccount />;
}
