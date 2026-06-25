import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth-store";

const axiosClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
	// Thêm cái timeout để lỡ Backend sập thì FE không bị treo quay đều mãi
	timeout: 10000,
});

// Xử lý trước khi GỬI request đi (Nhét Token vào)
axiosClient.interceptors.request.use(
	(config) => {
		const token =
			typeof window !== "undefined" ? Cookies.get("accessToken") : null;
		if (token && config.headers) {
			// Nhét token vào chuẩn Bearer của JWT
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Xử lý sau khi NHẬN response về (Bắt lỗi 401)
axiosClient.interceptors.response.use(
	(response) => {
		// Chỉ lấy cái ruột data trả về cho code FE gọn nhẹ
		if (response?.data) {
			return response.data;
		}
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Lỗi 401: Token hết hạn hoặc chưa đăng nhập
			console.warn("Phiên đăng nhập hết hạn!");

			// Xóa trạng thái người dùng trong Zustand và chuyển hướng cứng về trang login
			if (typeof window !== "undefined") {
				useAuthStore.getState().clearUser();
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
