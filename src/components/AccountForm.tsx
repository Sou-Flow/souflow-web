"use client";

import { Client } from "@stomp/stompjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Camera,
	CheckCircle,
	Shield,
	ShoppingBag,
	User,
	X,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import SockJS from "sockjs-client";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { useAuthStore } from "@/store/auth-store";
import { useLocationStore } from "@/store/location-store";
import type { UserFE } from "@/types/auth.type";
import type { District, Ward } from "@/types/location.type";
// 1. IMPORT CÁC TYPE VÀ MAPPER CHUẨN TỪ FILE KIỂU DỮ LIỆU CỦA BẠN
import {
	mapOrderResponseToFE,
	type OrderDetailFE,
	type OrderFE,
} from "@/types/order.type";
import { decodeAddress, encodeAddress } from "@/utils/addressUtils";

interface AccountFormProps {
	initialUser: UserFE;
}

const translateStatus = (status: string) => {
	switch (status) {
		case "PENDING":
			return "Chờ xử lý";
		case "WAITING_PAYMENT":
			return "Chờ thanh toán";
		case "PAID":
			return "Đã thanh toán";
		case "PROCESSING":
			return "Đang xử lý";
		case "DELIVERED":
			return "Hoàn tất";
		case "CANCELLED":
			return "Đã hủy";
		case "SUCCESS":
			return "Đã thanh toán";
		default:
			return status;
	}
};

