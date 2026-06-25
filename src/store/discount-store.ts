import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscountFE } from "@/types/discount.type";

interface DiscountState {
	appliedDiscount: DiscountFE | null; // Lưu trữ discount đang được áp dụng

	// Các Actions
	applyDiscount: (discount: DiscountFE) => void; // Gọi khi check mã hợp lệ
	removeDiscount: () => void; // Gọi khi người dùng xoá mã
	clearDiscount: () => void; // Thường gọi sau khi thanh toán xong
}

export const useDiscountStore = create<DiscountState>()(
	persist(
		(set) => ({
			appliedDiscount: null,

			applyDiscount: (discount) => {
				set({ appliedDiscount: discount });
			},

			removeDiscount: () => {
				set({ appliedDiscount: null });
			},

			clearDiscount: () => {
				set({ appliedDiscount: null });
			},
		}),
		{
			name: "discount-storage", // Tên key lưu trong localStorage
		},
	),
);
