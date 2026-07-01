"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	ArrowLeft,
	Clock,
	Eye,
	EyeOff,
	Lock,
	Mail,
	RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { authService } from "@/services/authService";

// Validation schema for Step 1: Email
const emailSchema = z.object({
	email: z
		.string()
		.min(1, "Vui lòng nhập Email")
		.email("Định dạng email không hợp lệ"),
});
type EmailFormValues = z.infer<typeof emailSchema>;

// Mật khẩu mạnh: Ít nhất 8 ký tự, có cả chữ cái và số
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

// Validation schema for Step 3: New Passwords
const newPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
			.regex(passwordRegex, "Mật khẩu phải bao gồm cả chữ cái và số"),
		confirmPassword: z.string().min(8, "Vui lòng xác nhận lại mật khẩu"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
		path: ["confirmPassword"],
	});
type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function ForgotPasswordScreen() {
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [emailSent, setEmailSent] = useState("");

	// OTP State
	const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
	const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Password State
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Form hooks
	const emailForm = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: { email: "" },
	});

	const passwordForm = useForm<NewPasswordFormValues>({
		resolver: zodResolver(newPasswordSchema),
		defaultValues: { newPassword: "", confirmPassword: "" },
	});

	// Timer Logic
	useEffect(() => {
		if (step === 2 && timeLeft > 0) {
			const timerId = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(timerId);
		}
	}, [step, timeLeft]);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s.toString().padStart(2, "0")}`;
	};

	// --- STEP 1: EMAIL SUBMIT ---
	const onEmailSubmit = async (data: EmailFormValues) => {
		const toastId = toast.loading("Đang gửi mã OTP...");
		try {
			await authService.forgotPassword(data.email);
			setEmailSent(data.email);
			setTimeLeft(300); // Reset timer
			setOtpValues(Array(6).fill(""));
			setStep(2);
			toast.success("Đã gửi mã OTP về email của bạn!", { id: toastId });
		} catch (_error) {
			toast.error("Không tìm thấy tài khoản hoặc lỗi gửi email!", {
				id: toastId,
			});
		}
	};

	// Resend OTP
	const resendOtp = async () => {
		if (timeLeft > 0) return;
		const toastId = toast.loading("Đang gửi lại mã OTP...");
		try {
			await authService.forgotPassword(emailSent);
			setTimeLeft(300);
			setOtpValues(Array(6).fill(""));
			toast.success("Đã gửi lại mã OTP!", { id: toastId });
			inputRefs.current[0]?.focus();
		} catch (_error) {
			toast.error("Lỗi gửi email!", { id: toastId });
		}
	};

	// --- STEP 2: OTP HANDLING ---
	const handleOtpChange = (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const value = e.target.value;
		if (/[^0-9]/.test(value)) return;

		const newOtpValues = [...otpValues];
		newOtpValues[index] = value.slice(-1);
		setOtpValues(newOtpValues);

		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && !otpValues[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleOtpPaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pasteData = e.clipboardData
			.getData("text")
			.replace(/[^0-9]/g, "")
			.slice(0, 6);
		if (!pasteData) return;

		const newOtpValues = [...otpValues];
		for (let i = 0; i < pasteData.length; i++) {
			newOtpValues[i] = pasteData[i];
		}
		setOtpValues(newOtpValues);

		const focusIndex = Math.min(pasteData.length, 5);
		inputRefs.current[focusIndex]?.focus();
	};

	const verifyOtp = async () => {
		if (timeLeft === 0) return;

		const otpString = otpValues.join("");
		if (otpString.length < 6) {
			toast.error("Vui lòng nhập đủ 6 số OTP");
			return;
		}

		setIsVerifyingOtp(true);
		const toastId = toast.loading("Đang xác thực OTP...");
		try {
			await authService.verifyOtp(emailSent, otpString);
			toast.success("Xác thực thành công!", { id: toastId });
			setStep(3);
		} catch (_error) {
			toast.error("Mã OTP không hợp lệ hoặc đã hết hạn!", { id: toastId });
			setOtpValues(Array(6).fill(""));
			inputRefs.current[0]?.focus();
		} finally {
			setIsVerifyingOtp(false);
		}
	};

	// Focus the first OTP input when arriving at Step 2
	useEffect(() => {
		if (step === 2) {
			inputRefs.current[0]?.focus();
		}
	}, [step]);

	// --- STEP 3: PASSWORD RESET SUBMIT ---
	const onPasswordSubmit = async (data: NewPasswordFormValues) => {
		const toastId = toast.loading("Đang đổi mật khẩu...");
		try {
			await authService.resetPassword({
				email: emailSent,
				otp: otpValues.join(""),
				newPassword: data.newPassword,
			});
			toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại!", {
				id: toastId,
			});
			router.push(soulFlowRoutes.login);
		} catch (_error) {
			toast.error("Đã xảy ra lỗi, vui lòng thử lại!", { id: toastId });
		}
	};

	return (
		<div className="w-full min-h-[85vh] md:min-h-175 bg-sf-bg rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 grid grid-cols-1 md:grid-cols-12">
			{/* BRANDING LEFT COLUMN */}
			<section className="hidden md:flex md:col-span-6 relative overflow-hidden bg-sf-bg min-h-137.5">
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
					<div className="absolute inset-0 bg-black/20 z-10" />
				</div>

				<div className="relative z-20 flex flex-col justify-between p-12 w-full text-white">
					<div>
						<span className="text-xs text-white/80 uppercase tracking-[0.2em] font-medium mb-2 block">
							Security Portal
						</span>
						<h2 className="font-serif text-5xl font-light tracking-tight mt-4">
							SouFlow
						</h2>
						<p className="font-sans text-md text-white/90 max-w-sm mt-6 italic font-light leading-relaxed">
							"An tâm lưu giữ những khoảnh khắc đẹp đẽ nhất cùng SouFlow."
						</p>
					</div>

					<div className="flex items-center gap-4">
						<span className="w-12 h-px bg-white/60 block"></span>
						<span className="font-sans text-xs uppercase tracking-[0.3em] font-medium text-white/90">
							Khôi phục tài khoản
						</span>
					</div>
				</div>
			</section>

			{/* RIGHT COLUMN: FORMS */}
			<section className="col-span-1 md:col-span-6 flex items-center justify-center p-8 sm:p-12 md:p-16 relative bg-sf-bg overflow-hidden">
				<div className="w-full max-w-md relative z-10">
					{/* Header */}
					<header className="space-y-3 mb-10">
						<h3 className="font-serif text-3xl text-sf-heading font-light">
							{step === 1 && "Quên mật khẩu?"}
							{step === 2 && "Xác nhận OTP"}
							{step === 3 && "Tạo mật khẩu mới"}
						</h3>
						<div className="font-sans text-sm text-secondary/80 leading-relaxed">
							{step === 1 &&
								"Nhập email của bạn để nhận mã OTP khôi phục mật khẩu."}
							{step === 2 && (
								<>
									Mã bảo mật gồm 6 chữ số đã được gửi đến <br />
									<span className="font-medium text-primary">{emailSent}</span>
									<div className="mt-4 flex items-center gap-1.5 justify-center sm:justify-start">
										<Clock
											className={`w-4 h-4 ${timeLeft > 0 ? "text-primary" : "text-red-500"}`}
										/>
										{timeLeft > 0 ? (
											<span>
												Mã hết hạn sau:{" "}
												<span className="font-medium text-primary">
													{formatTime(timeLeft)}
												</span>
											</span>
										) : (
											<span className="text-red-500 font-medium">
												Mã OTP đã hết hạn
											</span>
										)}
									</div>
								</>
							)}
							{step === 3 &&
								"Mã xác nhận hợp lệ. Vui lòng tạo mật khẩu mới cho tài khoản của bạn."}
						</div>
					</header>

					{/* Forms */}
					<div className="mt-8">
						{/* --- STEP 1 --- */}
						{step === 1 && (
							<form
								onSubmit={emailForm.handleSubmit(onEmailSubmit)}
								className="space-y-6"
							>
								<div className="space-y-2 group">
									<label
										htmlFor="email"
										className="block text-xs uppercase tracking-widest font-semibold text-secondary/90 transition-colors group-focus-within:text-primary"
									>
										Địa chỉ Email
									</label>
									<div className="relative flex items-center border-b border-outline-variant py-2.5 transition-colors group-focus-within:border-primary">
										<Mail className="absolute left-0 w-4 h-4 text-secondary/40 group-focus-within:text-primary transition-colors" />
										<input
											id="email"
											type="email"
											{...emailForm.register("email")}
											className="pl-8 pr-4 text-sm placeholder-secondary/30 border-0 w-full bg-transparent py-2.5 px-0 focus:border-transparent focus:outline-none focus:ring-0 text-sf-fg"
											placeholder="Nhập email của bạn"
											disabled={emailForm.formState.isSubmitting}
										/>
									</div>
									{emailForm.formState.errors.email && (
										<p className="text-xs text-red-500 mt-1">
											{emailForm.formState.errors.email.message}
										</p>
									)}
								</div>

								<button
									type="submit"
									disabled={emailForm.formState.isSubmitting}
									className="w-full py-3.5 bg-primary bg-[#be754b] hover:bg-[#c3632b] text-sf-fg text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-login hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
								>
									{emailForm.formState.isSubmitting ? (
										<span className="flex items-center gap-2">
											<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
											ĐANG GỬI...
										</span>
									) : (
										"GỬI MÃ OTP"
									)}
								</button>
							</form>
						)}

						{/* --- STEP 2 --- */}
						{step === 2 && (
							<div className="space-y-8">
								<div className="flex justify-between gap-2 sm:gap-3">
									{otpValues.map((value, index) => (
										<input
											// biome-ignore lint/suspicious/noArrayIndexKey: OTP inputs are fixed 6 slots
											key={`otp-slot-${index}`}
											ref={(el) => {
												inputRefs.current[index] = el;
											}}
											type="text"
											inputMode="numeric"
											maxLength={1}
											value={value}
											onChange={(e) => handleOtpChange(index, e)}
											onKeyDown={(e) => handleOtpKeyDown(index, e)}
											onPaste={handleOtpPaste}
											disabled={isVerifyingOtp || timeLeft === 0}
											className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-medium bg-sf-bg border ${timeLeft === 0 ? "border-red-300 bg-red-50/10" : "border-outline-variant"} focus:border-primary focus:ring-1 focus:ring-primary rounded-xl transition-all outline-none text-sf-heading shadow-sm disabled:opacity-70 disabled:cursor-not-allowed`}
										/>
									))}
								</div>

								<div className="flex gap-4">
									{timeLeft === 0 ? (
										<button
											type="button"
											onClick={resendOtp}
											className="w-full py-3.5 bg-sf-bg border border-primary text-primary hover:bg-primary/5 text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all flex items-center justify-center gap-2"
										>
											<RefreshCw className="w-4 h-4" />
											GỬI LẠI MÃ OTP
										</button>
									) : (
										<>
											<button
												type="button"
												onClick={() => setStep(1)}
												className="w-1/3 py-3.5 bg-sf-bg border border-outline-variant/60 hover:bg-outline-variant/20 text-sf-heading text-xs font-semibold uppercase tracking-[0.1em] rounded-lg transition-all flex items-center justify-center gap-2"
												disabled={isVerifyingOtp}
											>
												<ArrowLeft className="w-4 h-4" />
												QUAY LẠI
											</button>
											<button
												type="button"
												onClick={verifyOtp}
												disabled={
													isVerifyingOtp || otpValues.join("").length < 6
												}
												className="w-2/3 py-3.5 bg-primary bg-[#be754b] hover:bg-[#c3632b] text-sf-fg text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-login hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{isVerifyingOtp ? (
													<span className="flex items-center gap-2">
														<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
														ĐANG XÁC THỰC...
													</span>
												) : (
													"XÁC NHẬN OTP"
												)}
											</button>
										</>
									)}
								</div>
							</div>
						)}

						{/* --- STEP 3 --- */}
						{step === 3 && (
							<form
								onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
								className="space-y-6"
							>
								<div className="space-y-2 group">
									<label
										htmlFor="newPassword"
										className="block text-xs uppercase tracking-widest font-semibold text-secondary/90 transition-colors group-focus-within:text-primary"
									>
										Mật khẩu mới
									</label>
									<div className="relative flex items-center border-b border-outline-variant py-2.5 transition-colors group-focus-within:border-primary">
										<Lock className="absolute left-0 w-4 h-4 text-secondary/40 group-focus-within:text-primary transition-colors" />
										<input
											id="newPassword"
											type={showNewPassword ? "text" : "password"}
											{...passwordForm.register("newPassword")}
											className="pl-8 pr-10 text-sm placeholder-secondary/30 border-0 w-full bg-transparent py-2.5 px-0 focus:border-transparent focus:outline-none focus:ring-0 text-sf-fg"
											placeholder="Nhập mật khẩu mới"
											disabled={passwordForm.formState.isSubmitting}
										/>
										<button
											type="button"
											onClick={() => setShowNewPassword(!showNewPassword)}
											className="absolute right-0 text-secondary/40 hover:text-primary transition-colors"
										>
											{showNewPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</button>
									</div>
									{passwordForm.formState.errors.newPassword && (
										<p className="text-xs text-red-500 mt-1">
											{passwordForm.formState.errors.newPassword.message}
										</p>
									)}
								</div>

								<div className="space-y-2 group">
									<label
										htmlFor="confirmPassword"
										className="block text-xs uppercase tracking-widest font-semibold text-secondary/90 transition-colors group-focus-within:text-primary"
									>
										Xác nhận mật khẩu mới
									</label>
									<div className="relative flex items-center border-b border-outline-variant py-2.5 transition-colors group-focus-within:border-primary">
										<Lock className="absolute left-0 w-4 h-4 text-secondary/40 group-focus-within:text-primary transition-colors" />
										<input
											id="confirmPassword"
											type={showConfirmPassword ? "text" : "password"}
											{...passwordForm.register("confirmPassword")}
											className="pl-8 pr-10 text-sm placeholder-secondary/30 border-0 w-full bg-transparent py-2.5 px-0 focus:border-transparent focus:outline-none focus:ring-0 text-sf-fg"
											placeholder="Nhập lại mật khẩu mới"
											disabled={passwordForm.formState.isSubmitting}
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className="absolute right-0 text-secondary/40 hover:text-primary transition-colors"
										>
											{showConfirmPassword ? (
												<EyeOff className="w-4 h-4" />
											) : (
												<Eye className="w-4 h-4" />
											)}
										</button>
									</div>
									{passwordForm.formState.errors.confirmPassword && (
										<p className="text-xs text-red-500 mt-1">
											{passwordForm.formState.errors.confirmPassword.message}
										</p>
									)}
								</div>

								<button
									type="submit"
									disabled={passwordForm.formState.isSubmitting}
									className="w-full py-3.5 bg-primary bg-[#be754b] hover:bg-[#c3632b] text-sf-fg text-xs font-semibold uppercase tracking-[0.2em] rounded-lg shadow-login hover:shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
								>
									{passwordForm.formState.isSubmitting ? (
										<span className="flex items-center gap-2">
											<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
											ĐANG LƯU...
										</span>
									) : (
										"ĐỔI MẬT KHẨU"
									)}
								</button>
							</form>
						)}
					</div>

					{/* Footer link to back */}
					<footer className="text-center pt-8 mt-8 border-t border-outline-variant/40">
						<Link
							href={soulFlowRoutes.login}
							className="font-sans text-xs text-secondary/80 font-light hover:text-primary hover:underline underline-offset-4 decoration-primary/30 transition-all inline-flex items-center gap-1.5 group"
						>
							<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
							Quay lại đăng nhập
						</Link>
					</footer>
				</div>
			</section>
		</div>
	);
}
