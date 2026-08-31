"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, ArrowRight, KeyRound, Mail, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import type { District, Ward } from "@/types/location.type";
import { encodeAddress } from "@/utils/addressUtils";
import {
	type RegisterFormData,
	registerValidator,
} from "@/validations/auth.validator";

export function RegisterScreen() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || searchParams.get("redirect");
	const defaultEmail = searchParams.get("email") || "";
	const defaultFullName = searchParams.get("fullname") || "";
	const setUser = useAuthStore((state) => state.setUser);

	const [step, setStep] = useState<"FORM" | "OTP">("FORM");
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [resendTimer, setResendTimer] = useState(60);
	const [isVerifying, setIsVerifying] = useState(false);
	const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);

	const {
		register,
		watch,
		handleSubmit: handleFormSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerValidator),
		defaultValues: {
			username: defaultEmail ? defaultEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") : "",
			email: defaultEmail,
			password: "",
			confirmPassword: "",
			phoneNumber: "",
			fullName: defaultFullName,
			street: "",
			ward: "",
			district: "",
			city: "",
		},
	});

	const [capsLockOn, setCapsLockOn] = useState(false);

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.getModifierState("CapsLock")) {
			setCapsLockOn(true);
		} else {
			setCapsLockOn(false);
		}
	};

	// Countdown timer for OTP resend
	useEffect(() => {
		if (step !== "OTP" || resendTimer <= 0) return;
		const interval = setInterval(() => {
			setResendTimer((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [step, resendTimer]);

	const { locationData } = useLocationStore();

	// Watch city & district để render
	const watchCity = watch("city");
	const watchDistrict = watch("district");

	const onSubmit = async (data: RegisterFormData) => {
		try {
			// Resolve names for encodeAddress based on selected codes
			const cityObj = locationData.find(
				(c) => String(c.code) === String(data.city),
			);
			const cityName = cityObj ? cityObj.name : data.city;

			const distList = cityObj?.districts || [];
			const distObj = distList.find(
				(d: District) => String(d.code) === String(data.district),
			);
			const districtName = distObj ? distObj.name || distObj : data.district;

			const wardList = distObj?.wards || [];
			const wardObj = wardList.find(
				(w: Ward) => String(w.code) === String(data.ward),
			);
			const wardName = wardObj ? wardObj.name || wardObj : data.ward;

			const finalAddress = encodeAddress(
				data.street,
				String(wardName),
				String(districtName),
				String(cityName),
			);

			const payload = {
				username: data.username,
				email: data.email,
				password: data.password,
				phone: data.phoneNumber,
				fullname: data.fullName,
				address: finalAddress,
			};

			const toastId = toast.loading("Đang gửi mã xác thực OTP về email...");
			await authService.sendRegisterOtp(payload);
			toast.dismiss(toastId);
			toast.success(`Mã xác thực OTP đã được gửi đến ${data.email}!`, { duration: 4000 });

			setPendingPayload(payload);
			setRegisteredEmail(data.email);
			setStep("OTP");
			setResendTimer(60);
		} catch (error: unknown) {
			toast.dismiss(toastId);
			let errMsg = "Không thể gửi mã OTP. Vui lòng thử lại.";
			if (axios.isAxiosError(error)) {
				errMsg =
					error.response?.data?.message ||
					error.response?.data?.error ||
					(typeof error.response?.data === "string" ? error.response.data : "") ||
					errMsg;
			} else if (error instanceof Error) {
				errMsg = error.message;
			}
			toast.error(errMsg, { duration: 5000 });
		}
	};

	const handleResendOtp = async () => {
		if (resendTimer > 0 || !pendingPayload) return;
		const toastId = toast.loading("Đang gửi lại mã OTP...");
		try {
			await authService.sendRegisterOtp(pendingPayload);
			toast.dismiss(toastId);
			toast.success(`Đã gửi lại mã OTP đến ${registeredEmail}!`, { duration: 4000 });
			setResendTimer(60);
		} catch (error: unknown) {
			toast.dismiss(toastId);
			let errMsg = "Lỗi khi gửi lại OTP.";
			if (axios.isAxiosError(error)) {
				errMsg =
					error.response?.data?.message ||
					error.response?.data?.error ||
					(typeof error.response?.data === "string" ? error.response.data : "") ||
					errMsg;
			} else if (error instanceof Error) {
				errMsg = error.message;
			}
			toast.error(errMsg, { duration: 5000 });
		}
	};

	const handleVerifyOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		const cleanOtp = otp.trim();
		if (!cleanOtp || cleanOtp.length !== 6) {
			toast.error("Vui lòng nhập đủ 6 chữ số OTP!");
			return;
		}

		setIsVerifying(true);
		const toastId = toast.loading("Đang xác thực tài khoản...");
		try {
			const userData = await authService.verifyRegisterOtp(registeredEmail, cleanOtp);
			setUser(userData);
			const userName =
				userData.fullName?.slice(0, userData.fullName.indexOf(" ")) ||
				userData.username ||
				"Quý Khách";
			toast.dismiss(toastId);
			toast.success(`Đăng ký thành công! Chào mừng ${userName} đến với SouFlow!`, { duration: 4000 });

			setTimeout(() => {
				router.push(callbackUrl || soulFlowRoutes.home);
			}, 800);
		} catch (error: unknown) {
			toast.dismiss(toastId);
			let errMsg = "Mã OTP không hợp lệ hoặc đã hết hạn!";
			if (axios.isAxiosError(error)) {
				errMsg =
					error.response?.data?.message ||
					error.response?.data?.error ||
					(typeof error.response?.data === "string" ? error.response.data : "") ||
					errMsg;
			} else if (error instanceof Error) {
				errMsg = error.message;
			}
			toast.error(errMsg, { duration: 5000 });
		} finally {
			setIsVerifying(false);
		}
	};

	const onError = () => {
		toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
	};

	return (
		<div className="w-full min-h-[85vh] bg-sf-bg flex items-center justify-center p-4 sm:p-6 lg:p-10">
			<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
				{/* Cột Trái: Nội dung Editorial (Ẩn trên mobile, chỉ hiện trên desktop) */}
				<section className="hidden lg:block lg:col-span-6 space-y-6">
					<div className="space-y-3">
						<span className="text-sf-accent font-bold text-xs uppercase tracking-[0.3em] block">
							Bắt đầu hành trình của bạn với SouFlow
						</span>
						<h1 className="font-serif text-4xl lg:text-5xl font-light text-sf-fg leading-tight select-none">
							Nơi những loài <br />
							<span className="font-semibold italic text-sf-accent">Hoa</span> Kể
							Chuyện.
						</h1>
						<p className="font-sans text-sm sm:text-base text-sf-fg-muted max-w-md leading-relaxed font-light">
							Tại SouFlow, chúng tôi tin rằng mỗi bông hoa đều có một câu chuyện
							để kể. Hãy cùng chúng tôi khám phá vẻ đẹp của thiên nhiên và tạo nên
							những kỷ niệm đáng nhớ qua từng cánh hoa.
						</p>
					</div>

					{/* Khung ảnh Nghệ thuật Ranunculus nổi bật */}
					<div className="relative group max-w-md">
						<div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-sf-border transform transition-transform duration-700 hover:scale-[1.01]">
							<Image
								className="w-full h-full object-cover"
								src="/images/register-image.png"
								alt="High-end Ranunculus Close-up"
								referrerPolicy="no-referrer"
								fill
								sizes="(max-width: 1200px) 50vw, 33vw"
								priority
							/>
						</div>
					</div>
				</section>

				{/* Cột Phải: Form Đăng ký */}
				<section className="col-span-1 lg:col-span-6 w-full max-w-xl mx-auto">
					<div className="p-6 sm:p-10 rounded-2xl border border-sf-border shadow-xl relative overflow-hidden bg-sf-bg-elevated">
						{step === "OTP" ? (
							<div>
								<div className="text-center mb-6">
									<div className="h-14 w-14 rounded-2xl bg-sf-accent/15 border border-sf-accent/30 text-sf-accent flex items-center justify-center mx-auto mb-4 shadow-xs">
										<Mail className="h-7 w-7" />
									</div>
									<h2 className="font-serif text-2xl sm:text-3xl font-normal text-sf-fg mb-2">
										Xác Thực Mã OTP
									</h2>
									<p className="font-sans text-xs sm:text-sm text-sf-fg-muted leading-relaxed max-w-md mx-auto">
										Mã xác thực 6 chữ số đã được gửi đến hộp thư:{" "}
										<span className="font-semibold text-sf-fg">{registeredEmail}</span>
									</p>
								</div>

								<form onSubmit={handleVerifyOtp} className="space-y-6">
									<div className="space-y-2">
										<label
											htmlFor="otp-input"
											className="text-[10px] uppercase tracking-widest font-bold text-secondary block text-center"
										>
											Nhập 6 Chữ Số OTP
										</label>
										<div className="relative flex items-center justify-center">
											<KeyRound className="absolute left-4 w-5 h-5 text-sf-accent pointer-events-none" />
											<input
												id="otp-input"
												type="text"
												inputMode="numeric"
												maxLength={6}
												autoFocus
												placeholder="------"
												value={otp}
												onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
												className="w-full bg-sf-bg border border-sf-border rounded-xl py-3.5 pl-12 pr-4 text-center font-mono text-2xl tracking-[0.4em] font-bold text-sf-fg focus:border-sf-accent focus:ring-1 focus:ring-sf-accent transition-all outline-none"
												required
											/>
										</div>
										<p className="text-[11px] text-center text-sf-fg-muted mt-1">
											Mã OTP có hiệu lực trong vòng <b className="text-sf-fg">5 phút</b>.
										</p>
									</div>

									<div className="space-y-3 pt-2">
										<button
											type="submit"
											disabled={isVerifying || otp.length !== 6}
											className="w-full py-3.5 bg-sf-accent hover:bg-[#c3632b] disabled:opacity-50 text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
										>
											{isVerifying ? (
												<span>ĐANG XÁC THỰC...</span>
											) : (
												<>
													<span>Xác Nhận & Hoàn Tất</span>
													<ArrowRight className="w-4 h-4" />
												</>
											)}
										</button>

										<div className="flex items-center justify-between text-xs pt-2">
											<button
												type="button"
												onClick={() => setStep("FORM")}
												className="flex items-center gap-1.5 text-sf-fg-muted hover:text-sf-fg transition-colors cursor-pointer"
											>
												<ArrowLeft className="w-3.5 h-3.5" />
												<span>Sửa thông tin</span>
											</button>

											<button
												type="button"
												disabled={resendTimer > 0}
												onClick={handleResendOtp}
												className={`flex items-center gap-1.5 font-medium transition-colors ${
													resendTimer > 0
														? "text-sf-fg-muted/60 cursor-not-allowed"
														: "text-sf-accent hover:underline cursor-pointer"
												}`}
											>
												<RefreshCw className="w-3.5 h-3.5" />
												<span>
													{resendTimer > 0 ? `Gửi lại mã (${resendTimer}s)` : "Gửi lại mã OTP"}
												</span>
											</button>
										</div>
									</div>
								</form>
							</div>
						) : (
							<>
								<div className="mb-6">
									<h2 className="font-serif text-2xl sm:text-3xl font-light text-sf-fg mb-2">
										Tạo Tài Khoản Mới
									</h2>
									<p className="font-sans text-xs sm:text-sm text-sf-fg-muted font-light leading-relaxed">
										Chúng tôi rất vui được chào đón bạn đến với cộng đồng SouFlow! Hãy
										điền thông tin bên dưới để bắt đầu hành trình cùng chúng tôi.
									</p>
								</div>

								<form
									className="space-y-6"
									onSubmit={handleFormSubmit(onSubmit, onError)}
								>
						<div className="space-y-5">
							{/* fullname */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-name"
								>
									Họ và Tên
								</label>
								<input
									id="reg-name"
									type="text"
									placeholder="Evelyn Rose"
									{...register("fullName")}
									readOnly={!!defaultFullName}
									className={`w-full border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg ${defaultFullName ? "bg-white/10 opacity-70 cursor-not-allowed" : "bg-white/5"}`}
									required
								/>
								{errors.fullName && (
									<p className="text-red-500 text-xs mt-1">
										{errors.fullName.message}
									</p>
								)}
							</div>

							{/* Địa chỉ Email */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-email"
								>
									Địa chỉ Email
								</label>
								<input
									id="reg-email"
									type="email"
									placeholder="evelyn@example.com"
									{...register("email")}
									readOnly={!!defaultEmail}
									className={`w-full border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg ${defaultEmail ? "bg-white/10 opacity-70 cursor-not-allowed" : "bg-white/5"}`}
									required
								/>
								{errors.email && (
									<p className="text-red-500 text-xs mt-1">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Số Điện Thoại */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-phone"
								>
									Số Điện Thoại
								</label>
								<input
									id="reg-phone"
									type="tel"
									placeholder="090 123 4567"
									{...register("phoneNumber")}
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
									required
								/>
								{errors.phoneNumber && (
									<p className="text-red-500 text-xs mt-1">
										{errors.phoneNumber.message}
									</p>
								)}
							</div>

							{/* username */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-username"
								>
									Tên Người Dùng (Username)
								</label>
								<input
									id="reg-username"
									type="text"
									placeholder="evelyn_rose"
									{...register("username")}
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
									required
								/>
								{errors.username && (
									<p className="text-red-500 text-xs mt-1">
										{errors.username.message}
									</p>
								)}
							</div>

							{/* Address: 4 Fields */}
							<div className="space-y-4 border-outline-variant/30 pt-4 mt-2">
								<h3 className="text-xs uppercase tracking-widest font-bold text-sf-fg">
									Địa chỉ giao hàng
								</h3>

								<div className="space-y-1.5">
									<label
										className="text-[10px] uppercase tracking-widest font-bold text-secondary"
										htmlFor="reg-street"
									>
										Số nhà, Tên đường
									</label>
									<input
										id="reg-street"
										type="text"
										placeholder="12/A, Hẻm 4, Lê Lợi"
										{...register("street")}
										className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
										required
									/>
									{errors.street && (
										<p className="text-red-500 text-xs mt-1">
											{errors.street.message}
										</p>
									)}
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<div className="space-y-1.5">
										<label
											htmlFor="register-city"
											className="text-[10px] uppercase tracking-widest font-bold text-secondary"
										>
											Tỉnh/Thành phố
										</label>
										<select
											id="register-city"
											{...register("city")}
											className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none text-sf-fg"
											required
										>
											<option value="" className="text-black">
												Chọn Tỉnh/Thành phố
											</option>
											{(locationData || []).map((c) => (
												<option
													key={c.code}
													value={c.code}
													className="text-black"
												>
													{c.name}
												</option>
											))}
										</select>
										{errors.city && (
											<p className="text-red-500 text-xs mt-1">
												{errors.city.message}
											</p>
										)}
									</div>

									<div className="space-y-1.5">
										<label
											htmlFor="register-district"
											className="text-[10px] uppercase tracking-widest font-bold text-secondary"
										>
											Quận/Huyện
										</label>
										<select
											id="register-district"
											{...register("district")}
											className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none text-sf-fg"
											required
										>
											<option value="" className="text-black">
												Chọn Quận/Huyện
											</option>
											{/* Lấy selected city thông qua register() - sẽ được fix trong render */}
											{locationData
												?.find((c) => String(c.code) === String(watchCity))
												?.districts?.map((d: District) => (
													<option
														key={d.code}
														value={d.code}
														className="text-black"
													>
														{d.name}
													</option>
												))}
										</select>
										{errors.district && (
											<p className="text-red-500 text-xs mt-1">
												{errors.district.message}
											</p>
										)}
									</div>
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="register-ward"
										className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									>
										Phường/Xã
									</label>
									<select
										id="register-ward"
										{...register("ward")}
										className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none text-sf-fg"
										required
									>
										<option value="" className="text-black">
											Chọn Phường/Xã
										</option>
										{locationData
											?.find((c) => String(c.code) === String(watchCity))
											?.districts?.find(
												(d: District) =>
													String(d.code) === String(watchDistrict) ||
													d.name === watchDistrict,
											)
											?.wards?.map((w: Ward) => (
												<option
													key={w.code}
													value={w.code}
													className="text-black"
												>
													{w.name}
												</option>
											))}
									</select>
									{errors.ward && (
										<p className="text-red-500 text-xs mt-1">
											{errors.ward.message}
										</p>
									)}
								</div>
							</div>

							{/* Password Fields */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<div className="space-y-1.5">
									<label
										className="text-[10px] uppercase tracking-widest font-bold text-secondary"
										htmlFor="reg-password"
									>
										Mật khẩu
									</label>
									<input
										id="reg-password"
										type="password"
										placeholder="••••••••"
										{...register("password")}
										onKeyUp={handleKeyUp}
										className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
										required
									/>
									{errors.password && (
										<p className="text-red-500 text-xs mt-1">
											{errors.password.message}
										</p>
									)}
								</div>
								<div className="space-y-1.5">
									<label
										className="text-[10px] uppercase tracking-widest font-bold text-secondary"
										htmlFor="reg-confirm"
									>
										Xác nhận Mật khẩu
									</label>
									<input
										id="reg-confirm"
										type="password"
										placeholder="••••••••"
										{...register("confirmPassword")}
										onKeyUp={handleKeyUp}
										className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
										required
									/>
									{errors.confirmPassword && (
										<p className="text-red-500 text-xs mt-1">
											{errors.confirmPassword.message}
										</p>
									)}
								</div>
							</div>

							{capsLockOn && (
								<div className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md font-semibold mt-2">
									⚠️ Cảnh báo: Caps Lock đang bật!
								</div>
							)}
						</div>

						{/* Điều hướng nhận thư Bản tin */}
						{/* <div className="flex items-start gap-3 pt-2">
							<div className="flex h-5 items-center">
								<input
									id="newsletter"
									name="newsletter"
									type="checkbox"
									{...register("newsletter")}
									className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer"
								/>
							</div>
							<div className="text-xs">
								<label
									className="text-secondary font-medium cursor-pointer"
									htmlFor="newsletter"
								>
									Đăng ký nhận bản tin để nhận cảm hứng từ hoa
								</label>
								<p className="text-secondary/60 text-[11px] font-light mt-0.5">
									Nhận những mẹo về thực vật và quyền truy cập sớm vào các bộ
									sưu tập mới.
								</p>
							</div>
						</div> */}

						{/* Nút Đăng ký */}
						<div className="pt-2">
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full py-3.5 bg-primary bg-[#be754b] hover:bg-[#c3632b] text-sf-fg text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-login hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2"
							>
								{isSubmitting ? (
									<span>ĐANG ĐĂNG KÝ...</span>
								) : (
									<>
										<span>Tạo Tài Khoản</span>
										<ArrowRight className="w-3.5 h-3.5" />
									</>
								)}
							</button>
						</div>
					</form>

					{/* Quay lại Đăng nhập */}
					<div className="mt-8 pt-6 border-t border-outline-variant/40 text-center">
						<p className="font-sans text-xs text-secondary/80 font-light">
							Đã là một phần của thế giới của chúng tôi?{" "}
							<button
								type="button"
								onClick={() =>
									router.push(
										`${soulFlowRoutes.login}${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`,
									)
								}
								className="text-primary font-semibold hover:underline hover:cursor-pointer decoration-primary/30 underline-offset-4 transition-all"
							>
								Đăng nhập tại đây
							</button>
						</p>
					</div>
				</>
			)}
		</div>
	</section>
		</div>
	</div>
);
}
