import { FlowerCatalog } from "@/components/FlowerCatalog";
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/souflow/seo";

export const metadata: Metadata = constructMetadata({
	title: "Bộ Sưu Tập Hoa Tươi Thiết Kế",
	description:
		"Khám phá các mẫu hoa tươi nghệ thuật cao cấp: bó hoa tươi, hộp hoa, giỏ hoa, hoa cưới, kệ hoa chúc mừng tại SouFlow.",
	path: "/catalog",
});

export default function CatalogPage() {
	return <FlowerCatalog />;
}
