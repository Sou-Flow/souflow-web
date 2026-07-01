// src/types/location.type.ts

// Type dùng cho dữ liệu tỉnh/thành phố Việt Nam (FE-only, không có bảng trong DB)
export interface VietnamCity {
	id?: number;
	code: string | number;
	name: string;
	districts: District[];
}

export interface District {
	id?: number;
	code: string | number;
	name: string;
	wards?: Ward[];
}

export interface Ward {
	code: string | number;
	name: string;
}
