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
			const rawResponse: ApiResponse<ProductResponseDTO[]> =
				await axiosClient.get("/product", {
					params: { pageSize: 100 },
				});

			// CÁCH SỬA LỖI Ở ĐÂY: Thêm : any
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			// Hỗ trợ cả Array và PageResponse (phân trang có .content)
			let rawList: ProductResponseDTO[] = [];
			if (Array.isArray(actualData)) {
				rawList = actualData;
			} else if (
				actualData &&
				typeof actualData === "object" &&
				Array.isArray(actualData.content) // Giờ TS sẽ cho qua dòng này
			) {
				rawList = actualData.content;
			} else {
				return [];
			}

			// 2. Chạy qua máy xay Mapper để gọt data thô (BE) thành data sạch (FE)
			return rawList.map(mapProductResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/product' lỗi hoặc BE chưa chạy.", error);
			// Lấy danh sách lỗi thì trả về MẢNG RỖNG, tuyệt đối không dùng notFound() ở đây
			return [];
		}
	},

	getPaginatedFlowers: async (
		pageNumber: number,
		pageSize: number,
		keyword?: string,
		categoryPk?: number,
		sortOrder?: string,
		sortBy?: string,
		minPrice?: number,
		maxPrice?: number,
	): Promise<{ content: ProductFE[]; totalPages: number }> => {
		try {
			const params: Record<string, unknown> = {
				pageNumber,
				pageSize,
			};
			if (keyword) params.keyword = keyword;
			if (categoryPk) params.categoryPk = categoryPk;
			if (sortOrder) params.sortOrder = sortOrder;
			if (sortBy) params.sortBy = sortBy;
			if (minPrice !== undefined && minPrice !== null)
				params.minPrice = minPrice;
			if (maxPrice !== undefined && maxPrice !== null)
				params.maxPrice = maxPrice;

			const rawResponse = await axiosClient.get("/product", { params });

			// CÁCH SỬA LỖI Ở ĐÂY TƯƠNG TỰ: Thêm : any
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			if (
				actualData &&
				typeof actualData === "object" &&
				Array.isArray(actualData.content) // Và dòng này nữa
			) {
				return {
					content: actualData.content.map(mapProductResponseToFE),
					totalPages: actualData.totalPages || 1, // Kể cả gọi totalPages cũng không bị lỗi nữa
				};
			}
			return { content: [], totalPages: 1 };
		} catch (error) {
			console.warn("⚠️ API '/product' lỗi khi lấy phân trang.", error);
			return { content: [], totalPages: 1 };
		}
	},

	getFlowerByCode: async (code: string): Promise<ProductFE | null> => {
		try {
			const rawResponse: ApiResponse<ProductResponseDTO> =
				await axiosClient.get(`/product/by-code/${code}`);

			// Ở đây vì gọi thẳng cho 1 object, nên không bị lỗi .content, nhưng cứ thêm : any cho đồng bộ
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;
			if (!actualData) return null;

			// 2. Dùng Mapper gọt data cho 1 sản phẩm
			return mapProductResponseToFE(actualData);
		} catch (error) {
			console.warn(
				`⚠️ API '/product/by-code/${code}' lỗi hoặc BE chưa chạy.`,
				error,
			);
			// Lấy chi tiết bị lỗi thì trả về null (Để bên giao diện check == null thì mới gọi notFound() đá qua trang 404)
			return null;
		}
	},

	getTopSales: async (): Promise<ProductFE[]> => {
		try {
			const rawResponse: ApiResponse<ProductResponseDTO[]> =
				await axiosClient.get("/product/top-sales");

			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			let rawList: ProductResponseDTO[] = [];
			if (Array.isArray(actualData)) {
				rawList = actualData;
			} else if (
				actualData &&
				typeof actualData === "object" &&
				Array.isArray(actualData.content)
			) {
				rawList = actualData.content;
			} else {
				return [];
			}

			return rawList.map(mapProductResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/product/top-sales' lỗi hoặc BE chưa chạy.", error);
			return [];
		}
	},
};
