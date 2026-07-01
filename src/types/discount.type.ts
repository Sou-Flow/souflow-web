// src/types/discount.type.ts

// 1. Dữ liệu thô BE trả về (bảng discounts)
export interface DiscountResponseDTO {
	pk: number; // Map từ 'pk'
	code: string; // Map từ 'id' (VARCHAR) - mã giảm giá VD: SOULWINTER
	percentage: number; // Map từ 'percentage' (FLOAT)
	descriptionVn: string | null;
	descriptionEng: string | null;
	createdDate: string;
	expiredDate: string;
	expired: boolean;
	delIf: boolean;
}

// 2. Dữ liệu sạch cho FE xài
export interface DiscountFE {
	id: number;
	code: string;
	percentage: number;
	descriptionVn: string;
	descriptionEng: string;
	createdDate: string;
	expiredDate: string;
	isExpired: boolean;
	isActive: boolean;
}

// 3. Hàm Mapper
export const mapDiscountResponseToFE = (
	dto: DiscountResponseDTO,
): DiscountFE => {
	return {
		id: dto.pk,
		code: dto.code,
		percentage: dto.percentage,
		descriptionVn: dto.descriptionVn || "",
		descriptionEng: dto.descriptionEng || "",
		createdDate: dto.createdDate,
		expiredDate: dto.expiredDate,
		isExpired: dto.expired,
		isActive: !dto.delIf,
	};
};
