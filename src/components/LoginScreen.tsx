"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Eye, EyeOff, Flower, Lock, User } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/auth-store";
import {
	type LoginFormValues,
	loginValidator,
} from "@/validations/auth.validator";

export function LoginScreen() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginValidator),
		defaultValues: { username: "", password: "", rememberMe: false },
	});
	const [showPassword, setShowPassword] = useState(false);
	const [capsLockActive, setCapsLockActive] = useState(false);
	const setUser = useAuthStore((state) => state.setUser);
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");

	const handlePasswordKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.getModifierState("CapsLock")) {
			setCapsLockActive(true);
		} else {
			setCapsLockActive(false);
		}
	};
	const onSubmit = async (data: LoginFormValues) => {
		const toastId = toast.loading("Đang đăng nhập...");
		try {
			// Đưa username/password cho service đi xin token
			const userData = await authService.login({
				username: data.username,
				password: data.password,
				rememberMe: data.rememberMe,
			});
			const userName =
				userData.fullName?.slice(0, userData.fullName.indexOf(" ")) ||
				userData.username ||
				"User";

			// Lấy được data về thì quăng vào Store
			setUser(userData);

			toast.success(
				`Đăng nhập thành công!, Chào mừng ${userName} đã trở lại với SouFlow!`,
				{ id: toastId },
			);

			if (callbackUrl) {
				router.push(callbackUrl);
			} else {
				router.push(soulFlowRoutes.home);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const msg = String(
					error.response?.data?.message || error.response?.data || "",
				);
				if (
					msg.toLowerCase().includes("lock") ||
					msg.toLowerCase().includes("khoá") ||
					msg.toLowerCase().includes("khoa")
				) {
					toast.error("Tài khoản của bạn đã bị khoá!", { id: toastId });
				} else if (msg && typeof error.response?.data?.message === "string") {
					toast.error(msg, { id: toastId });
				} else {
					toast.error("Sai tài khoản hoặc mật khẩu!", { id: toastId });
				}
			} else {
				toast.error("Sai tài khoản hoặc mật khẩu!", { id: toastId });
			}
		}
	};

	return (
		<div className="w-full min-h-[85vh] md:min-h-175 bg-sf-bg rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12">
			{/* Cột Trái: Trải nghiệm thương hiệu (Màn Hình 1) */}
			<section className="hidden md:flex md:col-span-6 relative overflow-hidden bg-sf-bg min-h-137.5">
				{/* Lớp nền ảnh bông hoa mờ sương sang trọng */}
				<div className="absolute inset-0 z-0">
					<Image
						src="/images/login-bg.jpg"
						alt="SouFlow Botanical Artistry"
						className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-3000 ease-out"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
						loading="eager"
						quality={75}
						priority
					/>
					{/* Floral overlay gradient */}
					{/* <div className="absolute inset-0 bg-gradient-to-hb from-[#fcfaf7]/20 to-[#e0d8cc]/60 z-10" /> */}
				</div>

				{/* Nội dung thương hiệu */}
				<div className="relative z-20 flex flex-col justify-between p-12 w-full text-[#f8f8f8]">
					<div>
						<span className="text-xs text-[#FFC8A3] uppercase tracking-[0.2em] text-primary/80 font-semibold mb-2 block">
							Flower Shop Portal
						</span>
						<h2 className="font-serif text-[#C49B83] text-5xl font-light text-primary tracking-tight">
							SouFlow
						</h2>
						<p className="font-sans text-md text-secondary max-w-sm mt-6 italic font-light leading-relaxed">
							&quot;Bất kỳ ai cũng có thể tìm thấy sự bình yên trong thiên
							nhiên.&quot;
						</p>
					</div>

					<div className="flex items-center gap-4">
						<span className="w-12 h-px bg-primary/40 block"></span>
						<span className="font-sans text-xs uppercase tracking-[0.3em] font-medium text-primary">
							SouFlow - Where Nature Meets Elegance
						</span>
					</div>
				</div>
			</section>

			{/* Cột Phải: Form Đăng Nhập */}
			<section className="col-span-12 md:col-span-6 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative bg-sf-bg overflow-hidden">
				{/* Logo trên thiết bị di động */}
				<div className="md:hidden mb-8">
					<h2 className="font-serif text-3xl text-primary tracking-tight">
						SouFlow
					</h2>
				</div>

				<div className="w-full max-w-md space-y-8 relative z-10">
					<header className="space-y-2">
						<h3 className="font-serif text-3xl text-sf-heading font-light">
							Chào mừng trở lại!
						</h3>
						<p className="font-sans text-sm text-secondary/80">
							Vui lòng đăng nhập vào tài khoản của bạn để tiếp tục trải nghiệm
							những sản phẩm và dịch vụ tuyệt vời từ SouFlow.
						</p>
					</header>

					<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
						{/* Trường Username */}
						<div className="space-y-2 group">
							<label
								className="block text-xs uppercase tracking-widest font-semibold text-secondary/90 transition-colors group-focus-within:text-primary bg-sf"
								htmlFor="login-username"
							>
								Username
							</label>
							<div className="relative flex items-center border-b border-outline-variant py-2.5 transition-colors group-focus-within:border-primary">
								<User className="absolute left-0 w-4 h-4 text-secondary/40 group-focus-within:text-primary transition-colors" />
								<input
									id="login-username"
									type="text"
									placeholder="Enter your username"
									{...register("username")}
									className="pl-7 pr-4 text-sm placeholder-secondary/30 border-0 w-full bg-white/5 py-2.5 px-0 focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
								/>
							</div>
							{errors.username && (
								<p className="text-red-500 text-xs mt-1">
									{errors.username.message}
								</p>
							)}
						</div>

						{/* Trường Mật khẩu */}
						<div className="space-y-2 group">
							<div className="flex justify-between items-center text-xs uppercase tracking-widest font-semibold">
								<label
									className="text-secondary/90 transition-colors group-focus-within:text-primary"
									htmlFor="login-password"
								>
									Mật khẩu
								</label>
								<button
									type="button"
									className="lowercase text-xs font-medium font-sans tracking-normal hover:text-primary hover:underline hover:scale-105 underline-offset-2 transition-all duration-200 text-primary/80"
									onClick={() => router.push(soulFlowRoutes.forgotPassword)}
								>
									Quên mật khẩu?
								</button>
							</div>
							<div className="relative flex items-center border-b border-outline-variant py-2.5 transition-colors group-focus-within:border-primary">
								<Lock className="absolute left-0 w-4 h-4 text-secondary/40 group-focus-within:text-primary transition-colors" />
								<input
									id="login-password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									{...register("password")}
									onKeyUp={handlePasswordKeyUp}
									className="pl-7 pr-4 text-sm placeholder-secondary/30 border-0 w-full bg-white/5 py-2.5 px-0 focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-0 text-secondary/40 hover:text-primary transition-colors"
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
							{capsLockActive && (
								<p className="text-amber-500 text-xs mt-1 font-medium">
									⚠️ Caps Lock đang bật
								</p>
							)}
							{errors.password && (
								<p className="text-red-500 text-xs mt-1">
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Ghi nhớ đăng nhập */}
						<div className="flex items-center justify-between pt-1">
							<label className="flex items-center space-x-3 cursor-pointer group">
								<input
									type="checkbox"
									{...register("rememberMe")}
									className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary"
								/>
								<span className="font-sans text-xs text-secondary/80 group-hover:text-[#111c2d] transition-colors font-medium">
									Ghi nhớ đăng nhập
								</span>
							</label>
						</div>

						{/* Nút Đăng Nhập */}
						<div>
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full py-3.5 bg-primary bg-[#be754b] hover:bg-[#c3632b] text-sf-fg text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-login hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<span className="flex items-center gap-2">
										<span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
										LOGGING IN...
									</span>
								) : (
									"ĐĂNG NHẬP"
								)}
							</button>
						</div>

						<div className="relative flex py-2 items-center">
							<div className="flex-grow border-t border-outline-variant/40"></div>
							<span className="flex-shrink-0 mx-4 text-secondary/50 text-xs uppercase tracking-widest font-semibold">
								Hoặc
							</span>
							<div className="flex-grow border-t border-outline-variant/40"></div>
						</div>

						<div className="flex justify-center w-full mt-4">
							<div className="w-[340px] flex justify-center hover:drop-shadow-md transition-all duration-300 transform active:scale-[0.98]">
								<GoogleLogin
									theme="filled_black"
									size="large"
									text="continue_with"
									shape="pill"
									width="340"
									// @ts-expect-error - locale is supported by Google Identity Services but missing from React library types
									locale="vi"
									logo_alignment="center"
									prompt="select_account"
									onSuccess={async (credentialResponse) => {
										if (credentialResponse.credential) {
											try {
												const toastId = toast.loading(
													"Đang đăng nhập bằng Google...",
												);
												const res = await authService.loginWithGoogle(
													credentialResponse.credential,
												);
												if (res.isNewUser) {
													toast.dismiss(toastId);
													// Redirect to register with email and fullname
													router.push(
														`${soulFlowRoutes.register}?email=${encodeURIComponent(res.email)}&fullname=${encodeURIComponent(res.fullname)}`,
													);
												} else {
													const userName =
														res.fullName?.slice(0, res.fullName.indexOf(" ")) ||
														res.username ||
														"User";
													setUser(res);
													toast.success(
														`Đăng nhập Google thành công! Chào mừng ${userName}!`,
														{ id: toastId },
													);
													if (callbackUrl) {
														router.push(callbackUrl);
													} else {
														router.push(soulFlowRoutes.home);
													}
												}
											} catch (_err) {
												toast.error("Đăng nhập Google thất bại!");
											}
										}
									}}
									onError={() => {
										toast.error("Đăng nhập Google thất bại!");
									}}
								/>
							</div>
						</div>
					</form>

					{/* Footer liên kết sang Đăng ký */}
					<footer className="text-center pt-4 border-t border-outline-variant/40">
						<p className="font-sans text-xs text-secondary/80 font-light">
							Chưa có tài khoản?{" "}
							<button
								type="button"
								onClick={() =>
									router.push(
										`${soulFlowRoutes.register}${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`,
									)
								}
								className="font-semibold text-primary hover:underline hover:cursor-pointer underline-offset-4 decoration-primary/30 transition-all ml-1 text-xs"
							>
								Tạo Tài Khoản
							</button>
						</p>
					</footer>
				</div>

				{/* Trang trí thực vật cổ điển mờ ảo góc dưới bên phải */}
				<div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none select-none text-primary transform rotate-12">
					<Flower size={240} className="stroke-[1.5]" />
				</div>
			</section>
		</div>
	);
}
