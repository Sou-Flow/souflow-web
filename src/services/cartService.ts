// src/services/cartService.ts

import type { ApiResponse } from "@/types/api.type";
import type { CartResponseDTO } from "@/types/cart.type";
import axiosClient from "./axiosClient";

export const cartService = {
	/**
	 * Lấy danh sách tất cả các giỏ hàng (hoặc giỏ hàng của user tuỳ BE xử lý)
	 */
	getCarts: async (): Promise<CartResponseDTO[]> => {
		try {
			const rawResponse: ApiResponse<CartResponseDTO[]> =
				await axiosClient.get("/user/cart");

			// CÁCH SỬA LỖI: Thêm as unknown và gán kiểu trung gian là any
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			// Nếu BE trả về PageResponse (có chứa content) thì lấy content
			const list = Array.isArray(actualData)
				? actualData
				: (actualData as Record<string, unknown>)?.content || [];
			return list as CartResponseDTO[];
		} catch (error) {
			console.warn("⚠️ API 'GET /user/cart' lỗi.", error);
			return [];
		}
	},

	/**
	 * Tạo một giỏ hàng mới
	 */
	createCart: async (): Promise<CartResponseDTO | null> => {
		try {
			// Payload có thể trống hoặc chứa accountId tuỳ thiết kế BE
			const rawResponse: ApiResponse<CartResponseDTO> = await axiosClient.post(
				"/user/cart",
				{ itemRequests: [] },
			);

			// CÁCH SỬA LỖI
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			return actualData || null;
		} catch (error) {
			console.error("Lỗi khi tạo giỏ hàng:", error);
			throw error;
		}
	},

	/**
	 * Lấy thông tin chi tiết một giỏ hàng theo ID
	 */
	getCartById: async (cartId: number): Promise<CartResponseDTO | null> => {
		try {
			const rawResponse: ApiResponse<CartResponseDTO> = await axiosClient.get(
				`/user/cart/${cartId}`,
			);

			// CÁCH SỬA LỖI
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			return actualData || null;
		} catch (error) {
			console.warn(`⚠️ API 'GET /user/cart/${cartId}' lỗi.`, error);
			return null;
		}
	},

	/**
	 * Lưu toàn bộ giỏ hàng lên backend
	 */
	saveCart: async (
		cartId: number | null,
		items: { pk: number | null; productId: number; quantity: number }[],
	): Promise<CartResponseDTO | null> => {
		try {
			const payload = {
				id: cartId,
				pk: cartId,
				itemRequests: items.map((i) => ({
					id: i.pk,
					pk: i.pk,
					productId: i.productId,
					productPk: i.productId,
					product_pk: i.productId,
					quantity: i.quantity,
				})),
			};
			const rawResponse = await axiosClient.post("/user/cart", payload);

			// CÁCH SỬA LỖI
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			return actualData;
		} catch (error) {
			console.error("Lỗi khi lưu giỏ hàng:", error);
			throw error;
		}
	},

	/**
	 * Xóa giỏ hàng (khi đã thanh toán)
	 */
	deleteCart: async (cartId: number): Promise<void> => {
		try {
			await axiosClient.delete(`/user/cart/${cartId}`);
		} catch (error) {
			console.error(`Lỗi khi xóa giỏ hàng ${cartId}:`, error);
			throw error;
		}
	},
};
