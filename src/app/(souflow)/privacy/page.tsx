import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Chính Sách Bảo Mật",
	description:
		"Chính sách bảo mật thông tin khách hàng và quyền riêng tư khi mua hoa tại SouFlow.",
	path: "/privacy",
});

export default function PrivacyPage() {
	return <PrivacyPolicy />;
}
