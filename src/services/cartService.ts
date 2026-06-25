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
				await axiosClient.get("/carts");

			const data = rawResponse.data;
			if (!Array.isArray(data)) {
				return [];
			}
			return data;
		} catch (error) {
			console.warn("⚠️ API 'GET /carts' lỗi.", error);
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
				"/carts",
				{},
			);
			return rawResponse.data || null;
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
				`/carts/${cartId}`,
			);
			return rawResponse.data || null;
		} catch (error) {
			console.warn(`⚠️ API 'GET /carts/${cartId}' lỗi.`, error);
			return null;
		}
	},

	/**
	 * Thêm sản phẩm vào một giỏ hàng cụ thể
	 */
	addItemToCart: async (
		cartId: number,
		productId: number,
		quantity: number,
	): Promise<void> => {
		// Body tuỳ thuộc vào BE yêu cầu, ví dụ { productId, quantity }
		await axiosClient.post(`/carts/${cartId}/items`, { productId, quantity });
	},

	/**
	 * Cập nhật số lượng sản phẩm trong giỏ hàng
	 */
	updateQuantity: async (
		cartId: number,
		productId: number,
		quantity: number,
	): Promise<void> => {
		try {
			await axiosClient.put(`/carts/${cartId}/items/${productId}`, {
				quantity,
			});
		} catch (error) {
			console.error(
				`Lỗi khi cập nhật số lượng SP ${productId} trong giỏ ${cartId}:`,
				error,
			);
			throw error;
		}
	},

	/**
	 * Xoá một giỏ hàng
	 */
	deleteCart: async (cartId: number): Promise<void> => {
		try {
			await axiosClient.delete(`/carts/${cartId}`);
		} catch (error: unknown) {
			const err = error as { response?: { status?: number } };
			if (err.response && err.response.status === 404) {
				// BE đã tự xóa giỏ hàng khi lên đơn thành công, bỏ qua lỗi này
				return;
			}
			console.error(`Lỗi khi xóa giỏ hàng ${cartId}:`, error);
			throw error;
		}
	},

	/**
	 * Xoá một sản phẩm khỏi giỏ hàng
	 */
	removeItemFromCart: async (cartId: number, itemId: number): Promise<void> => {
		try {
			await axiosClient.delete(`/carts/${cartId}/items/${itemId}`);
		} catch (error) {
			console.error(
				`Lỗi khi xóa sản phẩm ${itemId} khỏi giỏ ${cartId}:`,
				error,
			);
			throw error;
		}
	},
};
