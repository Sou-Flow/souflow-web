import type { ApiResponse } from "@/types/api.type";
import {
	mapOrderResponseToFE,
	type OrderFE,
	type OrderRequestDTO,
	type OrderResponseDTO,
} from "@/types/order.type";
import axiosClient from "./axiosClient";

export const orderService = {
	createOrder: async (payload: OrderRequestDTO): Promise<OrderFE> => {
		try {
			// axiosClient đã được setup với baseURL là http://localhost:8080/api
			// (nếu cấu hình NEXT_PUBLIC_API_URL trong .env)
			const rawResponse: ApiResponse<OrderResponseDTO> = await axiosClient.post(
				"/orders",
				payload,
			);

			if (!rawResponse.data) {
				throw new Error(
					"Tạo đơn hàng thành công nhưng không có dữ liệu trả về.",
				);
			}

			// Map qua FE
			return mapOrderResponseToFE(rawResponse.data);
		} catch (error) {
			console.error("Lỗi khi gọi API tạo đơn:", error);
			throw error;
		}
	},

	getMyOrders: async (): Promise<OrderFE[]> => {
		try {
			// Gọi API lấy lịch sử đơn hàng của user đang đăng nhập (token tự động được gắn ở interceptor)
			const rawResponse: ApiResponse<OrderResponseDTO[]> =
				await axiosClient.get("/orders");

			const rawList = rawResponse.data;

			if (!Array.isArray(rawList)) {
				return [];
			}

			return rawList.map(mapOrderResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/orders' lỗi hoặc chưa có auth.", error);
			return [];
		}
	},

	getOrderByCode: async (code: string): Promise<OrderFE | null> => {
		try {
			const rawResponse: ApiResponse<OrderResponseDTO> = await axiosClient.get(
				`/orders/by-code/${code}`,
				{ params: { t: Date.now() } },
			);

			if (!rawResponse.data) return null;

			return mapOrderResponseToFE(rawResponse.data);
		} catch (error) {
			console.warn(
				`⚠️ API '/orders/by-code/${code}' lỗi hoặc đơn hàng không tồn tại.`,
				error,
			);
			return null;
		}
	},

	updateOrderStatus: async (code: string, status: string): Promise<OrderFE> => {
		try {
			const rawResponse: ApiResponse<OrderResponseDTO> = await axiosClient.put(
				`/orders/by-code/${code}/status`,
				null,
				{ params: { status } },
			);
			return mapOrderResponseToFE(rawResponse.data);
		} catch (error) {
			console.error(`Lỗi cập nhật trạng thái đơn ${code}:`, error);
			throw error;
		}
	},
};
