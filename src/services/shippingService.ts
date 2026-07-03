import axiosClient from "./axiosClient";

export interface ShippingFeeRequest {
	toDistrictId: number;
	toWardCode: string;
	weight?: number;
	insuranceValue?: number;
}

export interface ShippingFeeResponse {
	code: number;
	message: string;
	data: {
		total: number;
		service_fee: number;
		insurance_fee: number;
		pick_station_fee: number;
		coupon_value: number;
		r2s_fee: number;
		document_return: number;
		double_check: number;
		cod_fee: number;
		pick_remote_areas_fee: number;
		deliver_remote_areas_fee: number;
		cod_failed_fee: number;
	};
}
export const shippingService = {
	calculateFee: async (payload: ShippingFeeRequest): Promise<number> => {
		try {
			const response = await axiosClient.post<ShippingFeeResponse>(
				"/user/shipping/calculate-fee",
				{
					...payload,
					weight: payload.weight ?? 2000,
				},
			);

			// Axios interceptor đã bóc vỏ `response.data` rồi
			// Nên response ở đây chính là cục JSON trả về từ BE
			const data = response as unknown as {
				data?: { total?: number };
				total?: number;
			};

			if (data?.data && typeof data.data.total === "number") {
				return data.data.total;
			}
			if (data && typeof data.total === "number") {
				return data.total;
			}
			// // Dự phòng nếu trả về theo format cũ
			// if (data?.shippingFee && typeof data.shippingFee === "number") {
			// 	return data.shippingFee;
			// }
			// if (data?.data && typeof data.data.shippingFee === "number") {
			// 	return data.data.shippingFee;
			// }
			// Nếu BE chỉ trả về đúng số nguyên
			if (typeof data === "number") {
				return data;
			}

			console.warn("Không tìm thấy trường total trong response fee:", data);
			return 30000; // Giá fallback
		} catch (error) {
			console.error("Error calculating shipping fee:", error);
			// Fallback giá ship để không chặn flow mua hàng
			return 30000;
		}
	},
};
