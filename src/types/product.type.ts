// 1. Dữ liệu gửi lên khi muốn query (Filter/Phân trang)
export interface ProductQueryRequestDTO {
	page: number;
	size: number;
	categoryId?: number;
	search?: string;
}

// 2. Dữ liệu thô BE trả về (Product)
export interface ProductResponseDTO {
	pk: number; // Map từ 'pk'
	businessId?: string; // ID string mới của BE
	code: string; // Map từ 'id' (vd: PROD001)
	nameVn: string;
	nameEng: string;
	descriptionVn: string;
	descriptionEng: string;
	price: number;
	createdDate: string;
	available: boolean;
	quantity: number;
	sales: number;
	delIf: boolean;
	categoryId: number; // Map từ 'category_pk'
	imageUrl?: string; // Link ảnh từ MinIO
}

// 3. Dữ liệu sạch cho FE xài
export interface ProductFE {
	id: number;
	businessId: string;
	code: string;
	nameVn: string;
	nameEng: string;
	descriptionVn: string;
	descriptionEng: string;
	price: number;
	formattedPrice: string;
	createdDate: string;
	isAvailable: boolean;
	stockQuantity: number;
	totalSales: number;
	isActive: boolean;
	categoryId: number;
	imageUrl: string;
	images: string[];
	comments: {
		id: string;
		author: string;
		content: string;
		timestamp: string;
		replies: {
			id: string;
			author: string;
			content: string;
			timestamp: string;
		}[];
	}[];
}

export interface FlexibleProductDTO {
	id?: number | string;
	businessId?: string;
	pk?: number | string;
	productPk?: number | string;
	product_pk?: number | string;
	productId?: number | string;
	product_id?: number | string;
	code?: string;
	nameVn?: string;
	name_vn?: string;
	productNameVn?: string;
	product_name_vn?: string;
	nameEng?: string;
	name_eng?: string;
	productNameEng?: string;
	product_name_eng?: string;
	descriptionVn?: string;
	description_vn?: string;
	description?: string;
	descriptionEng?: string;
	description_eng?: string;
	price?: number | string;
	productPrice?: number | string;
	product_price?: number | string;
	createdDate?: string;
	created_date?: string;
	available?: boolean | string;
	quantity?: number | string;
	stockQuantity?: number | string;
	stock_quantity?: number | string;
	sales?: number | string;
	sold?: number | string;
	soldQuantity?: number | string;
	sold_quantity?: number | string;
	totalSales?: number | string;
	total_sales?: number | string;
	delIf?: boolean | string;
	del_if?: boolean | string;
	categoryId?: number | string;
	category_pk?: number | string;
	categoryPk?: number | string;
	imageUrl?: string;
	productImageResponses?: { url?: string; name?: string }[];
	commentResponses?: {
		pk?: string | number;
		fullname?: string;
		username?: string;
		content?: string;
		createdDate?: string;
		replyResponses?: {
			pk?: string | number;
			fullname?: string;
			username?: string;
			content?: string;
			createdDate?: string;
		}[];
	}[];
}

export const mapProductResponseToFE = (
	dto?: FlexibleProductDTO | null,
): ProductFE => {
	if (!dto) {
		return {
			id: 0,
			businessId: "",
			code: "",
			nameVn: "Sản phẩm không xác định",
			nameEng: "Unknown Product",
			descriptionVn: "",
			descriptionEng: "",
			price: 0,
			formattedPrice: "0 đ",
			createdDate: new Date().toISOString(),
			isAvailable: false,
			stockQuantity: 0,
			totalSales: 0,
			isActive: false,
			categoryId: 0,
			imageUrl: "/images/about-us-main1.avif",
			images: [],
			comments: [],
		};
	}

	const price = Number(dto.price || dto.productPrice || dto.product_price || 0);

	// Backend có thể trả về 'pk' là ID số (Long), và 'id' là mã chữ (String, vd PROD001)
	const numericId =
		Number(
			dto.pk ??
				dto.productPk ??
				dto.product_pk ??
				dto.productId ??
				dto.product_id ??
				(typeof dto.id === "number" ? dto.id : Number(dto.id) || 0),
		) || 0;
	const stringCode =
		dto.code ?? dto.businessId ?? (dto.id ? String(dto.id) : String(numericId));
	const businessId = dto.businessId || stringCode;

	return {
		id: numericId,
		businessId: businessId,
		code: stringCode,
		nameVn:
			dto.nameVn ||
			dto.name_vn ||
			dto.productNameVn ||
			dto.product_name_vn ||
			"Hoa Tuyển Chọn",
		nameEng:
			dto.nameEng ||
			dto.name_eng ||
			dto.productNameEng ||
			dto.product_name_eng ||
			"Premium Flower",
		descriptionVn:
			dto.descriptionVn || dto.description_vn || dto.description || "",
		descriptionEng:
			dto.descriptionEng || dto.description_eng || dto.description || "",
		price: price,
		formattedPrice: new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price),
		createdDate:
			dto.createdDate || dto.created_date || new Date().toISOString(),
		isAvailable: dto.available !== false && dto.available !== "false",
		stockQuantity: Number(
			dto.quantity ?? dto.stockQuantity ?? dto.stock_quantity ?? 0,
		),
		totalSales: Number(
			dto.sales ??
				dto.sold ??
				dto.soldQuantity ??
				dto.sold_quantity ??
				dto.totalSales ??
				dto.total_sales ??
				0,
		),
		isActive: !(dto.delIf || dto.del_if),
		categoryId:
			Number(dto.categoryId || dto.category_pk || dto.categoryPk) || 0,
		imageUrl: (() => {
			const raw = dto.imageUrl || dto.productImageResponses?.[0]?.url || dto.productImageResponses?.[0]?.name;
			if (!raw) return "/images/about-us-main1.avif";
			let url = String(raw).replace(/([^:]\/)\/+/g, "$1");
			if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://s3.souflow.shop")) {
				url = url.replace("http://s3.souflow.shop", "https://s3.souflow.shop");
			}
			return url;
		})(),
		images:
			dto.productImageResponses?.map((img) => {
				let url = String(img.url || img.name || "").replace(/([^:]\/)\/+/g, "$1");
				if (typeof window !== "undefined" && window.location.protocol === "https:" && url.startsWith("http://s3.souflow.shop")) {
					url = url.replace("http://s3.souflow.shop", "https://s3.souflow.shop");
				}
				return url;
			}) || [],
		comments: (dto.commentResponses || []).map((c) => ({
			id: String(c.pk || ""),
			author: c.fullname || c.username || "Khách",
			content: c.content || "",
			timestamp: c.createdDate || "",
			replies: (c.replyResponses || []).map((r) => ({
				id: String(r.pk || ""),
				author: r.fullname || r.username || "Admin",
				content: r.content || "",
				timestamp: r.createdDate || "",
			})),
		})),
	};
};
