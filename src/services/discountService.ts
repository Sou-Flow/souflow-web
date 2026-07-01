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
				await axiosClient.get("/non-user/discount/available");

			// CÁCH SỬA LỖI: Khai báo thêm type : any cho biến actualData
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			let rawList: DiscountResponseDTO[] = [];
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

			return rawList.map(mapDiscountResponseToFE);
		} catch (error) {
			console.warn("⚠️ API '/non-user/discount/available' lỗi.", error);
			return [];
		}
	},

	checkDiscount: async (code: string): Promise<DiscountFE | null> => {
		try {
			const rawResponse: ApiResponse<DiscountResponseDTO> =
				await axiosClient.post("/non-user/discount/check", { code });

			// CÁCH SỬA LỖI Ở ĐÂY TƯƠNG TỰ
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const actualData: any =
				(rawResponse as unknown as Record<string, unknown>).data ?? rawResponse;

			if (!actualData) return null;
			return mapDiscountResponseToFE(actualData);
		} catch (error) {
			console.warn("Mã giảm giá không hợp lệ hoặc đã hết hạn.", error);
			throw error;
		}
	},
};
