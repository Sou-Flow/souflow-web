import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/admin/",
					"/api/",
					"/login",
					"/register",
					"/forgot-password",
					"/checkout",
				],
			},
		],
		sitemap: "https://souflow.shop/sitemap.xml",
		host: "https://souflow.shop",
	};
}
