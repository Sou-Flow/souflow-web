import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "**.googleusercontent.com", // Dấu ** để cho phép mọi subdomain như lh3, lh4...
			},
			{
				protocol: "http", // Thêm dòng này dự phòng vì trong code bạn đang để http
				hostname: "**.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "qr.sepay.vn",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
