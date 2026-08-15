// src/types/discount.type.ts

// 1. Dữ liệu thô BE trả về (bảng discounts)
export interface DiscountResponseDTO {
	pk: number; // Map từ 'pk'
	code: string; // Map từ 'id' (VARCHAR) - mã giảm giá VD: SOULWINTER
	percentage: number; // Map từ 'percentage' (FLOAT)
	minOrderAmount: number;
	usageLimit: number;
	currentUsage: number;
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
	minOrderAmount: number;
	usageLimit: number;
	currentUsage: number;
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
		minOrderAmount: dto.minOrderAmount || 0,
		usageLimit: dto.usageLimit || 0,
		currentUsage: dto.currentUsage || 0,
		descriptionVn: dto.descriptionVn || "",
		descriptionEng: dto.descriptionEng || "",
		createdDate: dto.createdDate,
		expiredDate: dto.expiredDate,
		isExpired:
			dto.expired === true || String(dto.expired).toLowerCase() === "true",
		isActive:
			dto.delIf === undefined
				? true
				: dto.delIf === false || String(dto.delIf).toLowerCase() === "false",
	};
};
