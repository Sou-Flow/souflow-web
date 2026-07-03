import type { ApiResponse } from "@/types/api.type";
import {
	type CategoryFE,
	type CategoryResponseDTO,
	mapCategoryResponseToFE,
} from "@/types/category.type";
import axiosClient from "./axiosClient";

export const categoryService = {
	getAllCategory: async (): Promise<CategoryFE[]> => {
		try {
			const rawResponse: ApiResponse<CategoryResponseDTO[]> =
				await axiosClient.get("/category/list");

			// CÁCH SỬA LỖI Ở ĐÂY: Thêm as unknown và gán kiểu any
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			let rawList: CategoryResponseDTO[] = [];
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

			// 2. Chạy qua máy xay Mapper để gọt data thô (BE) thành data sạch (FE)
			return rawList.map(mapCategoryResponseToFE);
		} catch {
			console.warn("⚠️ API '/category/list' lỗi hoặc BE chưa chạy.");
			return [];
		}
	},
	getCategoryById: async (id: number): Promise<CategoryFE | null> => {
		try {
			const rawResponse: ApiResponse<CategoryResponseDTO> =
				await axiosClient.get(`/category/${id}`);

			// CÁCH SỬA LỖI Ở ĐÂY TƯƠNG TỰ
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			if (!actualData) return null;

			return mapCategoryResponseToFE(actualData);
		} catch {
			console.warn("⚠️ API '/category/:id' lỗi hoặc BE chưa chạy.");
			return null;
		}
	},
};
