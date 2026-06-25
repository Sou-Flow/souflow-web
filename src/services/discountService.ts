// src/services/discountService.ts

import type { ApiResponse } from "@/types/api.type";
import {
	type DiscountFE,
	type DiscountResponseDTO,
	mapDiscountResponseToFE,
} from "@/types/discount.type";
import axiosClient from "./axiosClient";

export const discountService = {
	getAvailableDiscounts: async (): Promise<DiscountFE[]> => {
		try {
			const rawResponse: ApiResponse<DiscountResponseDTO[]> =
				await axiosClient.get("/discounts/available");

			const rawList = rawResponse.data;
			if (!Array.isArray(rawList)) {
				return [];
			}

			return rawList.map(mapDiscountResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/discounts/available' lỗi.", error);
			return [];
		}
	},

	checkDiscount: async (code: string): Promise<DiscountFE | null> => {
		try {
			const rawResponse: ApiResponse<DiscountResponseDTO> =
				await axiosClient.post("/discounts/check", { code });

			if (!rawResponse.data) return null;
			return mapDiscountResponseToFE(rawResponse.data);
		} catch (error) {
			console.warn("Mã giảm giá không hợp lệ hoặc đã hết hạn.", error);
			throw error;
		}
	},
};
