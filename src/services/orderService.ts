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
				"/user/order",
				payload,
			);

			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			if (!actualData) {
				throw new Error(
					"Tạo đơn hàng thành công nhưng không có dữ liệu trả về.",
				);
			}

			// Map qua FE
			return mapOrderResponseToFE(actualData);
		} catch (error) {
			console.error("Lỗi khi gọi API tạo đơn:", error);
			throw error;
		}
	},

	getMyOrders: async (): Promise<OrderFE[]> => {
		try {
			// Gọi API lấy lịch sử đơn hàng của user đang đăng nhập (token tự động được gắn ở interceptor)
			const rawResponse: ApiResponse<OrderResponseDTO[]> =
				await axiosClient.get("/user/order", {
					params: { pageSize: 100 },
				});

			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			const rawList = Array.isArray(actualData)
				? actualData
				: (actualData as unknown as Record<string, unknown>)?.content || [];

			if (!Array.isArray(rawList)) {
				return [];
			}

			return rawList.map(mapOrderResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/user/order' lỗi hoặc chưa có auth.", error);
			return [];
		}
	},

	getOrderByCode: async (code: string): Promise<OrderFE | null> => {
		try {
			const rawResponse: ApiResponse<OrderResponseDTO> = await axiosClient.get(
				`/user/order/by-code/${code}`,
				{ params: { t: Date.now() } },
			);

			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			if (!actualData) return null;

			return mapOrderResponseToFE(actualData);
		} catch (error) {
			console.warn(
				`⚠️ API '/user/order/by-code/${code}' lỗi hoặc đơn hàng không tồn tại.`,
				error,
			);
			return null;
		}
	},

	updateOrderStatus: async (code: string, status: string): Promise<OrderFE> => {
		try {
			const rawResponse: ApiResponse<OrderResponseDTO> = await axiosClient.put(
				`/user/order/by-code/${code}/status`,
				null,
				{ params: { status } },
			);
			const actualData =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			return mapOrderResponseToFE(actualData);
		} catch (error: unknown) {
			console.warn(
				`⚠️ Backend sập khi cập nhật trạng thái đơn ${code}: ${error instanceof Error ? error.message : error}`,
			);
			throw error;
		}
	},

	deleteOrder: async (pk: string | number): Promise<boolean> => {
		try {
			await axiosClient.delete(`/user/order/${pk}`);
			return true;
		} catch (error: unknown) {
			console.warn(
				`⚠️ Lỗi khi gọi DELETE /user/order/${pk}: ${error instanceof Error ? error.message : error}`,
			);
			throw error;
		}
	},
};
