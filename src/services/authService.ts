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
			"/login",
			credentials,
		);

		// CÁCH SỬA LỖI Ở ĐÂY: Thêm 'as unknown' trước khi ép về Record
		// biome-ignore lint/suspicious/noExplicitAny: Bỏ qua lỗi lint nếu dùng any để lấy thuộc tính linh hoạt
		const authData: any =
			(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

		// 2. BE trả về thành công -> Lưu Token vào trình duyệt để xài cho các API sau
		const token = authData.token || authData.accessToken;
		const refreshToken = authData.refreshToken;
		const cookieOptions = credentials.rememberMe ? { expires: 7 } : undefined; // Nếu không remember, cookie sẽ là Session Cookie
		
		if (token) {
			Cookies.set("accessToken", token, cookieOptions); 
		}
		if (refreshToken) {
			Cookies.set("refreshToken", refreshToken, cookieOptions);
		}

		// 3. Nắn cục data user thô thành user sạch và ném về cho Component
		return await authService.me();
	},

	loginWithGoogle: async (token: string): Promise<any> => {
		const rawResponse: ApiResponse<any> = await axiosClient.post(
			"/google/login",
			{ token },
		);

		const authData: any =
			(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

		if (authData.isNewUser) {
			return authData;
		}

		const jwt = authData.token || authData.accessToken;
		const refreshToken = authData.refreshToken;
		if (jwt) {
			Cookies.set("accessToken", jwt, { expires: 7 });
		}
		if (refreshToken) {
			Cookies.set("refreshToken", refreshToken, { expires: 7 });
		}

		return await authService.me();
	},

	me: async (): Promise<UserFE> => {
		// Gọi API lấy thông tin user hiện tại (BE sẽ dựa vào token để trả về đúng user)
		const rawResponse: ApiResponse<UserResponseDTO> =
			await axiosClient.get("/user/me");

		// CÁCH SỬA LỖI Ở ĐÂY TƯƠNG TỰ:
		// biome-ignore lint/suspicious/noExplicitAny: skip
		const userData: any =
			(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

		return mapUserResponseToFE(userData);
	},

	register: async (data: Record<string, unknown>): Promise<void> => {
		console.log("REGISTER DATA:", data);
		// Tách file ảnh ra khỏi dữ liệu account
		const { file, avatar, photo, ...accountData } = data;

		// Đăng ký cho khách hàng không yêu cầu FormData có file (avatar upload sau hoặc bỏ qua)
		await axiosClient.post("/register", accountData);
	},

	logout: () => {
		// Hàm phụ trợ để xóa token khi đăng xuất (hoặc khi token hết hạn)
		Cookies.remove("accessToken");
		Cookies.remove("refreshToken");
	},

	refreshToken: async (): Promise<string | null> => {
		const refreshToken = Cookies.get("refreshToken");
		if (!refreshToken) return null;
		try {
			const rawResponse: any = await axiosClient.post("/auth/refresh", { refreshToken });
			const authData: any = rawResponse.data ?? rawResponse;
			const newToken = authData.token || authData.accessToken;
			const newRefreshToken = authData.refreshToken;
			
			if (newToken) {
				Cookies.set("accessToken", newToken, { expires: 7 });
			}
			if (newRefreshToken) {
				Cookies.set("refreshToken", newRefreshToken, { expires: 7 });
			}
			return newToken;
		} catch (error) {
			Cookies.remove("accessToken");
			Cookies.remove("refreshToken");
			return null;
		}
	},

	updateProfile: async (
		updatedData: UpdateProfileRequestDTO | FormData,
	): Promise<import("@/types/auth.type").UserResponseDTO> => {
		const response = await axiosClient.put("/user/update-profile", updatedData);
		// biome-ignore lint/suspicious/noExplicitAny: skip
		return (response as any).data ?? response;
	},

	changePassword: async (
		currentPassword: string,
		newPassword: string,
	): Promise<void> => {
		// Gọi API đổi mật khẩu, BE sẽ xử lý logic kiểm tra mật khẩu cũ và cập nhật mật khẩu mới
		await axiosClient.post("/user/change-password", {
			currentPassword,
			newPassword,
		});
	},

	forgotPassword: async (email: string): Promise<void> => {
		await axiosClient.post("/forgot-password", { email });
	},

	verifyOtp: async (email: string, otp: string): Promise<void> => {
		await axiosClient.post("/verify-otp", { email, otp });
	},

	resetPassword: async (
		data: import("@/types/auth.type").ResetPasswordDTO,
	): Promise<void> => {
		await axiosClient.post("/reset-password", data);
	},
};
