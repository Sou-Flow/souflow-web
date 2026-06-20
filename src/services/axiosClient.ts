import axios from "axios";

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
		// typeof window !== 'undefined' để đảm bảo code chỉ chạy trên trình duyệt (tránh lỗi SSR của Next.js)
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("accessToken");
			if (token && config.headers) {
				// Nhét token vào chuẩn Bearer của JWT
				config.headers.Authorization = `Bearer ${token}`;
			}
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

			// Tùy chọn: Tự động xóa token cũ và đá về trang chủ/login
			if (typeof window !== "undefined") {
				localStorage.removeItem("accessToken");
			}
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
