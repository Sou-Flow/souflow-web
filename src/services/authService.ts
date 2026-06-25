// src/services/authService.ts
import Cookies from "js-cookie";
import type { ApiResponse } from "@/types/api.type";
import {
	type AuthResponseDTO,
	type LoginRequestDTO,
	mapUserResponseToFE,
	type UpdateProfileRequestDTO,
	type UserFE,
	type UserResponseDTO,
} from "@/types/auth.type";
import axiosClient from "./axiosClient";

export const authService = {
	login: async (credentials: LoginRequestDTO): Promise<UserFE> => {
		// 1. Gọi API gửi username/password lên BE
		const rawResponse: ApiResponse<AuthResponseDTO> = await axiosClient.post(
			"/auth/login",
			credentials,
		);
		const authData = rawResponse.data;

		// 2. BE trả về thành công -> Lưu Token vào trình duyệt để xài cho các API sau
		if (authData.accessToken) {
			Cookies.set("accessToken", authData.accessToken, { expires: 7 }); // Expires in 7 days
		}

		// 3. Nắn cục data user thô thành user sạch và ném về cho Component
		// Lưu ý: Nếu API login chỉ trả về AuthResponseDTO (token + username),
		// bạn cần gọi thêm API /me hoặc ép kiểu nếu BE trả về full user trong login.
		// Ở đây ta gọi hàm me() để lấy đầy đủ thông tin UserFE.
		return await authService.me();
	},
	me: async (): Promise<UserFE> => {
		// Gọi API lấy thông tin user hiện tại (BE sẽ dựa vào token để trả về đúng user)
		const rawResponse: ApiResponse<UserResponseDTO> =
			await axiosClient.get("/auth/me");
		const userData = rawResponse.data;
		return mapUserResponseToFE(userData);
	},
	register: async (data: Record<string, unknown>): Promise<void> => {
		console.log("REGISTER DATA:", data);
		// Gọi API đăng ký, BE sẽ tự xử lý logic tạo user mới
		await axiosClient.post("/auth/register", data);
	},
	logout: () => {
		// Hàm phụ trợ để xóa token khi đăng xuất (hoặc khi token hết hạn)
		Cookies.remove("accessToken");
	},
	updateProfile: async (
		updatedData: UpdateProfileRequestDTO,
	): Promise<void> => {
		await axiosClient.put("/auth/update-profile", updatedData);
	},
	changePassword: async (
		currentPassword: string,
		newPassword: string,
	): Promise<void> => {
		// Gọi API đổi mật khẩu, BE sẽ xử lý logic kiểm tra mật khẩu cũ và cập nhật mật khẩu mới
		await axiosClient.post("/auth/change-password", {
			currentPassword,
			newPassword,
		});
	},
};
