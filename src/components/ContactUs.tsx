"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axiosClient from "@/services/axiosClient";
import { useAuthStore } from "@/store/auth-store";
import {
	type ContactFormValues,
	contactValidator,
} from "../validations/contact.validator";

export function ContactUs() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactValidator),
	});

	const { user } = useAuthStore();

	useEffect(() => {
		if (user) {
			reset({
				name: user.fullName || "",
				email: user.email || "",
				tel: user.phone || "",
			});
		}
	}, [user, reset]);

	// Xử lý gửi Form Liên hệ
	const onSubmit = async (data: ContactFormValues) => {
		try {
			// Cấu trúc JSON chuẩn cho Discord
			const discordPayload = {
				embeds: [
					{
						title: "Thông Báo User Gửi Contact",
						description:
							"Một khách hàng vừa gửi biểu mẫu liên hệ, dưới đây là thông tin chi tiết:",
						color: 12884867,
						fields: [
							{
								name: "Họ Tên Khách Hàng",
								value: data.name,
							},
							{
								name: "Email",
								value: data.email,
								inline: true,
							},
							{
								name: "Số điện thoại",
								value: data.tel,
								inline: true,
							},
							{
								name: "Nội dung lời nhắn",
								value: data.msg,
							},
						],
					},
				],
				attachments: [],
			};

			// Gọi lên Backend, Backend sẽ tự đẩy qua Discord
			await axiosClient.post("/notify/contact", discordPayload);

			toast.success("Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ lại sớm.");
			reset(); // Reset form sau khi gửi thành công
		} catch (error) {
			console.error("Lỗi khi gửi thông báo:", error);
			toast.error("Gửi liên hệ thất bại, vui lòng thử lại sau!");
		}
	};

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			{/* Page Title */}
			<div className="text-center space-y-2 mb-12">
				<span className="text-sm font-bold tracking-widest text-[#C49B83] uppercase block">
					Kết nối với SouFlow
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Liên hệ với chúng tôi
				</h1>
				<p className="max-w-md mx-auto text-base text-sf-fg-muted">
					Để lại yêu cầu thiết kế, đặt câu hỏi về dịch vụ, hoặc chia sẻ phản hồi
					của bạn với chúng tôi. Chúng tôi rất mong được nghe từ bạn và sẽ phản
					hồi trong thời gian sớm nhất có thể!
				</p>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start mb-20">
				{/* Left Column - Contact Form */}
				<div className="lg:col-span-7 bg-sf-bg-elevated p-6 rounded-2xl border border-[#C49B83]/30 shadow-sm space-y-6">
					<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-[#EBE5DA] dark:border-[#C49B83]/30 pb-3">
						<Send className="h-4.5 w-4.5 text-[#C49B83]" />
						Gửi Yêu Cầu
					</h2>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1">
								<label
									htmlFor="contact-name"
									className="text-sm uppercase tracking-wider font-bold text-sf-lg"
								>
									Tên của bạn <span className="text-red-500">*</span>
								</label>
								<input
									id="contact-name"
									type="text"
									{...register("name")}
									placeholder="VD: Nguyễn Thị Hồng"
									className={`w-full text-xs rounded-lg border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors ${
										errors.name
											? "border-red-500 focus:border-red-500"
											: "border-sf-border"
									}`}
								/>
								{errors.name && (
									<span className="text-red-500 text-[11px] mt-1 block">
										{errors.name.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label
									htmlFor="contact-email"
									className="text-sm uppercase tracking-wider font-bold text-sf-lg"
								>
									Địa chỉ Email <span className="text-red-500">*</span>
								</label>
								<input
									id="contact-email"
									type="text"
									{...register("email")}
									placeholder="your.email@example.com"
									className={`w-full text-xs rounded-lg border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors ${
										errors.email
											? "border-red-500 focus:border-red-500"
											: "border-sf-border"
									}`}
								/>
								{errors.email && (
									<span className="text-red-500 text-[11px] mt-1 block">
										{errors.email.message}
									</span>
								)}
							</div>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="contact-phone"
								className="text-sm uppercase tracking-wider font-bold text-sf-lg"
							>
								Số Điện Thoại <span className="text-red-500">*</span>
							</label>
							<input
								id="contact-phone"
								type="text"
								{...register("tel")}
								placeholder="0912345678"
								className={`w-full text-xs rounded-lg border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors ${
									errors.tel
										? "border-red-500 focus:border-red-500"
										: "border-sf-border"
								}`}
							/>
							{errors.tel && (
								<span className="text-red-500 text-[11px] mt-1 block">
									{errors.tel.message}
								</span>
							)}
						</div>

						<div className="space-y-1">
							<label
								htmlFor="contact-message"
								className="text-sm uppercase tracking-wider font-bold text-sf-lg"
							>
								Chúng tôi có thể giúp gì cho bạn?{" "}
								<span className="text-red-500">*</span>
							</label>
							<textarea
								id="contact-message"
								rows={4}
								{...register("msg")}
								placeholder="Mô tả không gian thiết kế, chủ đề hôn lễ, hoặc yêu cầu về bảng màu hoa..."
								className={`w-full text-xs rounded-xl border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors resize-none ${
									errors.msg
										? "border-red-500 focus:border-red-500"
										: "border-sf-border"
								}`}
							/>
							{errors.msg && (
								<span className="text-red-500 text-[11px] mt-1 block">
									{errors.msg.message}
								</span>
							)}
						</div>

						<div className="flex items-center justify-between pt-2">
							<button
								id="contact-submit-btn"
								type="submit"
								disabled={isSubmitting}
								className="rounded-lg bg-amber-500 text-sf-lg hover:bg-[#C49B83] dark:hover:bg-[#C49B83] disabled:opacity-50 text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
							>
								{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu"}
							</button>
						</div>
					</form>
				</div>

				{/* Right Column - Studio Info coordinates */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#C49B83]/30 text-sf-fg space-y-6 shadow-md">
						<h3 className="font-serif text-lg font-bold text-sf-fg">
							Thông Tin Liên Hệ & Địa Chỉ
						</h3>

						<div className="space-y-4 text-xs font-light">
							<div className="flex items-start gap-3">
								<MapPin className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Cửa Hàng SouFlow
									</p>
									<p className="text-sf-fg text-[17px] leading-relaxed mt-0.5">
										Tòa nhà QTSC 9, Công viên phần mềm Quang Trung, Quận 12,
										Thành phố Hồ Chí Minh
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Phone className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Liên Hệ Hỗ Trợ Khách Hàng
									</p>
									<p className="text-sf-fg text-[17px] mt-1">
										+84 28 3824 5678
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Mail className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Email Hỗ Trợ & Đặt Hàng
									</p>
									<p className="text-sf-fg text-[17px] mt-1">
										contact.souflow@gmail.com
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Clock className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sm text-sf-fg uppercase tracking-wider">
										Giờ Mở Cửa
									</p>
									<p className="text-sf-fg text-[16px] leading-relaxed mt-0.5">
										T2 – T7: 08:00 AM – 08:30 PM
									</p>
									<p className="text-sf-fg-muted font-bold leading-relaxed mt-0.5">
										Chủ Nhật: 10:00 AM – 06:00 PM (Đặt hẹn trước để được phục vụ
										tốt nhất)
									</p>
								</div>
							</div>
						</div>

						{/* Bản đồ nhúng Google Maps trực quan */}
						<div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#C49B83]/30 shadow-md group">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d692.6899093231182!2d106.62639276160782!3d10.853653643009181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a20d8555e69%3A0x743b1e9558fb89e0!2sQTSC%209%20Building!5e0!3m2!1svi!2s!4v1782786735429!5m2!1svi!2s"
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen={true}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="SouFlow Atelier Map"
								className="h-full w-full object-cover transition-all duration-300 dark:invert-90 dark:hue-rotate-180"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
