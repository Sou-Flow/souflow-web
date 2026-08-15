import { AboutUs } from "@/components/AboutUs";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Về Chúng Tôi",
	description:
		"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Chúng tôi tạo nên những thiết kế hoa mang cảm hứng, sự thanh lịch và nét đẹp nguyên bản.",
	alternates: {
		canonical: "https://souflow.shop/about",
	},
	openGraph: {
		title: "Về Chúng Tôi | SouFlow",
		description:
			"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Chúng tôi tạo nên những thiết kế hoa mang cảm hứng, sự thanh lịch và nét đẹp nguyên bản.",
		url: "https://souflow.shop/about",
	},
};

export default function AboutPage() {
	return <AboutUs />;
}
