import { ContactUs } from "@/components/ContactUs";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Liên Hệ & Đặt Hoa Thiết Kế",
	description:
		"Liên hệ tiệm hoa tươi SouFlow để được tư vấn thiết kế hoa theo yêu cầu, hoa sự kiện và đặt hoa giao hỏa tốc.",
	alternates: {
		canonical: "https://souflow.shop/contact",
	},
	openGraph: {
		title: "Liên Hệ & Đặt Hoa Thiết Kế | SouFlow",
		description:
			"Liên hệ tiệm hoa tươi SouFlow để được tư vấn thiết kế hoa theo yêu cầu, hoa sự kiện và đặt hoa giao hỏa tốc.",
		url: "https://souflow.shop/contact",
	},
};

export default function ContactPage() {
	return <ContactUs />;
}
