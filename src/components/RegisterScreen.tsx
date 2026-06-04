"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/soulflow/routes";
import { authService } from "@/services/authService";
import {
	type RegisterFormData,
	registerValidator,
} from "@/validations/auth.validator";

export function RegisterScreen() {
	const router = useRouter();
	const {
		register,
		handleSubmit: handleFormSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerValidator),
		defaultValues: {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			phone: "",
			fullName: "",
			address: "",
		},
	});

	const onSubmit = async (data: RegisterFormData) => {
		try {
			await authService.register(data);
			toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
			setTimeout(() => {
				router.push(soulFlowRoutes.login);
			}, 1000);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message ||
						"Đăng ký thất bại. Vui lòng thử lại.",
				);
			} else if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
			}
		}
	};
	const onError = () => {
		toast.error("Vui lòng kiểm tra lại thông tin đã nhập.");
	};

	return (
		<div className="w-full min-h-[85vh] md:min-h-175 bg-sf-bg-elevated grid grid-cols-1 lg:grid-cols-12 gap-12 items-center p-4 sm:p-6 md:p-8">
			{/* Cột Trái: Nội dung Editorial (Màn Hình 2) */}
			<section className="lg:col-span-6 space-y-8 text-center lg:text-left ml-30 mb-60">
				<div className="space-y-4">
					<span className="text-primary font-semibold text-xs uppercase tracking-[0.3em] block">
						Bắt đầu hành trình của bạn với SoulFlow
					</span>
					<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-sf-heading leading-tight select-none">
						Nơi những loài <br />
						<span className="font-bold italic text-primary">Hoa</span> Kể
						Chuyện.
					</h1>
					<p className="font-sans text-sm sm:text-base text-secondary/80 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
						Tại SoulFlow, chúng tôi tin rằng mỗi bông hoa đều có một câu chuyện
						để kể. Hãy cùng chúng tôi khám phá vẻ đẹp của thiên nhiên và tạo nên
						những kỷ niệm đáng nhớ qua từng cánh hoa.
					</p>
				</div>

				{/* Khung ảnh Nghệ thuật Ranunculus nổi bật */}
				<div className="relative group mt-8 hidden lg:block max-w-md mx-auto lg:mx-0">
					<div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-outline-variant/40 transform transition-transform duration-700 hover:scale-[1.01]">
						<Image
							className="w-full h-full object-cover"
							src="/images/register-image.png"
							alt="High-end Ranunculus Close-up"
							referrerPolicy="no-referrer"
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							priority
						/>
					</div>
				</div>
			</section>

			{/* Cột Phải: Form Đăng ký */}
			<section className="lg:col-span-6 bg-sf-bg-elevated xl:col-start-8 xl:col-span-5">
				<div className="glass-panel p-8 sm:p-12 rounded-2xl border-2 border-outline-variant/30  border-[#C49B83]/30 shadow-xl relative overflow-hidden bg-sf-bg-elevated">
					<div className="mb-8">
						<h2 className="font-serif text-3xl font-light text-sf-heading mb-2">
							Tạo Tài Khoản Mới
						</h2>
						<p className="font-sans text-base text-secondary/80 text-sf-fg font-light">
							Chúng tôi rất vui được chào đón bạn đến với cộng đồng SoulFlow!
							Hãy điền thông tin bên dưới để bắt đầu hành trình khám phá vẻ đẹp
							của thiên nhiên cùng chúng tôi.
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
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
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
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
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
									{...register("phone")}
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
									required
								/>
								{errors.phone && (
									<p className="text-red-500 text-xs mt-1">
										{errors.phone.message}
									</p>
								)}
							</div>

							{/* username */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-username"
								>
									Tên Người Dùng
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

							{/* Address */}
							<div className="space-y-1.5">
								<label
									className="text-[10px] uppercase tracking-widest font-bold text-secondary"
									htmlFor="reg-address"
								>
									Địa chỉ giao hàng
								</label>
								<input
									id="reg-address"
									type="text"
									placeholder="123 Flower St, District 1"
									{...register("address")}
									className="w-full bg-white/5 border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg"
									required
								/>
								{errors.address && (
									<p className="text-red-500 text-xs mt-1">
										{errors.address.message}
									</p>
								)}
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
								onClick={() => router.push(soulFlowRoutes.login)}
								className="text-primary font-semibold hover:underline hover:cursor-pointer decoration-primary/30 underline-offset-4 transition-all"
							>
								Đăng nhập tại đây
							</button>
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