export default function AccountForm({ initialUser }: AccountFormProps) {
	// Theme state
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const [user, setUser] = useState<UserFE>(initialUser);

	// Avatar State
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

	// Personal Info Form State
	const [fullName, setFullName] = useState(user.fullName || "");
	const [email, setEmail] = useState(user.email || "");
	const [phoneNumber, setPhoneNumber] = useState(user.phone || "");

	// Security Password State
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [capsLockOn, setCapsLockOn] = useState(false);
	const [updateFeedback, setUpdateFeedback] = useState(false);
	const [passwordFeedback, setPasswordFeedback] = useState(false);

	// Address State
	const { locationData } = useLocationStore();
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [ward, setWard] = useState("");

	// Decode address
	useEffect(() => {
		if (user.address && locationData && locationData.length > 0) {
			const decoded = decodeAddress(user.address, locationData);
			setStreet(decoded.street || "");
			setCity(String(decoded.cityCode) || "");
			setDistrict(String(decoded.districtCode) || "");
			setWard(String(decoded.wardCode) || "");
		} else if (user.address && (!locationData || locationData.length <= 3)) {
			const decoded = decodeAddress(user.address, []);
			setStreet(decoded.street || "");
		}
	}, [user.address, locationData]);

	// Popup Order State - Sử dụng Type chuẩn OrderFE từ file của bạn
	const [selectedOrder, setSelectedOrder] = useState<OrderFE | null>(null);
	const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
	const [isCancelingOrder, setIsCancelingOrder] = useState<string | null>(null);
	const [orderToCancel, setOrderToCancel] = useState<OrderFE | null>(null);

	// 2. BỌC USECALLBACK VÀ DÙNG HÀM MAPPER ĐỂ KHỚP KIỂU DỮ LIỆU SẠCH
	const handleViewOrderDetails = useCallback(async (order: OrderFE) => {
		setSelectedOrder(order);
		setIsLoadingOrderDetails(true);
		try {
			const lookupId = order.businessId || order.id;
			const rawDetails = await orderService.getOrderByCode(lookupId);

			if (rawDetails) {
				// Đi qua mapper của bạn để làm sạch dữ liệu từ API chi tiết về chuẩn OrderFE
				const cleanDetails = mapOrderResponseToFE(rawDetails);

				// Kế thừa lại danh sách items nếu API chi tiết bị thiếu nhưng danh sách tổng quát lại có
				if (
					(!cleanDetails.items || cleanDetails.items.length === 0) &&
					order.items &&
					order.items.length > 0
				) {
					cleanDetails.items = order.items;
				}

				// Bảo lưu hoặc bù đắp ảnh sản phẩm từ danh sách tổng quát nếu cần
				if (order.items && cleanDetails.items) {
					cleanDetails.items = cleanDetails.items.map((detailItem) => {
						const matchedItem = order.items.find(
							(i) => i.productNameVn === detailItem.productNameVn,
						);
						if (!detailItem.productImage && matchedItem?.productImage) {
							detailItem.productImage = matchedItem.productImage;
						}
						return detailItem;
					});
				}
				setSelectedOrder(cleanDetails);
			}
		} catch (error) {
			console.error("Failed to load order details:", error);
			toast.error("Không thể tải chi tiết đơn hàng");
		} finally {
			setIsLoadingOrderDetails(false);
		}
	}, []);

	const queryClient = useQueryClient();

	const handleCancelOrder = (order: OrderFE) => {
		setOrderToCancel(order);
	};

	const confirmCancelOrder = async () => {
		if (!orderToCancel) return;
		setIsCancelingOrder(orderToCancel.id);
		try {
			await orderService.updateOrderStatus(orderToCancel.id, "CANCELLED");
			toast.success("Hủy đơn hàng thành công");
			queryClient.invalidateQueries({ queryKey: ["orderHistory"] });
			if (selectedOrder && selectedOrder.id === orderToCancel.id) {
				setSelectedOrder((prev) =>
					prev ? { ...prev, status: "CANCELLED" } : null,
				);
			}
			setOrderToCancel(null);
		} catch (error: unknown) {
			toast.error("Không thể hủy đơn hàng");
		} finally {
			setIsCancelingOrder(null);
		}
	};

	// 3. MAP DANH SÁCH ĐƠN HÀNG THÔ TỪ API THÀNH MẢNG ORDERFE[] CHUẨN
	const {
		data: orders,
		isLoading,
		isError,
	} = useQuery<OrderFE[]>({
		queryKey: ["orderHistory"],
		queryFn: async () => {
			const res = await orderService.getMyOrders();
			if (Array.isArray(res)) {
				return res.map(mapOrderResponseToFE); // Chuyển đổi dữ liệu thô sang dữ liệu sạch
			}
			return [];
		},
		staleTime: 0,
	});

	// Ref để lưu trữ state hiện tại mà không làm re-trigger WebSocket
	const selectedOrderRef = useRef(selectedOrder);
	useEffect(() => {
		selectedOrderRef.current = selectedOrder;
	}, [selectedOrder]);

	// WebSocket Subscription cho Order Realtime
	useEffect(() => {
		if (!user?.username) return;

		const socketUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/ws`;

		const client = new Client({
			webSocketFactory: () => new SockJS(socketUrl),
			reconnectDelay: 5000,
			onConnect: () => {
				console.log("Connected to STOMP WebSocket for notifications");
				client.subscribe(
					`/topic/user.notifications.${user.username}`,
					(message) => {
						try {
							const payload = JSON.parse(message.body);
							const statusVn =
								payload.message || "Trạng thái đơn hàng vừa được cập nhật!";
							toast.success(statusVn);

							queryClient.invalidateQueries({ queryKey: ["orderHistory"] });

							if (selectedOrderRef.current && payload.referenceId) {
								const currentId =
									selectedOrderRef.current.businessId ||
									selectedOrderRef.current.id;
								if (String(currentId) === String(payload.referenceId)) {
									setSelectedOrder((prev) =>
										prev
											? { ...prev, status: payload.status || prev.status }
											: prev,
									);
								}
							}
						} catch {
							toast.success("Trạng thái đơn hàng vừa được cập nhật!");
							queryClient.invalidateQueries({ queryKey: ["orderHistory"] });
						}
					},
				);
			},
			onStompError: (frame) => {
				console.error("Broker reported error: " + frame.headers.message);
			},
		});

		client.activate();

		return () => {
			if (client.active) client.deactivate();
		};
	}, [user?.username, queryClient]);

	const handleUpdateProfile = (e: React.FormEvent) => {
		e.preventDefault();

		const cityObj = (locationData || []).find(
			(c) => String(c.code) === String(city),
		);
		const cityName = cityObj ? cityObj.name : city;

		const distList = cityObj?.districts || [];
		const distObj = distList.find(
			(d: District) => String(d.code) === String(district),
		);
		const districtName = distObj ? distObj.name || distObj : district;

		const wardList = distObj?.wards || [];
		const wardObj = wardList.find((w: Ward) => String(w.code) === String(ward));
		const wardName = wardObj ? wardObj.name || wardObj : ward;

		const finalAddress = encodeAddress(
			street,
			String(wardName),
			String(districtName),
			String(cityName),
		);

		const formData = new FormData();
		formData.append(
			"account",
			new Blob(
				[
					JSON.stringify({
						fullname: fullName,
						email,
						phone: phoneNumber,
						address: finalAddress,
					}),
				],
				{ type: "application/json" },
			),
		);
		if (avatarFile) {
			formData.append("file", avatarFile);
		}

		authService.updateProfile(formData).then((res) => {
			const updatedProfile = {
				...user,
				fullName,
				email,
				phone: phoneNumber,
				address: finalAddress,
				avatar: (() => {
					const isValid = (u: any) =>
						u &&
						typeof u === "string" &&
						u.trim() !== "" &&
						u !== "null" &&
						u !== "undefined" &&
						!u.endsWith("/null");
					return isValid(res.url)
						? (res.url as string)
						: isValid(res.photo)
							? (res.photo as string)
							: "/images/avatar.png";
				})(),
			};
			setUser(updatedProfile);
			useAuthStore.getState().updateUser(updatedProfile);
			setAvatarFile(null); // Reset file
			setPreviewAvatar(null); // Reset preview
			setUpdateFeedback(true);
			setTimeout(() => setUpdateFeedback(false), 3000);
		});
		toast.success("Cập nhật thành công!");
	};

	const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
		setCapsLockOn(!!e.getModifierState("CapsLock"));
	};

	const handleChangePassword = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("Mật khẩu nhập lại không khớp!");
			return;
		}
		authService.changePassword(oldPassword, newPassword).then(() => {
			setOldPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setPasswordFeedback(true);
			setTimeout(() => setPasswordFeedback(false), 3000);
		});
	};

	let formattedDate = String(user.createDate);
	if (formattedDate.includes("-")) {
		// Remove time part if exists (either after T or space)
		const dateOnly = formattedDate.split("T")[0].split(" ")[0];
		const parts = dateOnly.split("-");
		if (parts.length === 3) {
			// Check if format is YYYY-MM-DD
			if (parts[0].length === 4) {
				formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
			}
			// Check if format is DD-MM-YYYY
			else if (parts[2].length === 4) {
				formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;
			}
		} else {
			formattedDate = dateOnly;
		}
	} else if (Array.isArray(user.createDate)) {
		const [year, month, day] = user.createDate;
		formattedDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			{/* Header Profile Summary */}
			<div className="flex flex-col md:flex-row items-center gap-6 mb-12 p-6 rounded-2xl bg-sf-bg-elevated border border-sf-border shadow-sm">
				<div className="relative group shrink-0">
					<img
						src={previewAvatar || user.avatar || "/images/avatar.png"}
						alt={user.fullName || "User Avatar"}
						className="h-20 w-20 rounded-full object-cover grayscale brightness-105 border border-sf-border"
						referrerPolicy="no-referrer"
					/>
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="absolute bottom-0 right-0 p-2 bg-sf-bg border border-sf-border rounded-full hover:bg-sf-surface transition-colors shadow-sm cursor-pointer z-10"
					>
						<Camera className="h-4 w-4 text-[#C49B83]" />
					</button>
					<input
						type="file"
						ref={fileInputRef}
						className="hidden"
						accept="image/*"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) {
								setAvatarFile(file);
								setPreviewAvatar(URL.createObjectURL(file));
							}
						}}
					/>
				</div>
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
				{/* Profile Form */}
				<div className="lg:col-span-7 space-y-8">
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
										type="text"
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

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
											className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83]"
										>
											<option value="">Chọn Tỉnh/TP</option>
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
											className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83]"
										>
											<option value="">Chọn Quận/Huyện</option>
											{(locationData || [])
												.find((c) => String(c.code) === String(city))
												?.districts?.map((d: District) => (
													<option key={d.code} value={d.code}>
														{d.name}
													</option>
												))}
										</select>
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
											className="w-full text-sm rounded-lg border border-sf-border bg-sf-surface text-sf-fg p-3 outline-none focus:border-[#C49B83]"
										>
											<option value="">Chọn Phường/Xã</option>
											{(locationData || [])
												.find((c) => String(c.code) === String(city))
												?.districts?.find(
													(d: District) =>
														String(d.code) === String(district) ||
														d.name === district,
												)
												?.wards?.map((w: Ward) => (
													<option key={w.code} value={w.code}>
														{w.name}
													</option>
												))}
										</select>
									</div>
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

					{/* Security */}
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
										onKeyUp={handleKeyUp}
										placeholder="Nhập mật khẩu cũ"
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
										onKeyUp={handleKeyUp}
										placeholder="Nhập mật khẩu mới"
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
								<div className="space-y-2 sm:col-span-2">
									<label
										htmlFor="confirmPassword"
										className="text-[10px] font-bold uppercase tracking-widest text-[#C49B83]"
									>
										Nhập Lại Mật Khẩu
									</label>
									<input
										id="confirmPassword"
										type="password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										onKeyUp={handleKeyUp}
										placeholder="Nhập lại mật khẩu mới"
										className="w-full text-xs rounded-lg border border-sf-border text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
								{capsLockOn && (
									<div className="sm:col-span-2 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md font-semibold">
										⚠️ Cảnh báo: Caps Lock đang bật!
									</div>
								)}
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
							<div className="space-y-4 max-h-125 overflow-y-auto pr-2 custom-scrollbar">
								{orders.map((order) => {
									let orderDate: Date;
									if (Array.isArray(order.createdDate)) {
										orderDate = new Date(
											order.createdDate[0],
											order.createdDate[1] - 1,
											order.createdDate[2],
											order.createdDate[3] || 0,
											order.createdDate[4] || 0,
										);
									} else if (
										typeof order.createdDate === "string" &&
										order.createdDate.includes("-")
									) {
										// Xử lý format dd-MM-yyyy HH:mm:ss
										const parts = order.createdDate.split(" ");
										const dateParts = parts[0].split("-");
										const timeParts = parts[1]
											? parts[1].split(":")
											: ["0", "0", "0"];
										if (dateParts.length === 3 && dateParts[0].length === 2) {
											// format: dd-MM-yyyy
											orderDate = new Date(
												Number(dateParts[2]),
												Number(dateParts[1]) - 1,
												Number(dateParts[0]),
												Number(timeParts[0]),
												Number(timeParts[1]),
												Number(timeParts[2] || 0),
											);
										} else {
											orderDate = new Date(order.createdDate);
										}
									} else {
										orderDate = new Date(order.createdDate || Date.now());
									}

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
														order.status === "PENDING" ||
														order.status === "WAITING_PAYMENT"
															? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
															: order.status === "SUCCESS" ||
																	order.status === "PAID" ||
																	order.status === "DELIVERED"
																? "bg-green-100 text-green-700 dark:bg-green-900/30"
																: order.status === "CANCELLED"
																	? "bg-red-100 text-red-700 dark:bg-red-900/30"
																	: "bg-sf-bg-elevated text-sf-fg"
													}`}
												>
													{translateStatus(order.status)}
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
												<div className="flex gap-2">
													{(order.status === "PENDING" ||
														order.status === "WAITING_PAYMENT") && (
														<button
															type="button"
															onClick={() => handleCancelOrder(order)}
															disabled={isCancelingOrder === order.id}
															className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-100 hover:bg-red-200 transition-colors px-4 py-2 rounded-full cursor-pointer disabled:opacity-50"
														>
															{isCancelingOrder === order.id
																? "Đang hủy..."
																: "Hủy đơn"}
														</button>
													)}
													<button
														type="button"
														onClick={() => handleViewOrderDetails(order)}
														className="text-[10px] font-bold uppercase tracking-widest text-white bg-[#1A1A1A] hover:bg-[#C49B83] transition-colors px-4 py-2 rounded-full cursor-pointer"
													>
														Xem chi tiết
													</button>
												</div>
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
							<div className="flex items-center gap-3">
								{(selectedOrder.status === "PENDING" ||
									selectedOrder.status === "WAITING_PAYMENT") && (
									<button
										type="button"
										onClick={() => handleCancelOrder(selectedOrder)}
										disabled={isCancelingOrder === selectedOrder.id}
										className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-100 hover:bg-red-200 transition-colors px-3 py-1.5 rounded-full cursor-pointer disabled:opacity-50"
									>
										{isCancelingOrder === selectedOrder.id
											? "Đang hủy..."
											: "Hủy đơn hàng"}
									</button>
								)}
								<button
									type="button"
									onClick={() => setSelectedOrder(null)}
									className="p-1 rounded-full hover:bg-sf-bg transition-colors text-sf-fg-muted hover:text-sf-fg cursor-pointer"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
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
										<span className="font-medium text-sf-fg text-right max-w-50">
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
									<div className="flex justify-between">
										<span className="text-sf-fg-muted">Phí vận chuyển:</span>
										<span className="font-medium text-sf-fg">
											{Number(selectedOrder.shippingFee || 0).toLocaleString(
												"vi-VN",
											)}{" "}
											đ
										</span>
									</div>
									{selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
										<div className="flex justify-between text-green-600">
											<span className="font-medium">Mã giảm giá ({selectedOrder.discountCode}):</span>
											<span className="font-medium">
												-{Number(selectedOrder.discountAmount).toLocaleString(
													"vi-VN",
												)}{" "}
												đ
											</span>
										</div>
									) : null}
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
											const orderItems = selectedOrder.items || [];
											return orderItems.length > 0 ? (
												orderItems.map((item: OrderDetailFE, idx: number) => (
													// biome-ignore lint/suspicious/noArrayIndexKey: Match logic cũ
													<div
														key={`item-${idx}`}
														className="flex justify-between items-center border-b border-sf-border pb-3 last:border-0 last:pb-0"
													>
														<div className="flex gap-3 items-center">
															<div className="w-10 h-10 bg-sf-bg rounded-md flex items-center justify-center border border-sf-border overflow-hidden">
																{item.productImage ? (
																	<Image
																		src={item.productImage}
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
																	{item.productNameVn}
																</p>
																<p className="text-sf-fg-muted">
																	SL: {item.quantity} x{" "}
																	{Number(item.productPrice).toLocaleString(
																		"vi-VN",
																	)}{" "}
																	đ
																</p>
															</div>
														</div>
														<span className="font-bold text-sf-fg">
															{Number(item.subtotal).toLocaleString("vi-VN")} đ
														</span>
													</div>
												))
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

			{/* POPUP CONFIRM CANCEL ORDER */}
			{orderToCancel && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
					<div className="bg-sf-bg-elevated w-full max-w-sm rounded-2xl border border-sf-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
						<div className="p-5 border-b border-sf-border flex justify-between items-center bg-sf-surface">
							<h3 className="font-serif text-lg font-semibold text-sf-fg">
								Xác nhận hủy đơn
							</h3>
							<button
								type="button"
								onClick={() => setOrderToCancel(null)}
								disabled={isCancelingOrder === orderToCancel.id}
								className="p-1 rounded-full hover:bg-sf-bg transition-colors text-sf-fg-muted hover:text-sf-fg cursor-pointer disabled:opacity-50"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-5 space-y-4">
							<p className="text-sf-fg text-sm">
								Bạn có chắc chắn muốn hủy đơn hàng{" "}
								<span className="font-bold">#{orderToCancel.id}</span> không?
								Hành động này không thể hoàn tác.
							</p>
							<div className="flex gap-3 justify-end mt-6">
								<button
									type="button"
									onClick={() => setOrderToCancel(null)}
									disabled={isCancelingOrder === orderToCancel.id}
									className="px-4 py-2 rounded-xl text-sm font-bold bg-sf-surface border border-sf-border text-sf-fg hover:bg-sf-bg transition-colors disabled:opacity-50 cursor-pointer"
								>
									Không, quay lại
								</button>
								<button
									type="button"
									onClick={confirmCancelOrder}
									disabled={isCancelingOrder === orderToCancel.id}
									className="px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
								>
									{isCancelingOrder === orderToCancel.id ? (
										<>
											<div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
											Đang hủy...
										</>
									) : (
										"Đồng ý hủy"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
