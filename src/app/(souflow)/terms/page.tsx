import type { Metadata } from "next";
import { TermsOfService } from "@/components/TermsOfService";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Điều Khoản Dịch Vụ",
	description:
		"Điều khoản dịch vụ và quy định đặt hàng, giao nhận hoa tại SouFlow.",
	path: "/terms",
});

export default function TermsPage() {
	return <TermsOfService />;
}
