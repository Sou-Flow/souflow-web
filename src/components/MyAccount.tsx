"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import type { UserFE } from "@/types/auth.type";
import AccountForm from "./AccountForm"; // Import form từ file mới vào

export function MyAccount() {
	const [user, setUser] = useState<UserFE | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = localStorage.getItem("accessToken");
				if (!token) {
					setIsLoading(false);
					router.push("/login");
					return; // Không có token thì dừng luôn
				}

				const userData = await authService.me();
				setUser(userData);
			} catch (error) {
				console.error("Phiên đăng nhập hết hạn hoặc lỗi lấy thông tin:", error);
				setUser(null);
				authService.logout();
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [router.push]);

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
