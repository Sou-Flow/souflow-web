"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/auth-store";
import AccountForm from "./AccountForm"; // Import form từ file mới vào

export function MyAccount() {
	const { user } = useAuthStore();
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const checkAuth = async () => {
			const token = Cookies.get("accessToken");
			if (!token) {
				router.push("/login");
				return;
			}
			// Nếu có token nhưng chưa có user (đang tải từ AuthProvider)
			if (!user) {
				// Đợi AuthProvider hoặc tự fetch
				try {
					const userData = await authService.me();
					useAuthStore.getState().setUser(userData);
				} catch (error) {
					console.error(error);
					router.push("/login");
				}
			}
			setIsLoading(false);
		};
		checkAuth();
	}, [user, router]);

	// Không có useState nào ở dưới đây nữa, nên dùng return thoải mái không sợ lỗi!
	if (isLoading) {
		return (
			<div className="flex justify-center p-12">Đang tải thông tin...</div>
		);
	}

	if (!user) {
		return <div className="flex justify-center p-12">Vui lòng đăng nhập!</div>;
	}

	// Truyền data xuống Component con
	return <AccountForm initialUser={user} />;
}
