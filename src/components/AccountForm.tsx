"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Shield, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import type { UserFE } from "@/types/auth.type";
import { decodeAddress, encodeAddress } from "@/utils/addressUtils";

interface OrderItemFE {
	product?: {
		nameVn?: string;
		nameEng?: string;
		name?: string;
		image?: string;
		price?: number;
	};
	productNameVn?: string;
	productNameEng?: string;
	productImage?: string;
	productPrice?: number;
	price?: number;
	quantity: number;
	subtotal?: number;
}

interface OrderFE {
	id: string;
	businessId?: string;
	createdDate: number[] | string;
	status: string;
	total: number;
	fullname: string;
	phoneNumber: string;
	address: string;
	paymentMethod: string;
	orderDetails?: OrderItemFE[];
	orderItems?: OrderItemFE[];
	items?: OrderItemFE[];
	details?: OrderItemFE[];
	data?: {
		details?: OrderItemFE[];
	};
}

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

	// Address State
	const { locationData } = useLocationStore();
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [ward, setWard] = useState("");

	// Decode address when user or locationData is available
	useEffect(() => {
		if (user.address && locationData && locationData.length > 0) {
			const decoded = decodeAddress(user.address, locationData);
			setStreet(decoded.street || "");
			setCity(String(decoded.cityCode) || "");
			setDistrict(String(decoded.districtCode) || "");
			setWard(String(decoded.wardCode) || "");
		} else if (user.address && (!locationData || locationData.length <= 3)) {
			// Tạm dùng default locations
			const decoded = decodeAddress(user.address, []);
			setStreet(decoded.street || "");
		}
	}, [user.address, locationData]);

	// Popup Order State
	const [selectedOrder, setSelectedOrder] = useState<OrderFE | null>(null);
	const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);

	const handleViewOrderDetails = async (order: OrderFE) => {
		setSelectedOrder(order);
		setIsLoadingOrderDetails(true);
		try {
			const details = await orderService.getOrderByCode(
				order.businessId || order.id,
			);
			if (details) {
				setSelectedOrder(details);
			}
		} catch (error) {
			console.error("Failed to load order details:", error);
			toast.error("Không thể tải chi tiết đơn hàng");
		} finally {
			setIsLoadingOrderDetails(false);
		}
	};

	const {
		data: orders,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["orderHistory"], // Key để định danh cache cho mớ dữ liệu này
		queryFn: () => orderService.getMyOrders(), // Hàm gọi API thật
		staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "mới" trong 5 phút, F5 không cần gọi lại API
	});

	const handleUpdateProfile = (e: React.FormEvent) => {
		e.preventDefault();

		// Encode address
		const cityObj = (locationData || []).find(
			(c) => String(c.code) === String(city),
		);
		const cityName = cityObj ? cityObj.name : city;

		const distList = cityObj?.districts || [];
		const distObj = distList.find(
			// biome-ignore lint/suspicious/noExplicitAny: skip
			(d: any) => String(d.code) === String(district) || d === district,
		);
		const districtName = distObj ? distObj.name || distObj : district;

		const wardList = distObj?.wards || [];
		const wardObj = wardList.find(
			// biome-ignore lint/suspicious/noExplicitAny: skip
			(w: any) => String(w.code) === String(ward) || w === ward,
		);
		const wardName = wardObj ? wardObj.name || wardObj : ward;

		const finalAddress = encodeAddress(
			street,
			String(wardName),
			String(districtName),
			String(cityName),
		);

		authService
			.updateProfile({
				fullName,
				email,
				phoneNumber,
				address: finalAddress,
			})
			.then(() => {
				const updatedProfile = {
					...user,
					fullName,
					email,
					phone: phoneNumber,
					address: finalAddress,
				};
				setUser(updatedProfile);
				useAuthStore.getState().updateUser(updatedProfile);

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

	const dateStr = String(user.createDate);

	const formattedDate = `${dateStr.slice(7, 9)}/${dateStr.slice(5, 6)}/${dateStr.slice(0, 4)}`;

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
						Thành viên đăng ký từ {formattedDate}
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

			{/* Màn hình chính */}
			<div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
				{/* Left Side Content - Profile Form */}
				<div className="lg:col-span-7 space-y-8">
					{/* Thông Tin Cá Nhân */}
					<div className="bg-sf-bg-elevated p-8 rounded-2xl border border-sf-border shadow-xs space-y-6">
						<h2 className="font-serif text-2xl font-light text-sf-fg flex items-center gap-3 pb-4 border-b border-sf-border">
							<User className="h-6 w-6 text-[#C49B83]" />
							Thông Tin Của Tôi
						</h2>
						<form onSubmit={handleUpdateProfile} className="space-y-5">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<div className="space-y-2">
									<label
										htmlFor="fullName"
										className="text-xs font-bold uppercase tracking-widest text-[#C49B83]"
									>
										Họ và Tên
									</label>
									<input
										id="fullName"
										type="text"
										required
										value={fullName}
										onChange={(e) => setFullName(e.target.value)}
										className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
									/>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="phoneNumber"
										className="text-xs font-bold uppercase tracking-widest text-sf-fg-muted"
									>
										Số Điện Thoại
									</label>
									<input
										id="phoneNumber"
										type="tel"
										required
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-xs font-bold uppercase tracking-widest text-sf-fg-muted"
								>
									Địa Chỉ Email
								</label>
								<input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
								/>
							</div>

							{/* Address Section */}
							<div className="pt-4 border-t border-sf-border space-y-5">
								<h3 className="text-sm font-bold uppercase tracking-widest text-[#C49B83]">
									Địa Chỉ Giao Hàng
								</h3>

								<div className="space-y-2">
									<label
										htmlFor="street"
										className="text-[10px] font-bold uppercase tracking-widest text-sf-fg-muted"
									>
										Số nhà, tên đường
									</label>
									<input
										id="street"
										type="text"
										required
										value={street}
										onChange={(e) => setStreet(e.target.value)}
										className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
									/>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
									<div className="space-y-2">
										<label
											htmlFor="city"
											className="text-[10px] font-bold uppercase tracking-widest text-sf-fg-muted"
										>
											Tỉnh/Thành phố
										</label>
										<select
											id="city"
											required
											value={city}
											onChange={(e) => {
												setCity(e.target.value);
												setDistrict("");
												setWard("");
											}}
											className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
										>
											<option value="">Chọn Tỉnh/Thành phố</option>
											{(locationData || []).map((c) => (
												<option key={c.code} value={c.code}>
													{c.name}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="district"
											className="text-[10px] font-bold uppercase tracking-widest text-sf-fg-muted"
										>
											Quận/Huyện
										</label>
										<select
											id="district"
											required
											value={district}
											onChange={(e) => {
												setDistrict(e.target.value);
												setWard("");
											}}
											className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
										>
											<option value="">Chọn Quận/Huyện</option>
											{(locationData || [])
												.find((c) => String(c.code) === String(city))
												// biome-ignore lint/suspicious/noExplicitAny: skip
												?.districts?.map((d: any) => (
													<option key={d.code || d} value={d.code || d}>
														{d.name || d}
													</option>
												))}
										</select>
									</div>
								</div>

								<div className="space-y-2">
									<label
										htmlFor="ward"
										className="text-[10px] font-bold uppercase tracking-widest text-sf-fg-muted"
									>
										Phường/Xã
									</label>
									<select
										id="ward"
										required
										value={ward}
										onChange={(e) => setWard(e.target.value)}
										className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83] transition-colors"
									>
										<option value="">Chọn Phường/Xã</option>
										{(locationData || [])
											.find((c) => String(c.code) === String(city))
											?.districts?.find(
												// biome-ignore lint/suspicious/noExplicitAny: skip
												(d: any) =>
													String(d.code) === String(district) ||
													d.name === district,
											)
											// biome-ignore lint/suspicious/noExplicitAny: skip
											?.wards?.map((w: any) => (
												<option key={w.code || w} value={w.code || w}>
													{w.name || w}
												</option>
											))}
									</select>
								</div>
							</div>

							<div className="flex items-center justify-between pt-4">
								<button
									type="submit"
									className="rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-sf-accent transition-colors"
								>
									Lưu Thay Đổi
								</button>
								{updateFeedback && (
									<span className="text-sm text-green-500 font-bold uppercase flex items-center gap-1">
										<CheckCircle className="h-4 w-4" /> Đã Lưu!
									</span>
								)}
							</div>
						</form>
					</div>

					{/* Bảo Mật */}
					<div className="bg-sf-surface p-8 rounded-2xl border border-sf-border shadow-xs space-y-6">
						<h2 className="font-serif text-2xl font-light text-sf-fg flex items-center gap-3 pb-4 border-b border-sf-border">
							<Shield className="h-6 w-6 text-[#C49B83]" />
							Bảo Mật
						</h2>
						<form onSubmit={handleChangePassword} className="space-y-5">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
								<div className="space-y-2">
									<label
										htmlFor="oldPassword"
										className="text-[10px] font-bold uppercase tracking-widest text-sf-fg-muted"
									>
										Mật Khẩu Cũ
									</label>
									<input
										id="oldPassword"
										type="password"
										required
										value={oldPassword}
										onChange={(e) => setOldPassword(e.target.value)}
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
								<div className="space-y-2">
									<label
										htmlFor="newPassword"
										className="text-[10px] font-bold uppercase tracking-widest text-[#C49B83]"
									>
										Mật Khẩu Mới
									</label>
									<input
										id="newPassword"
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
									className="rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-sf-accent transition-colors"
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
						{isLoading ? (
							<div className="py-10 flex justify-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sf-accent"></div>
							</div>
						) : isError ? (
							<div className="py-10 text-center text-sm text-red-500 font-medium">
								Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.
							</div>
						) : !orders || orders.length === 0 ? (
							<div className="py-12 text-center space-y-3 bg-sf-surface rounded-xl border border-dashed border-sf-border">
								<ShoppingBag className="mx-auto h-8 w-8 text-sf-accent opacity-60" />
								<h3 className="font-serif text-base font-semibold text-sf-fg">
									Bạn chưa có đơn hàng nào
								</h3>
								<p className="text-xs text-sf-fg-muted font-light max-w-xs mx-auto">
									Hãy khám phá các bộ sưu tập hoa của chúng tôi và đặt đơn hàng
									đầu tiên của bạn nhé.
								</p>
							</div>
						) : (
							<div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
								{orders.map((order) => {
									const orderDate = Array.isArray(order.createdDate)
										? new Date(
												order.createdDate[0],
												order.createdDate[1] - 1,
												order.createdDate[2],
												order.createdDate[3] || 0,
												order.createdDate[4] || 0,
											)
										: new Date(order.createdDate || Date.now());

									return (
										<div
											key={order.id}
											className="p-4 rounded-xl border border-sf-border bg-sf-surface hover:border-[#C49B83] transition-colors"
										>
											<div className="flex justify-between items-start mb-2">
												<div>
													<span className="text-xs font-bold uppercase tracking-widest text-sf-fg">
														#{order.id}
													</span>
													<p className="text-[10px] text-sf-fg-muted mt-0.5">
														{orderDate.toLocaleDateString("vi-VN", {
															year: "numeric",
															month: "long",
															day: "numeric",
														})}
													</p>
												</div>
												<span
													className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
														order.status === "PENDING"
															? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
															: order.status === "SUCCESS"
																? "bg-green-100 text-green-700 dark:bg-green-900/30"
																: "bg-sf-bg-elevated text-sf-fg"
													}`}
												>
													{order.status === "PENDING"
														? "Chờ xử lý"
														: order.status}
												</span>
											</div>
											<div className="flex justify-between items-end border-t border-dashed border-sf-border pt-3 mt-2">
												<div>
													<span className="text-xs text-sf-fg-muted block mb-1">
														Tổng cộng:
													</span>
													<span className="text-sm font-bold text-[#C49B83]">
														{Number(order.total).toLocaleString("vi-VN")} đ
													</span>
												</div>
												<button
													type="button"
													onClick={() => handleViewOrderDetails(order)}
													className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#C49B83] transition-colors px-4 py-2 rounded-full cursor-pointer"
												>
													Xem chi tiết
												</button>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* POPUP CHI TIẾT ĐƠN HÀNG */}
			{selectedOrder && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
					<div className="bg-sf-bg-elevated w-full max-w-lg rounded-2xl border border-sf-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
						<div className="p-5 border-b border-sf-border flex justify-between items-center bg-sf-surface">
							<h3 className="font-serif text-lg font-semibold text-sf-fg">
								Chi Tiết Đơn Hàng #{selectedOrder.id}
							</h3>
							<button
								type="button"
								onClick={() => setSelectedOrder(null)}
								className="p-1 rounded-full hover:bg-sf-bg transition-colors text-sf-fg-muted hover:text-sf-fg cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
							{/* Thông tin giao hàng */}
							<div className="space-y-3">
								<h4 className="text-xs font-bold uppercase tracking-widest text-[#C49B83]">
									Thông Tin Giao Hàng
								</h4>
								<div className="bg-sf-surface p-4 rounded-xl border border-sf-border text-xs space-y-2">
									<div className="flex justify-between">
										<span className="text-sf-fg-muted">Người nhận:</span>
										<span className="font-medium text-sf-fg">
											{selectedOrder.fullname}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sf-fg-muted">Điện thoại:</span>
										<span className="font-medium text-sf-fg">
											{selectedOrder.phoneNumber}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-sf-fg-muted">Địa chỉ:</span>
										<span className="font-medium text-sf-fg text-right max-w-[200px]">
											{selectedOrder.address
												?.split("||")
												.map((s) => s.trim())
												.join(", ")}
										</span>
									</div>
									<div className="flex justify-between border-t border-dashed border-sf-border pt-2 mt-2">
										<span className="text-sf-fg-muted">Thanh toán:</span>
										<span className="font-medium text-sf-fg uppercase">
											{selectedOrder.paymentMethod}
										</span>
									</div>
								</div>
							</div>

							{/* Danh sách mặt hàng */}
							<div className="space-y-3">
								<h4 className="text-xs font-bold uppercase tracking-widest text-[#C49B83]">
									Sản Phẩm Đã Mua
								</h4>
								<div className="bg-sf-surface p-4 rounded-xl border border-sf-border text-xs space-y-3">
									{isLoadingOrderDetails ? (
										<div className="flex justify-center py-6">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C49B83]"></div>
										</div>
									) : (
										(() => {
											const orderItems =
												selectedOrder.data?.details ||
												selectedOrder.details ||
												selectedOrder.orderDetails ||
												selectedOrder.orderItems ||
												selectedOrder.items ||
												[];
											return orderItems.length > 0 ? (
												orderItems.map((item: OrderItemFE, idx: number) => {
													const productName =
														item.productNameVn ||
														item.productNameEng ||
														item.product?.nameVn ||
														item.product?.nameEng ||
														item.product?.name ||
														"Sản phẩm";
													const productImage =
														item.productImage || item.product?.image;
													const productPrice =
														item.productPrice ||
														item.price ||
														item.product?.price ||
														0;
													const subtotal =
														item.subtotal || productPrice * item.quantity || 0;

													return (
														<div
															// biome-ignore lint/suspicious/noArrayIndexKey: No unique ID available
															key={`item-${idx}`}
															className="flex justify-between items-center border-b border-sf-border pb-3 last:border-0 last:pb-0"
														>
															<div className="flex gap-3 items-center">
																<div className="w-10 h-10 bg-sf-bg rounded-md flex items-center justify-center border border-sf-border overflow-hidden">
																	{productImage ? (
																		<Image
																			src={productImage}
																			alt="product"
																			width={40}
																			height={40}
																			className="w-full h-full object-cover"
																		/>
																	) : (
																		<ShoppingBag className="w-4 h-4 text-sf-fg-muted opacity-50" />
																	)}
																</div>
																<div>
																	<p className="font-medium text-sf-fg">
																		{productName}
																	</p>
																	<p className="text-sf-fg-muted">
																		SL: {item.quantity} x{" "}
																		{Number(productPrice).toLocaleString(
																			"vi-VN",
																		)}{" "}
																		đ
																	</p>
																</div>
															</div>
															<span className="font-bold text-sf-fg">
																{Number(subtotal).toLocaleString("vi-VN")} đ
															</span>
														</div>
													);
												})
											) : (
												<p className="text-sf-fg-muted italic text-center py-2">
													Không tải được danh sách sản phẩm.
												</p>
											);
										})()
									)}
								</div>
							</div>

							{/* Tổng kết */}
							<div className="flex justify-between items-center p-4 bg-[#C49B83]/10 text-[#C49B83] rounded-xl border border-[#C49B83]/20">
								<span className="font-bold uppercase tracking-widest text-xs">
									Tổng Tiền
								</span>
								<span className="text-xl font-bold">
									{Number(selectedOrder.total).toLocaleString("vi-VN")} đ
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
