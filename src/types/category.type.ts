// 1. Dữ liệu gửi lên khi tạo/cập nhật Category (Request DTO)
export interface CategoryRequestDTO {
	businessId: string; // Map vô 'id' trong DB (vd: CAT01)
	nameVn: string;
	nameEng: string;
	descriptionVn?: string;
	descriptionEng?: string;
}

// 2. Dữ liệu thô BE trả về
export interface CategoryResponseDTO {
	pk: number; // BE trả pk (Map từ 'pk' trong DB)
	businessId?: string; // BE trả code (Map từ 'id' trong DB - VARCHAR)
	code?: string;
	nameVn: string;
	nameEng: string;
	descriptionVn: string | null;
	descriptionEng: string | null;
	delIf?: boolean; // BE tự convert BIT sang boolean
}

// 3. Dữ liệu sạch cho FE xài
export interface CategoryFE {
	id: number;
	code: string;
	nameVn: string;
	nameEng: string;
	descriptionVn: string;
	descriptionEng: string;
	isActive: boolean; // FE thích xài isActive thay vì delIf cho thuận logic (đảo ngược lại)
}

// 4. Hàm Mapper nắn dữ liệu
export const mapCategoryResponseToFE = (
	dto: CategoryResponseDTO,
): CategoryFE => {
	return {
		id: Number(dto.pk),
		code: dto.code || dto.businessId || String(dto.pk),
		nameVn: dto.nameVn,
		nameEng: dto.nameEng,
		descriptionVn: dto.descriptionVn || "", // Fallback chuỗi rỗng nếu BE trả null
		descriptionEng: dto.descriptionEng || "",
		isActive: !dto.delIf, // del_if = false (0) nghĩa là isActive = true
	};
};
