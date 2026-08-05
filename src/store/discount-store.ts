import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscountFE } from "@/types/discount.type";
import { discountService } from "@/services/discountService";
import toast from "react-hot-toast";

interface DiscountState {
	appliedDiscount: DiscountFE | null; // Lưu trữ discount đang được áp dụng
	couponCode: string;

	// Các Actions
	applyDiscount: (discount: DiscountFE, code: string) => void;
	removeDiscount: () => void;
	clearDiscount: () => void;
	checkAndApplyDiscount: (code: string, orderAmount: number) => Promise<boolean>;
}

export const useDiscountStore = create<DiscountState>()(
	persist(
		(set, get) => ({
			appliedDiscount: null,
			couponCode: "",

			applyDiscount: (discount, code) => {
				set({ appliedDiscount: discount, couponCode: code });
			},

			removeDiscount: () => {
				set({ appliedDiscount: null, couponCode: "" });
			},

			clearDiscount: () => {
				set({ appliedDiscount: null, couponCode: "" });
			},

			checkAndApplyDiscount: async (code, orderAmount) => {
				const match = code.toUpperCase().trim();
				if (!match) return false;

				try {
					const discountData = await discountService.applyDiscount(match, orderAmount);

					if (discountData) {
						if (discountData.isExpired) {
							toast.error("Mã giảm giá đã hết hạn sử dụng.");
						} else if (!discountData.isActive) {
							toast.error("Mã giảm giá không khả dụng hoặc đã bị xóa.");
						} else {
							set({ appliedDiscount: discountData, couponCode: match });
							return true;
						}
					}
					get().removeDiscount();
					return false;
				} catch (error: any) {
					toast.error(error.message || "Mã giảm giá không hợp lệ.");
					get().removeDiscount();
					return false;
				}
			},
		}),
		{
			name: "discount-storage", // Tên key lưu trong localStorage
		},
	),
);
