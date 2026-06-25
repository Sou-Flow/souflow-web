import { create } from "zustand";
import type { ProductFE } from "@/types/product.type";

interface CatalogState {
	flowers: ProductFE[];
	loadingFlowers: boolean;
	searchQuery: string;

	setSearchQuery: (query: string) => void;
	// Tương lai bạn viết thêm hàm fetchFlowers vào đây
}

export const useCatalogStore = create<CatalogState>((set) => ({
	flowers: [],
	loadingFlowers: false,
	searchQuery: "",

	setSearchQuery: (query) => set({ searchQuery: query }),
}));
