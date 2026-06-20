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
	code: string;
	nameVn: string;
	nameEng: string;
	descriptionVn: string;
	descriptionEng: string;
	price: number;
	formattedPrice: string; // Thêm sẵn field format tiền VND để UI bind thẳng vào xài luôn
	createdDate: string;
	isAvailable: boolean; // Đổi tên cho tường minh
	stockQuantity: number; // Đổi tên từ quantity cho rõ nghĩa là tồn kho
	totalSales: number; // Đổi từ sales cho rõ nghĩa
	isActive: boolean; // Đảo từ delIf
	categoryId: number;
	// thumbnail: string;     // Lên FE chừa sẵn field này, mốt map table Images vào sau
}

// 4. Hàm Mapper nắn dữ liệu
export const mapProductResponseToFE = (dto: ProductResponseDTO): ProductFE => {
	return {
		id: dto.id,
		code: dto.code,
		nameVn: dto.nameVn,
		nameEng: dto.nameEng,
		descriptionVn: dto.descriptionVn,
		descriptionEng: dto.descriptionEng,
		price: dto.price,
		// Ép kiểu format tiền sẵn để component FE khỏi phải gọi hàm format nhiều lần
		formattedPrice: new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(dto.price),
		createdDate: dto.createdDate,
		isAvailable: dto.available,
		stockQuantity: dto.quantity,
		totalSales: dto.sales,
		isActive: !dto.delIf,
		categoryId: dto.categoryId,
	};
};
