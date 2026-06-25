import { create } from "zustand";
import type { CategoryFE } from "@/types/category.type"; // <-- Dùng type chuẩn từ file mới

interface CategoryState {
	// Dữ liệu
	categories: CategoryFE[];
	loadingCategories: boolean;

	// UI State (Nguồn chân lý duy nhất cho việc chọn danh mục)
	selectedCategory: number | null;

	// Actions
	//fetchCategories: () => Promise<void>;
	setSelectedCategory: (category: number | null) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
	categories: [],
	loadingCategories: false,
	selectedCategory: null,

	setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
