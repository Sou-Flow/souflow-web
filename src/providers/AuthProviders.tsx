"use client";

import { useEffect } from "react";
import { authService } from "@/services/authService";
import { useSoulFlowStore } from "@/store/soulflow-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { user, setUser } = useSoulFlowStore();

	useEffect(() => {
		const verifyAuth = async () => {
			const token = localStorage.getItem("accessToken");

			// Trường hợp 1: Có token nhưng store chưa có user (Vừa mở web lại)
			if (token && !user) {
				try {
					const userData = await authService.me();
					setUser(userData); // Cập nhật lại store
				} catch (error) {
					console.error("Token hết hạn hoặc lỗi xác thực:", error);
					authService.logout(); // Xóa token
					setUser(null); // Xóa khỏi store
				}
			}
			// Trường hợp 2: Bị mất token ở localStorage nhưng store vẫn còn rác
			else if (!token && user) {
				setUser(null);
			}
		};

		verifyAuth();
	}, [user, setUser]);

	return <>{children}</>;
}
