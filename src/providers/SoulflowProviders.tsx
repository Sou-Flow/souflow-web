"use client";

import { type ReactNode, useEffect } from "react";
// Import các store mới đã được tách ra
import { useLocationStore } from "@/store/location-store";

// import { useCatalogStore } from "@/store/catalog-store";
// import { useCategoryStore } from "@/store/category-store";

type BoutiqueProvidersProps = {
	children: ReactNode;
};

/** Lấy các master data (danh mục, tỉnh thành...) 1 lần duy nhất khi load web */
export function BoutiqueProviders({ children }: BoutiqueProvidersProps) {
	// Kéo các action fetch data từ các store tương ứng
	const fetchLocationData = useLocationStore(
		(state) => state.fetchLocationData,
	);

	// Nếu bạn muốn lấy luôn Hoa và Danh mục lúc load trang thì mở comment ra
	// const fetchFlowers = useCatalogStore((state) => state.fetchFlowers);
	// const fetchCategories = useCategoryStore((state) => state.fetchCategories);

	useEffect(() => {
		// void fetchFlowers();
		// void fetchCategories();
		void fetchLocationData();
	}, [fetchLocationData]);
	// Nếu có mở comment fetchFlowers, fetchCategories thì nhớ thêm nó vào array dependency [fetchLocationData, fetchFlowers, fetchCategories]

	return <>{children}</>;
}
