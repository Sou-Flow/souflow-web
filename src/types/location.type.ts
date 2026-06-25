// src/types/location.type.ts

// Type dùng cho dữ liệu tỉnh/thành phố Việt Nam (FE-only, không có bảng trong DB)
export interface VietnamCity {
	code: string | number;
	name: string;
	districts: District[];
}

export interface District {
	code: string | number;
	name: string;
	wards?: Ward[];
}

export interface Ward {
	code: string | number;
	name: string;
}
