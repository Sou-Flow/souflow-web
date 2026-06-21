import type { ApiResponse } from "@/types/api.type";
import type { CategoryResponseDTO } from "@/types/category.type";
import axiosClient from "./axiosClient";

export const categoryService = {
	getAllCategory: async () => {
		try {
			const rawResponse: ApiResponse<CategoryResponseDTO[]> =
				await axiosClient.get("/categories");
			return rawResponse.data;
		} catch {
			console.warn("⚠️ API '/categories' lỗi hoặc BE chưa chạy.");
			return [];
		}
	},
	getCategoryById: async (id: number) => {
		try {
			const rawResponse: ApiResponse<CategoryResponseDTO> =
				await axiosClient.get(`/categories/${id}`);
			return rawResponse.data;
		} catch {
			console.warn("⚠️ API '/categories/:id' lỗi hoặc BE chưa chạy.");
			return null;
		}
	},
};
