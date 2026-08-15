import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth-store";

export const getApiBaseUrl = (): string => {
	// Khi chạy trên Server (Node.js SSR / SSG / generateMetadata)
	if (typeof window === "undefined") {
		return (
			process.env.INTERNAL_API_URL ||
			process.env.BACKEND_URL ||
			"http://backend:8080"
		).replace(/\/+$/, "");
	}
	// Khi chạy trên Client (Browser)
	if (process.env.NEXT_PUBLIC_API_URL) {
		return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
	}
	if (window.location.hostname.includes("souflow.shop")) {
		return `${window.location.protocol}//api.souflow.shop`;
	}
	return "http://localhost:8080";
};

const axiosClient = axios.create({
	baseURL: getApiBaseUrl(),
	// Thêm cái timeout để lỡ Backend sập thì FE không bị treo quay đều mãi
	timeout: 10000,
});

// Xử lý trước khi GỬI request đi (Nhét Token vào)
axiosClient.interceptors.request.use(
	(config) => {
		config.baseURL = getApiBaseUrl();
		const token =
			typeof window !== "undefined" ? Cookies.get("accessToken") : null;
		if (token && config.headers) {
			// Nhét token vào chuẩn Bearer của JWT
			config.headers.Authorization = `Bearer ${token}`;
		}

		// Tự động set Content-Type
		if (config.data instanceof FormData) {
			// Để trình duyệt tự set multipart/form-data với boundary
			if (config.headers) {
				delete config.headers["Content-Type"];
			}
		} else {
			if (config.headers && !config.headers["Content-Type"]) {
				config.headers["Content-Type"] = "application/json";
			}
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token as string);
		}
	});
	failedQueue = [];
};

// Xử lý sau khi NHẬN response về (Bắt lỗi 401)
axiosClient.interceptors.response.use(
	(response) => {
		// Chỉ lấy cái ruột data trả về cho code FE gọn nhẹ
		if (response?.data) {
			return response.data;
		}
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return axiosClient(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshToken = Cookies.get("refreshToken");
				if (!refreshToken) {
					throw new Error("No refresh token");
				}
				
				// Tránh circular dependency bằng cách dùng axios thuần
				const rs = await axios.post(`${getApiBaseUrl()}/auth/refresh`, {
					refreshToken,
				});
				
				const newToken = rs.data.data?.token || rs.data.token || rs.data.accessToken;
				const newRefreshToken = rs.data.data?.refreshToken || rs.data.refreshToken;
				
				Cookies.set("accessToken", newToken, { expires: 7 });
				if (newRefreshToken) {
					Cookies.set("refreshToken", newRefreshToken, { expires: 7 });
				}
				
				processQueue(null, newToken);
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				
				return axiosClient(originalRequest);
			} catch (_error) {
				processQueue(_error, null);
				if (typeof window !== "undefined") {
					Cookies.remove("accessToken");
					Cookies.remove("refreshToken");
					useAuthStore.getState().clearUser();
					window.location.href = "/login";
				}
				return Promise.reject(_error);
			} finally {
				isRefreshing = false;
			}
		}
		return Promise.reject(error);
	},
);

export default axiosClient;
