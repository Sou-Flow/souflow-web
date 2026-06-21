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

export interface UserResponseDTO {
	id: number; // BE trả id chứ không phải pk
	username: string;
	fullName: string;
	email: string;
	phoneNumber: string;
	address: string;
	photo: string | null;
	roleCode: string; // BE trả chuỗi (vd: "CUSTOMER") chứ không phải số rolePk
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
	roleCode: string; // Đổi từ roleId (số) sang roleCode (chữ) cho tiện xài
	createDate: string;
	activated: boolean;
}
export interface UpdateProfileRequestDTO {
	fullName: string;
	email: string;
	phoneNumber: string;
}

// 4. Hàm Mapper nắn dữ liệu
export const mapUserResponseToFE = (dto: UserResponseDTO): UserFE => {
	return {
		id: dto.id,
		username: dto.username,
		fullName: dto.fullName,
		email: dto.email,
		avatar: dto.photo || "/default-avatar.png", // Fallback ảnh
		phone: dto.phoneNumber,
		address: dto.address,
		roleCode: dto.roleCode,
		createDate: dto.createdDate,
		activated: true,
	};
};
