// src/services/productService.ts

import type { ApiResponse } from "@/types/api.type";
import {
	mapProductResponseToFE,
	type ProductFE,
	type ProductResponseDTO,
} from "@/types/product.type";
import axiosClient from "./axiosClient";

export const productService = {
	getAllFlower: async (): Promise<ProductFE[]> => {
		try {
			// 1. Gọi API, quy định rõ kiểu trả về thô là ApiResponse bọc một mảng ProductResponseDTO
			const rawResponse: ApiResponse<ProductResponseDTO[]> =
				await axiosClient.get("/products");

			// Lấy chính xác cái mảng dữ liệu nằm bên trong property 'data' của ApiResponse
			const rawList = rawResponse.data;

			// Chắc cú kiểm tra xem nó có phải là mảng không
			if (!Array.isArray(rawList)) {
				return [];
			}

			// 2. Chạy qua máy xay Mapper để gọt data thô (BE) thành data sạch (FE)
			return rawList.map(mapProductResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/products' lỗi hoặc BE chưa chạy.", error);
			// Lấy danh sách lỗi thì trả về MẢNG RỖNG, tuyệt đối không dùng notFound() ở đây
			return [];
		}
	},

	getFlowerById: async (id: number): Promise<ProductFE | null> => {
		try {
			const rawResponse: ApiResponse<ProductResponseDTO> =
				await axiosClient.get(`/products/${id}`);

			if (!rawResponse.data) return null;

			// 2. Dùng Mapper gọt data cho 1 sản phẩm
			return mapProductResponseToFE(rawResponse.data);
		} catch (error) {
			console.warn("⚠️ API '/products/:id' lỗi hoặc BE chưa chạy.", error);
			// Lấy chi tiết bị lỗi thì trả về null (Để bên giao diện check == null thì mới gọi notFound() đá qua trang 404)
			return null;
		}
	},
};
