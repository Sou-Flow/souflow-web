"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosClient from "@/services/axiosClient";
import { useAuthStore } from "@/store/auth-store";
import {
	type CustomOrderFormValues,
	customOrderValidator,
} from "@/validations/customOrder.validator";

interface CustomOrderPopupProps {
	isOpen: boolean;
	onClose: () => void;
	productName?: string;
	productCode?: string;
}

export function CustomOrderPopup({
	isOpen,
	onClose,
	productName,
	productCode,
}: CustomOrderPopupProps) {
	const { user } = useAuthStore();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CustomOrderFormValues>({
		resolver: zodResolver(customOrderValidator),
		defaultValues: {
			fullName: "",
			phone: "",
			address: "",
			description: "",
		},
	});

	useEffect(() => {
		if (isOpen && user) {
			reset({
				fullName: user.fullName || "",
				phone: user.phone || "",
				address: user.address ? user.address.split("||").join(", ") : "",
				description: "",
			});
		}
	}, [isOpen, user, reset]);

	if (!isOpen) return null;

	const onSubmit = async (data: CustomOrderFormValues) => {
		try {
			const discordPayload = {
				content: null,
				embeds: [
					{
						title: "Thông Báo Người Dùng Gửi Yêu Cầu",
						description:
							"Một khách hàng muốn đặt hoa theo yêu cầu, dưới đây là thông tin chi tiết:",
						color: null,
						fields: [
							{
								name: "Mẫu tham khảo:",
								value: productName || "Không có",
								inline: true,
							},
							{
								name: "Mã sản phẩm:",
								value: productCode || "Không có",
								inline: true,
							},
							{
								name: "Username:",
								value: user?.username || "Không rõ",
							},
							{
								name: "Họ và tên:",
								value: data.fullName,
								inline: true,
							},
							{
								name: "Số điện thoại:",
								value: data.phone,
								inline: true,
							},
							{
								name: "Địa chỉ:",
								value: data.address,
							},
							{
								name: "Nội Dung:",
								value: data.description,
							},
						],
					},
				],
				attachments: [],
			};

			await axiosClient.post("/notify/custom-order", discordPayload);

			toast.success("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ lại sớm.");
			reset();
			onClose();
		} catch (error) {
			console.error("Lỗi khi gửi yêu cầu:", error);
			toast.error("Gửi yêu cầu thất bại, vui lòng thử lại sau!");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
			<div className="bg-sf-bg-elevated w-full max-w-lg rounded-2xl border border-sf-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				<div className="p-5 border-b border-sf-border flex justify-between items-center bg-sf-surface">
					<h3 className="font-serif text-lg font-semibold text-sf-fg">
						Đặt hoa theo yêu cầu
					</h3>
					<button
						type="button"
						onClick={onClose}
						disabled={isSubmitting}
						className="p-1 rounded-full hover:bg-sf-bg transition-colors text-sf-fg-muted hover:text-sf-fg cursor-pointer disabled:opacity-50"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-5 overflow-y-auto max-h-[80vh] custom-scrollbar">
					{productName && (
						<div className="mb-4 text-sm text-sf-fg-muted bg-sf-surface p-3 rounded-lg border border-sf-border">
							<span className="font-semibold text-sf-fg block mb-1">
								Mẫu tham khảo:
							</span>
							{productName}
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{/* Họ và tên */}
						<div className="space-y-1">
							<label
								htmlFor="fullName"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg"
							>
								Họ và tên <span className="text-red-500">*</span>
							</label>
							<input
								id="fullName"
								type="text"
								placeholder="Nhập họ và tên"
								{...register("fullName")}
								className={`w-full rounded-xl border ${
									errors.fullName ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-4 py-3 text-sm text-sf-fg outline-none transition-colors focus:border-[#C49B83] disabled:opacity-50`}
								disabled={isSubmitting}
							/>
							{errors.fullName && (
								<p className="text-xs text-red-500">
									{errors.fullName.message}
								</p>
							)}
						</div>

						{/* Số điện thoại */}
						<div className="space-y-1">
							<label
								htmlFor="phone"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg"
							>
								Số điện thoại <span className="text-red-500">*</span>
							</label>
							<input
								id="phone"
								type="tel"
								placeholder="Nhập số điện thoại"
								{...register("phone")}
								className={`w-full rounded-xl border ${
									errors.phone ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-4 py-3 text-sm text-sf-fg outline-none transition-colors focus:border-[#C49B83] disabled:opacity-50`}
								disabled={isSubmitting}
							/>
							{errors.phone && (
								<p className="text-xs text-red-500">{errors.phone.message}</p>
							)}
						</div>

						{/* Địa chỉ */}
						<div className="space-y-1">
							<label
								htmlFor="address"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg"
							>
								Địa chỉ <span className="text-red-500">*</span>
							</label>
							<input
								id="address"
								type="text"
								placeholder="Nhập địa chỉ nhận hàng"
								{...register("address")}
								className={`w-full rounded-xl border ${
									errors.address ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-4 py-3 text-sm text-sf-fg outline-none transition-colors focus:border-[#C49B83] disabled:opacity-50`}
								disabled={isSubmitting}
							/>
							{errors.address && (
								<p className="text-xs text-red-500">{errors.address.message}</p>
							)}
						</div>

						{/* Yêu cầu */}
						<div className="space-y-1">
							<label
								htmlFor="description"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg"
							>
								Mô tả yêu cầu <span className="text-red-500">*</span>
							</label>
							<textarea
								id="description"
								rows={4}
								placeholder="Nhập chi tiết yêu cầu thay đổi (ví dụ: đổi hoa hồng đỏ thành hồng trắng, thêm lá...)"
								{...register("description")}
								className={`w-full resize-none rounded-xl border ${
									errors.description ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-4 py-3 text-sm text-sf-fg outline-none transition-colors focus:border-[#C49B83] custom-scrollbar disabled:opacity-50`}
								disabled={isSubmitting}
							/>
							{errors.description && (
								<p className="text-xs text-red-500">
									{errors.description.message}
								</p>
							)}
						</div>

						{/* Nút gửi */}
						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A1A1A] py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#C49B83] disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Đang gửi...
								</>
							) : (
								"Gửi Yêu Cầu"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
