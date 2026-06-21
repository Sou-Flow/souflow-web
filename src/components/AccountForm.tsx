"use client";

import { CheckCircle, Shield, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import type { UserFE } from "@/types/auth.type";

interface AccountFormProps {
	initialUser: UserFE;
}

export default function AccountForm({ initialUser }: AccountFormProps) {
	// Theme state
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	// Lưu user vào local state để khi update thông tin thì header (tên, avatar) tự đổi theo
	const [user, setUser] = useState<UserFE>(initialUser);

	// Personal Info Form State - Hứng data mượt mà không cần useEffect!
	const [fullName, setFullName] = useState(user.fullName || "");
	const [email, setEmail] = useState(user.email || "");
	const [phoneNumber, setPhoneNumber] = useState(user.phone || "");

	// Security Password State
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [updateFeedback, setUpdateFeedback] = useState(false);
	const [passwordFeedback, setPasswordFeedback] = useState(false);

	const handleUpdateProfile = (e: React.FormEvent) => {
		e.preventDefault();
		authService
			.updateProfile({
				fullName,
				email,
				phoneNumber,
			})
			.then(() => {
				setUser({
					...user,
					fullName,
					email,
					phone: phoneNumber,
				});

				setUpdateFeedback(true);
				setTimeout(() => setUpdateFeedback(false), 3000);
			});
		toast.success("Cập nhật thành công!");
	};

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		authService.changePassword(oldPassword, newPassword).then(() => {
			setOldPassword("");
			setNewPassword("");
			setPasswordFeedback(true);
			setTimeout(() => setPasswordFeedback(false), 3000);
		});
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			{/* Header Profile Summary cards */}
			<div className="flex flex-col md:flex-row items-center gap-6 mb-12 p-6 rounded-2xl bg-sf-bg-elevated border border-sf-border shadow-sm">
				<Image
					src={user.avatar || "/default-avatar.png"}
					alt={user.fullName || "User Avatar"}
					className="h-20 w-20 rounded-full object-cover grayscale brightness-105 border border-sf-border"
					referrerPolicy="no-referrer"
					width={80}
					height={80}
				/>
				<div className="text-center md:text-left space-y-1.5 flex-1">
					<div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
						<h1 className="font-serif text-2xl sm:text-3xl font-light text-sf-fg uppercase tracking-wide">
							{user.fullName}
						</h1>
					</div>
					<p className="text-xs text-[#666666] dark:text-[#A0A0A0] font-light">
						Thành viên đăng ký từ.
					</p>
				</div>

				{/* Global Dark Mode settings button */}
				<div className="flex flex-col items-center md:items-end gap-1 border-t md:border-t-0 md:border-l border-sf-border pt-4 md:pt-0 md:pl-6">
					<span className="text-sm text-[#888888] uppercase tracking-widest block font-bold">
						Giao diện
					</span>
					<button
						id="account-mode-switcher-btn"
						type="button"
						onClick={() =>
							setTheme(resolvedTheme === "dark" ? "light" : "dark")
						}
						disabled={!mounted}
						className="flex items-center gap-2 rounded-full border border-sf-border bg-[#FCFAF7] dark:bg-[#814f0e] px-4 py-2 text-xs font-semibold text-sf-fg hover:border-[#C49B83] disabled:opacity-50"
					>
						Switch to{" "}
						{mounted && resolvedTheme === "dark"
							? "Light Theme"
							: "Imperial Dark Mode"}
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
				{/* Left Side Content Forms */}
				<div className="lg:col-span-7 space-y-6">
					{/* Profile Form */}
					<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-sf-border shadow-xs space-y-4">
						<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-sf-border pb-3">
							<User className="h-4.5 w-4.5 text-[#C49B83]" />
							Thông Tin Cá Nhân
						</h2>

						<form onSubmit={handleUpdateProfile} className="space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label
										htmlFor="user-profile-name"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Họ và Tên
									</label>
									<input
										id="user-profile-name"
										type="text"
										required
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="user-profile-phone"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Số Điện Thoại
									</label>
									<input
										id="user-profile-phone"
										type="tel"
										required
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label
									htmlFor="user-profile-email"
									className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
								>
									Email Liên Hệ
								</label>
								<input
									id="user-profile-email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
								/>
							</div>

							<div className="flex items-center justify-between pt-2">
								<button
									type="submit"
									className="rounded-lg bg-[#C49B83] hover:bg-[#C49B83]/90 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-colors shadow-sm"
								>
									Lưu Thay Đổi
								</button>
								{updateFeedback && (
									<span className="text-sm text-green-500 font-bold uppercase flex items-center gap-1">
										<CheckCircle className="h-4 w-4" /> Cập Nhật Thành Công!
									</span>
								)}
							</div>
						</form>
					</div>

					{/* Security Form */}
					<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-sf-border shadow-xs space-y-4">
						<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-sf-border pb-3">
							<Shield className="h-4.5 w-4.5 text-[#C49B83]" />
							Bảo Mật Tài Khoản
						</h2>

						<form onSubmit={handleChangePassword} className="space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label
										htmlFor="old-pw"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Mật Khẩu Hiện Tại
									</label>
									<input
										id="old-pw"
										type="password"
										required
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										placeholder="••••••••"
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="new-pw"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Mật Khẩu Mới
									</label>
									<input
										id="new-pw"
										type="password"
										required
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										placeholder="Minimum 8 characters"
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
							</div>

							<div className="flex items-center justify-between pt-2">
								<button
									type="submit"
									className="rounded-lg bg-[#C49B83] hover:bg-[#C49B83]/90 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 transition-colors shadow-sm"
								>
									Đổi Mật Khẩu
								</button>
								{passwordFeedback && (
									<span className="text-sm text-green-500 font-bold uppercase flex items-center gap-1">
										<CheckCircle className="h-4 w-4" /> Đã Đổi Mật Khẩu!
									</span>
								)}
							</div>
						</form>
					</div>
				</div>

				{/* Right Side Content - Lịch sử đơn hàng */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-sf-border shadow-xs space-y-4">
						<h2 className="font-serif text-lg font-semibold text-sf-fg pb-3 border-b border-sf-border flex items-center gap-2">
							<ShoppingBag className="h-4.5 w-4.5 text-[#C49B83]" />
							Lịch Sử Đơn Hàng
						</h2>
						{/* Khu vực chứa Lịch sử đơn hàng của bạn */}
					</div>
				</div>
			</div>
		</div>
	);
}
