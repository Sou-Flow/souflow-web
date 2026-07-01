import { create } from "zustand";
import type { ProductFE } from "@/types/product.type";

interface CatalogState {
	flowers: ProductFE[];
	loadingFlowers: boolean;
	searchQuery: string;
	minPrice: number | null;
	maxPrice: number | null;

	setSearchQuery: (query: string) => void;
	setPriceRange: (min: number | null, max: number | null) => void;
	// Tương lai bạn viết thêm hàm fetchFlowers vào đây
}

export const useCatalogStore = create<CatalogState>((set) => ({
	flowers: [],
	loadingFlowers: false,
	searchQuery: "",
	minPrice: null,
	maxPrice: null,

	setSearchQuery: (query) => set({ searchQuery: query }),
	setPriceRange: (min, max) => set({ minPrice: min, maxPrice: max }),
}));
