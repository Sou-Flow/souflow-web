import type { MetadataRoute } from "next";
import { productService } from "@/services/productService";

export const revalidate = 3600; // Tự động làm mới sitemap mỗi 1 giờ

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = "https://souflow.shop";

	// Các trang tĩnh quan trọng
	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1.0,
		},
		{
			url: `${baseUrl}/catalog`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${baseUrl}/privacy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/terms`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.5,
		},
	];

	// Lấy danh sách toàn bộ sản phẩm hoa từ API để tạo sitemap động
	try {
		const products = await productService.getAllFlower();
		const productRoutes: MetadataRoute.Sitemap = (products || []).map(
			(flower) => ({
				url: `${baseUrl}/catalog/${flower.code}`,
				lastModified: flower.createdDate
					? new Date(flower.createdDate)
					: new Date(),
				changeFrequency: "weekly",
				priority: 0.8,
			}),
		);

		return [...staticRoutes, ...productRoutes];
	} catch (error) {
		console.warn("⚠️ Không thể lấy danh sách sản phẩm cho sitemap:", error);
		return staticRoutes;
	}
}
