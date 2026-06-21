// src/store/catalog-store.ts
import { create } from "zustand";
import { productService } from "@/services/productService";
import type { ProductFE } from "./../types/product.type";

interface CatalogState {
	// Dữ liệu
	flowers: ProductFE[];
	loadingFlowers: boolean;

	// UI State
	searchQuery: string;
	selectedCategory: string;

	// Actions
	fetchFlowers: () => Promise<void>;
	setSearchQuery: (query: string) => void;
	setSelectedCategory: (category: string) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
	flowers: [],
	loadingFlowers: false,
	searchQuery: "",
	selectedCategory: "All",

	// Action gọi API
	fetchFlowers: async () => {
		set({ loadingFlowers: true });

		// Gọi service đã có sẵn cơ chế fallback ở Bước 1
		const data = await productService.getAllFlower();

		set({ flowers: data, loadingFlowers: false });
	},

	setSearchQuery: (query) => set({ searchQuery: query }),
	setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
