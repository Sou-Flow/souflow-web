import { AboutUs } from "@/components/AboutUs";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Về Chúng Tôi",
	description:
		"SouFlow - Nơi kết nối tâm hồn và thiên nhiên. Chúng tôi tạo nên những thiết kế hoa mang cảm hứng, sự thanh lịch và nét đẹp nguyên bản.",
	path: "/about",
});

export default function AboutPage() {
	return <AboutUs />;
}
