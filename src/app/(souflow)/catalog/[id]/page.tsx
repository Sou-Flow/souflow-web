import { FlowerDetails } from "@/components/FlowerDetails";
import { productService } from "@/services/productService";
import type { Metadata } from "next";

type ProductPageProps = {
	params: Promise<{ id: string }>;
};

// Hàm này chạy trên Server (Node.js) để bốc dữ liệu ra gán vào thẻ <meta>
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { id } = await params;
	
	// Gọi API lấy chi tiết sản phẩm (Giống hệt cách giao diện đang lấy)
	const product = await productService.getFlowerByCode(id);
	
	if (!product) {
		return {
			title: "Sản phẩm không tồn tại | SouFlow",
			description: "Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xoá.",
		};
	}

	return {
		title: `${product.nameVn} | SouFlow`,
		description: product.descriptionVn?.substring(0, 160) || "Mua hoa tươi cao cấp tại SouFlow",
		openGraph: {
			title: `${product.nameVn} | SouFlow`,
			description: product.descriptionVn?.substring(0, 160),
			images: product.images?.[0] ? [product.images[0]] : [],
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
	return <FlowerDetails productId={id} />;
}
