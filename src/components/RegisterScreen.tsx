"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { authService } from "@/services/authService";
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
	const callbackUrl = searchParams.get("callbackUrl");
	const defaultEmail = searchParams.get("email") || "";
	const defaultFullName = searchParams.get("fullname") || "";

	const {
		register,
		watch,
		handleSubmit: handleFormSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerValidator),
		defaultValues: {
			username: defaultEmail,
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

			await authService.register(payload);
			toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
			setTimeout(() => {
				router.push(
					`${soulFlowRoutes.login}${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`,
				);
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
						Bắt đầu hành trình của bạn với SouFlow
					</span>
					<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-sf-heading leading-tight select-none">
						Nơi những loài <br />
						<span className="font-bold italic text-primary">Hoa</span> Kể
						Chuyện.
					</h1>
					<p className="font-sans text-sm sm:text-base text-secondary/80 max-w-md mx-auto lg:mx-0 leading-relaxed font-light">
						Tại SouFlow, chúng tôi tin rằng mỗi bông hoa đều có một câu chuyện
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
							Chúng tôi rất vui được chào đón bạn đến với cộng đồng SouFlow! Hãy
							điền thông tin bên dưới để bắt đầu hành trình khám phá vẻ đẹp của
							thiên nhiên cùng chúng tôi.
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
									Tên Người Dùng
								</label>
								<input
									id="reg-username"
									type="text"
									placeholder="evelyn_rose"
									{...register("username")}
									readOnly={!!defaultEmail}
									className={`w-full border-0 border-b border-outline-variant/60 py-2.5 px-0 text-sm focus:border-primary transition-all focus:outline-none placeholder-secondary/30 text-sf-fg ${defaultEmail ? "bg-white/10 opacity-70 cursor-not-allowed" : "bg-white/5"}`}
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
				</div>
			</section>
		</div>
	);
}
