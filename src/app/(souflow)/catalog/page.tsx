import { FlowerCatalog } from "@/components/FlowerCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Bộ Sưu Tập Hoa Tươi Thiết Kế",
	description:
		"Khám phá các mẫu hoa tươi nghệ thuật cao cấp: bó hoa tươi, hộp hoa, giỏ hoa, hoa cưới, kệ hoa chúc mừng tại SouFlow.",
	alternates: {
		canonical: "https://souflow.shop/catalog",
	},
	openGraph: {
		title: "Bộ Sưu Tập Hoa Tươi Thiết Kế | SouFlow",
		description:
			"Khám phá các mẫu hoa tươi nghệ thuật cao cấp: bó hoa tươi, hộp hoa, giỏ hoa, hoa cưới, kệ hoa chúc mừng tại SouFlow.",
		url: "https://souflow.shop/catalog",
	},
};

export default function CatalogPage() {
	return <FlowerCatalog />;
}
