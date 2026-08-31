import { ContactUs } from "@/components/ContactUs";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Liên Hệ & Đặt Hoa Thiết Kế",
	description:
		"Liên hệ tiệm hoa tươi SouFlow để được tư vấn thiết kế hoa theo yêu cầu, hoa sự kiện và đặt hoa giao hỏa tốc.",
	path: "/contact",
});

export default function ContactPage() {
	return <ContactUs />;
}
