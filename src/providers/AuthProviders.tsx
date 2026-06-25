"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { user, setUser, logout } = useAuthStore();
	const { fetchCart } = useCartStore();

	useEffect(() => {
		const verifyAuth = async () => {
			const token = Cookies.get("accessToken");

			// Trường hợp 1: Có token nhưng store chưa có user (Vừa mở web lại)
			if (token && !user) {
				try {
					const userData = await authService.me();
					setUser(userData); // Cập nhật lại store
					fetchCart(); // Kéo giỏ hàng ngay lập tức sau khi có user
				} catch (error) {
					console.error("Token hết hạn hoặc lỗi xác thực:", error);
					logout(); // Xóa token, xóa khỏi store, xóa giỏ hàng
				}
			}
			// Trường hợp 2: Bị mất token ở localStorage nhưng store vẫn còn rác
			else if (!token && user) {
				logout();
			}
		};

		verifyAuth();
	}, [user, setUser, logout, fetchCart]);

	return <>{children}</>;
}
