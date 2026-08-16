import { FlowerDetails } from "@/components/FlowerDetails";
import { productService } from "@/services/productService";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

// Hàm này chạy trên Server (Node.js) để bốc dữ liệu ra gán vào thẻ <meta>
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { id } = await params;
	
	// Gọi API lấy chi tiết sản phẩm
	const product = await productService.getFlowerByCode(id);
	
	if (!product) {
		return {
			title: "Sản phẩm không tồn tại",
			description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xoá khỏi hệ thống SouFlow.",
		};
	}

	const title = `${product.nameVn}${product.nameEng ? ` (${product.nameEng})` : ""}`;
	const description =
		product.descriptionVn?.trim() ||
		product.descriptionEng?.trim() ||
		`Đặt mua ${product.nameVn} hoa tươi cao cấp, thiết kế độc quyền tại SouFlow. Giá: ${product.formattedPrice}.`;
	let ogImage =
		product.imageUrl ||
		product.images?.[0] ||
		"https://souflow.shop/images/og-image.jpg";
	if (ogImage.startsWith("http://s3.souflow.shop")) {
		ogImage = ogImage.replace("http://s3.souflow.shop", "https://s3.souflow.shop");
	}
	if (ogImage.startsWith("http://storage.souflow.shop")) {
		ogImage = ogImage.replace("http://storage.souflow.shop", "https://storage.souflow.shop");
	}

	return {
		title: title,
		description: description.substring(0, 160),
		keywords: [
			product.nameVn,
			product.nameEng,
			"hoa tươi",
			"hoa tươi cao cấp",
			"đặt hoa online",
			"SouFlow",
		].filter(Boolean) as string[],
		alternates: {
			canonical: `/catalog/${id}`,
		},
		openGraph: {
			title: `${product.nameVn} | SouFlow`,
			description: description.substring(0, 160),
			url: `/catalog/${id}`,
			siteName: "SouFlow",
			images: [
				{
					url: ogImage,
					width: 800,
					height: 800,
					alt: product.nameVn,
				},
			],
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${product.nameVn} | SouFlow`,
			description: description.substring(0, 160),
			images: [ogImage],
		},
	};
}

// Bật SSG (Static Site Generation) cho các trang chi tiết sản phẩm
export async function generateStaticParams() {
	// Gọi API lấy TẤT CẢ sản phẩm để Next.js biết trước có bao nhiêu bó hoa
	const products = await productService.getAllFlower();
	
	// Nếu lúc build trên Vercel mà Backend chưa chạy, trả về mảng rỗng [] 
	// Next.js sẽ tự động fallback về dạng SSR (Tạo HTML ngay lúc user truy cập)
	if (!products || products.length === 0) {
		return [];
	}

	// Trả về danh sách các [id] (code) để Next.js tạo sẵn file HTML tĩnh
	return products.map((product) => ({
		id: product.code,
	}));
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { id } = await params;
	const product = await productService.getFlowerByCode(id);

	if (!product) {
		notFound();
	}

	// Schema.org Structured Data (JSON-LD) giúp Google hiển thị giá tiền, hình ảnh và tình trạng còn hàng
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.nameVn,
		image: [
			product.imageUrl ||
				product.images?.[0] ||
				"https://souflow.shop/images/og-image.jpg",
		],
		description: product.descriptionVn || product.nameVn,
		sku: product.code,
		mpn: product.code,
		brand: {
			"@type": "Brand",
			name: "SouFlow",
		},
		offers: {
			"@type": "Offer",
			url: `https://souflow.shop/catalog/${id}`,
			priceCurrency: "VND",
			price: product.price,
			priceValidUntil: "2027-12-31",
			itemCondition: "https://schema.org/NewCondition",
			availability:
				product.isAvailable && product.stockQuantity > 0
					? "https://schema.org/InStock"
					: "https://schema.org/OutOfStock",
			seller: {
				"@type": "Organization",
				name: "SouFlow",
			},
		},
	};

	return (
		<>
			{jsonLd && (
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data for Google SEO
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			)}
			<FlowerDetails productId={id} />
		</>
	);
}
