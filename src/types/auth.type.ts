// src/types/auth.ts

// 1. Dữ liệu gửi lên khi user điền form đăng nhập
export interface LoginRequestDTO {
	username: string;
	password: string;
}

// 2. Dữ liệu thô BE trả về (Giả sử BE trả về Token kèm Info User)
export interface AuthResponseDTO {
	accessToken: string;
	tokenType: string;
	username: string;
	role: string;
}

export interface ResetPasswordDTO {
	email: string;
	otp: string;
	newPassword: string;
}

export interface UserResponseDTO {
	pk: number; // BE trả pk chứ không phải id
	username: string;
	fullName?: string;
	fullname?: string;
	email: string;
	phoneNumber?: string;
	phone?: string;
	address: string;
	photo: string | null;
	roleCode?: string; // BE trả chuỗi (vd: "CUSTOMER") chứ không phải số rolePk
	roleResponse?: Record<string, unknown>;
	createdDate: string; // BE trả createdDate (có chữ d)
}

// 3. Dữ liệu sạch cho FE xài
export interface UserFE {
	id: number;
	username: string;
	fullName: string;
	email: string;
	avatar: string;
	phone: string;
	address: string;
	roleCode: string;
	createDate: string;
	activated: boolean;
}
export interface UpdateProfileRequestDTO {
	fullName: string;
	email: string;
	phoneNumber: string;
	address?: string;
}

// 4. Hàm Mapper nắn dữ liệu
export const mapUserResponseToFE = (dto: UserResponseDTO): UserFE => {
	return {
		id: dto.pk,
		username: dto.username,
		fullName: dto.fullName || dto.fullname || "",
		email: dto.email,
		avatar: dto.photo || "/images/avatar.png", // Fallback ảnh
		phone: dto.phoneNumber || dto.phone || "",
		address: dto.address,
		// biome-ignore lint/suspicious/noExplicitAny: skip
		roleCode: dto.roleCode || (dto.roleResponse as any)?.code || "CUSTOMER",
		createDate: dto.createdDate,
		activated: true,
	};
};
