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
				await axiosClient.get("/categories");
			const rawList = rawResponse.data;

			if (!Array.isArray(rawList)) {
				return [];
			}

			// 2. Chạy qua máy xay Mapper để gọt data thô (BE) thành data sạch (FE)
			return rawList.map(mapCategoryResponseToFE);
		} catch {
			console.warn("⚠️ API '/categories' lỗi hoặc BE chưa chạy.");
			return [];
		}
	},
	getCategoryById: async (id: number): Promise<CategoryFE | null> => {
		try {
			const rawResponse: ApiResponse<CategoryResponseDTO> =
				await axiosClient.get(`/categories/${id}`);
			if (!rawResponse.data) return null;

			return mapCategoryResponseToFE(rawResponse.data);
		} catch {
			console.warn("⚠️ API '/categories/:id' lỗi hoặc BE chưa chạy.");
			return null;
		}
	},
};
