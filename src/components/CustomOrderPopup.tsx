"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	Banknote,
	Calendar,
	Gift,
	HeartHandshake,
	Loader2,
	LogIn,
	MapPin,
	MessageSquare,
	Phone,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const BUDGET_PRESETS = [
	"500.000₫",
	"1.000.000₫",
	"1.500.000₫",
	"2.000.000₫",
	"3.000.000₫",
	"Trên 5.000.000₫",
];

const OCCASIONS = [
	"Sinh nhật",
	"Kỷ niệm / Tỏ tình",
	"Khai trương / Chúc mừng",
	"Hoa cưới / Cầm tay cô dâu",
	"Cảm ơn / Tri ân",
	"Chia buồn",
	"Dịp khác",
];

export function CustomOrderPopup({
	isOpen,
	onClose,
	productName,
	productCode,
}: CustomOrderPopupProps) {
	const { user } = useAuthStore();
	const pathname = usePathname();

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CustomOrderFormValues>({
		resolver: zodResolver(customOrderValidator),
		defaultValues: {
			fullName: "",
			phone: "",
			address: "",
			budget: "",
			occasion: "Sinh nhật",
			description: "",
		},
	});

	const currentBudget = watch("budget");

	useEffect(() => {
		if (isOpen && user) {
			reset({
				fullName: user.fullName || user.username || "",
				phone: user.phone || "",
				address: user.address ? user.address.split("||").join(", ") : "",
				budget: "",
				occasion: "Sinh nhật",
				description: "",
			});
		}
	}, [isOpen, user, reset]);

	if (!isOpen) return null;

	// Bắt buộc đăng nhập trước khi gửi yêu cầu
	if (!user) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
				<div className="bg-sf-bg-elevated w-full max-w-md rounded-2xl border border-sf-border shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
					<div className="mx-auto w-12 h-12 rounded-full bg-sf-accent/10 flex items-center justify-center text-sf-accent mb-4">
						<HeartHandshake className="w-6 h-6" />
					</div>
					<h3 className="font-serif text-lg font-semibold text-sf-fg mb-2">
						Đăng nhập để đặt hoa theo yêu cầu
					</h3>
					<p className="text-sm text-sf-fg-muted mb-6 leading-relaxed">
						Vui lòng đăng nhập tài khoản để SouFlow lưu thông tin và gọi điện tư vấn mẫu hoa thiết kế phù hợp nhất với ngân sách của bạn.
					</p>
					<div className="flex items-center justify-center gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 rounded-xl border border-sf-border text-xs font-bold uppercase tracking-wider text-sf-fg hover:bg-sf-surface transition-colors cursor-pointer"
						>
							Để sau
						</button>
						<Link
							href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
							className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sf-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-sf-accent/90 transition-colors shadow-sm cursor-pointer"
						>
							<LogIn className="w-3.5 h-3.5" />
							Đăng Nhập Ngay
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const onSubmit = async (data: CustomOrderFormValues) => {
		if (user?.roleCode === "ADMIN") {
			toast.error("Tài khoản Quản trị viên không thể gửi yêu cầu đặt hoa.");
			return;
		}
		try {
			const payload = {
				username: user.username || "",
				customerName: data.fullName,
				phone: data.phone,
				address: data.address,
				budget: data.budget,
				occasion: data.occasion || "Tùy dịp",
				note: data.description,
				productName: productName || "",
				productCode: productCode || "",
			};

			await axiosClient.post("/notify/custom-order", payload);

			toast.success(
				"Gửi yêu cầu thành công! SouFlow sẽ xem qua ngân sách và gọi điện tư vấn lại ngay cho bạn.",
				{ duration: 5000 },
			);
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
					<div className="flex items-center gap-2">
						<HeartHandshake className="w-5 h-5 text-sf-accent" />
						<h3 className="font-serif text-lg font-semibold text-sf-fg">
							Đặt hoa theo yêu cầu
						</h3>
					</div>
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
					{/* Mẫu tham khảo nếu mở từ trang chi tiết sản phẩm */}
					{productName && (
						<div className="mb-4 text-sm bg-sf-accent/5 p-3.5 rounded-xl border border-sf-accent/15 flex items-start gap-2.5">
							<Gift className="w-4 h-4 text-sf-accent mt-0.5 shrink-0" />
							<div>
								<span className="font-semibold text-sf-fg block text-xs uppercase tracking-wider">
									Mẫu hoa tham khảo:
								</span>
								<span className="text-sf-fg font-medium">
									{productName} {productCode ? `(${productCode})` : ""}
								</span>
								<p className="text-xs text-sf-fg-muted mt-0.5">
									Florist sẽ dựa theo dáng hoa này và điều chỉnh màu sắc/loại hoa theo ngân sách của bạn.
								</p>
							</div>
						</div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						{/* Họ tên & Số điện thoại */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div className="space-y-1">
								<label
									htmlFor="fullName"
									className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
								>
									<User className="w-3.5 h-3.5 text-sf-accent" />
									Họ và tên <span className="text-red-500">*</span>
								</label>
								<input
									id="fullName"
									type="text"
									placeholder="Họ tên của bạn"
									{...register("fullName")}
									className={`w-full rounded-xl border ${
										errors.fullName ? "border-red-500" : "border-sf-border"
									} bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent disabled:opacity-50`}
									disabled={isSubmitting}
								/>
								{errors.fullName && (
									<p className="text-xs text-red-500">
										{errors.fullName.message}
									</p>
								)}
							</div>

							<div className="space-y-1">
								<label
									htmlFor="phone"
									className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
								>
									<Phone className="w-3.5 h-3.5 text-sf-accent" />
									Số điện thoại <span className="text-red-500">*</span>
								</label>
								<input
									id="phone"
									type="tel"
									placeholder="Số điện thoại nhận tư vấn"
									{...register("phone")}
									className={`w-full rounded-xl border ${
										errors.phone ? "border-red-500" : "border-sf-border"
									} bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent disabled:opacity-50`}
									disabled={isSubmitting}
								/>
								{errors.phone && (
									<p className="text-xs text-red-500">{errors.phone.message}</p>
								)}
							</div>
						</div>

						{/* Ngân sách dự kiến (VND) */}
						<div className="space-y-1.5">
							<label
								htmlFor="budget"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
							>
								<Banknote className="w-3.5 h-3.5 text-sf-accent" />
								Ngân sách dự kiến (VND) <span className="text-red-500">*</span>
							</label>

							{/* Presets chọn nhanh */}
							<div className="flex flex-wrap gap-1.5 pb-1">
								{BUDGET_PRESETS.map((preset) => (
									<button
										key={preset}
										type="button"
										onClick={() => setValue("budget", preset, { shouldValidate: true })}
										className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
											currentBudget === preset
												? "bg-sf-accent text-white border-sf-accent font-semibold shadow-xs"
												: "bg-sf-surface border-sf-border text-sf-fg-muted hover:text-sf-fg hover:border-sf-accent"
										}`}
									>
										{preset}
									</button>
								))}
							</div>

							<input
								id="budget"
								type="text"
								placeholder="Nhập số tiền bạn muốn chi (Ví dụ: 1.200.000₫)"
								{...register("budget")}
								className={`w-full rounded-xl border ${
									errors.budget ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent disabled:opacity-50`}
								disabled={isSubmitting}
							/>
							{errors.budget && (
								<p className="text-xs text-red-500">{errors.budget.message}</p>
							)}
						</div>

						{/* Dịp tặng & Địa chỉ */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div className="space-y-1">
								<label
									htmlFor="occasion"
									className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
								>
									<Calendar className="w-3.5 h-3.5 text-sf-accent" />
									Dịp tặng hoa
								</label>
								<select
									id="occasion"
									{...register("occasion")}
									className="w-full rounded-xl border border-sf-border bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent disabled:opacity-50"
									disabled={isSubmitting}
								>
									{OCCASIONS.map((occ) => (
										<option key={occ} value={occ}>
											{occ}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1">
								<label
									htmlFor="address"
									className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
								>
									<MapPin className="w-3.5 h-3.5 text-sf-accent" />
									Địa chỉ giao hoa <span className="text-red-500">*</span>
								</label>
								<input
									id="address"
									type="text"
									placeholder="Quận/Huyện hoặc địa chỉ nhận"
									{...register("address")}
									className={`w-full rounded-xl border ${
										errors.address ? "border-red-500" : "border-sf-border"
									} bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent disabled:opacity-50`}
									disabled={isSubmitting}
								/>
								{errors.address && (
									<p className="text-xs text-red-500">{errors.address.message}</p>
								)}
							</div>
						</div>

						{/* Yêu cầu chi tiết & Tone màu */}
						<div className="space-y-1">
							<label
								htmlFor="description"
								className="block text-xs font-bold uppercase tracking-widest text-sf-fg flex items-center gap-1"
							>
								<MessageSquare className="w-3.5 h-3.5 text-sf-accent" />
								Chi tiết yêu cầu & Tone màu mong muốn <span className="text-red-500">*</span>
							</label>
							<textarea
								id="description"
								rows={3}
								placeholder="Ví dụ: Cần tone hồng pastel nhẹ nhàng, thêm hoa baby, hoa nở to, giao trước 9h sáng..."
								{...register("description")}
								className={`w-full resize-none rounded-xl border ${
									errors.description ? "border-red-500" : "border-sf-border"
								} bg-sf-surface px-3.5 py-2.5 text-sm text-sf-fg outline-none transition-colors focus:border-sf-accent custom-scrollbar disabled:opacity-50`}
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
							disabled={isSubmitting || user?.roleCode === "ADMIN"}
							className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sf-fg py-3.5 text-xs font-bold uppercase tracking-widest text-sf-bg transition-colors hover:bg-sf-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer shadow-md"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Đang gửi yêu cầu...
								</>
							) : user?.roleCode === "ADMIN" ? (
								"Chế độ Quản trị viên (Không hỗ trợ gửi)"
							) : (
								"Gửi Yêu Cầu Tư Vấn & Báo Giá"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
