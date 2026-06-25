// 1. Dữ liệu gửi lên khi muốn query (Filter/Phân trang)
export interface ProductQueryRequestDTO {
	page: number;
	size: number;
	categoryId?: number;
	search?: string;
}

// 2. Dữ liệu thô BE trả về (Product)
export interface ProductResponseDTO {
	id: number; // Map từ 'pk'
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
	// thumbnail: string;     // Lên FE chừa sẵn field này, mốt map table Images vào sau
}

export interface FlexibleProductDTO {
	id?: number | string;
	businessId?: string;
	pk?: number;
	productPk?: number;
	product_pk?: number;
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
	descriptionEng?: string;
	description_eng?: string;
	price?: number;
	productPrice?: number;
	product_price?: number;
	createdDate?: string;
	created_date?: string;
	available?: boolean;
	quantity?: number;
	sales?: number;
	delIf?: boolean;
	del_if?: boolean;
	categoryId?: number;
	category_pk?: number;
	categoryPk?: number;
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
		};
	}

	const price = dto.price || dto.productPrice || dto.product_price || 0;

	// Backend có thể trả về 'pk' là ID số (Long), và 'id' là mã chữ (String, vd PROD001)
	const numericId =
		dto.pk ??
		dto.productPk ??
		dto.product_pk ??
		(typeof dto.id === "number" ? dto.id : 0);
	const stringCode =
		dto.code ?? (typeof dto.id === "string" ? dto.id : String(numericId));
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
		descriptionVn: dto.descriptionVn || dto.description_vn || "",
		descriptionEng: dto.descriptionEng || dto.description_eng || "",
		price: price,
		formattedPrice: new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(price),
		createdDate:
			dto.createdDate || dto.created_date || new Date().toISOString(),
		isAvailable: dto.available ?? true,
		stockQuantity: dto.quantity ?? 1,
		totalSales: dto.sales || 0,
		isActive: !(dto.delIf || dto.del_if),
		categoryId: dto.categoryId || dto.category_pk || dto.categoryPk || 0,
	};
};
