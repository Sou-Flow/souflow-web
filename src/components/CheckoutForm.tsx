"use client";

import {
	Check,
	CheckCircle2,
	Clipboard,
	CreditCard,
	ShoppingBag,
	Truck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { soulFlowRoutes } from "@/lib/soulflow/routes";
import { useSoulFlowStore } from "@/store/soulflow-store";
import type { Order } from "@/types/order.type";

export function CheckoutForm() {
	const { cart, placeOrder, locationData, appliedCoupon } = useSoulFlowStore();

	// Contact form state
	const [recipientName, setRecipientName] = useState("Sarah Beauchamp");
	const [recipientPhone, setRecipientPhone] = useState("+84 90 999 7777");
	const [address, setAddress] = useState("25A Thảo Điền Road");
	const [selectedCity, setSelectedCity] = useState("HCM");
	const [selectedDistrict, setSelectedDistrict] = useState("Quận 1");
	const [ward, setWard] = useState("Thảo Điền Ward");
	const [paymentMethod, setPaymentMethod] = useState<
		"VNPAY" | "MoMo" | "Bank Transfer"
	>("VNPAY");

	// Order processing/receipt flags
	const [isPlaced, setIsPlaced] = useState(false);
	const [placedOrderDetails, setPlacedOrderDetails] = useState<Order | null>(
		null,
	);
	const [clipboardCopied, setClipboardCopied] = useState(false);

	const districtsOfCity = useMemo(() => {
		const city = locationData.find((c) => c.code === selectedCity);
		return city ? city.districts : [];
	}, [locationData, selectedCity]);

	// Pricing math
	const subtotal = cart.reduce(
		(sum, item) => sum + item.priceUnit * item.quantity,
		0,
	);
	const discount = appliedCoupon
		? (subtotal * appliedCoupon.discountPercent) / 100
		: 0;
	const shippingFee = subtotal > 0 ? 5 : 0;
	const total = subtotal - discount + shippingFee;

	const handlePlaceOrder = (e: React.FormEvent) => {
		e.preventDefault();
		const cityObj = locationData.find((c) => c.code === selectedCity);
		const cityName = cityObj ? cityObj.name : selectedCity;

		const details = {
			recipientName,
			recipientPhone,
			address: `${address}, ${ward}`,
			city: cityName,
			district: selectedDistrict,
			paymentMethod,
		};

		const newOrder = placeOrder(details);
		setPlacedOrderDetails(newOrder);
		setIsPlaced(true);
	};

	const handleCopyBank = async () => {
		try {
			await navigator.clipboard.writeText(
				"TECHCOMBANK - 19034567891011 - SOULFLOW BOUTIQUE",
			);
			setClipboardCopied(true);
			setTimeout(() => setClipboardCopied(false), 2000);
		} catch {
			setClipboardCopied(false);
		}
	};

	if (isPlaced && placedOrderDetails) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center bg-sf-bg transition-colors duration-300">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-sf-bg-elevated rounded-2xl border border-[#C49B83]/30 p-8 shadow-xl space-y-6"
				>
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/50">
						<CheckCircle2 className="h-8 w-8 text-green-500" />
					</div>

					<div className="space-y-2">
						<span className="text-sm text-[#C49B83] uppercase tracking-widest font-bold block">
							Xác Nhận Đơn Hàng
						</span>
						<h1 className="font-serif text-3xl font-light text-sf-fg">
							Bông Hoa Của Bạn Đang Được Gửi Đi!
						</h1>
						<p className="text-xs text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto leading-relaxed">
							Đơn{" "}
							<strong className="text-sf-fg">{placedOrderDetails.id}</strong>{" "}
							của bạn đã được tiếp nhận và đang trong quá trình xử lý. Chúng tôi
							sẽ liên hệ với bạn qua số điện thoại{" "}
							<strong className="text-sf-fg">
								{placedOrderDetails.recipientPhone}
							</strong>{" "}
						</p>
					</div>

					{/* Detailed Invoice Receipt Card */}
					<div className="rounded-xl border text-sf-fg bg-sf-bg-elevated p-5 text-left text-xs space-y-4">
						<h3 className="font-serif text-sm font-semibold text-sf-fg pb-2 border-b border-[#EBE5DA]/50 dark:border-[#2C2C2C]/50">
							Hóa Đơn Chi Tiết
						</h3>

						<div className="grid grid-cols-2 gap-y-2.5 text-[#666666] dark:text-[#A0A0A0]">
							<div>Khởi tạo ngày:</div>
							<div className="text-right text-sf-fg font-medium">
								{placedOrderDetails.date}
							</div>

							<div>Người Nhận:</div>
							<div className="text-right text-sf-fg font-medium">
								{placedOrderDetails.recipientName}
							</div>

							<div>Số Điện Thoại:</div>
							<div className="text-right text-sf-fg font-medium">
								{placedOrderDetails.recipientPhone}
							</div>

							<div>Địa Chỉ:</div>
							<div className="text-right text-sf-fg font-medium line-clamp-1">
								{placedOrderDetails.address}, {placedOrderDetails.district},{" "}
								{placedOrderDetails.city}
							</div>

							<div>Phương Thức Thanh Toán:</div>
							<div className="text-right text-sf-fg font-medium uppercase">
								{placedOrderDetails.paymentMethod}
							</div>

							<div className="border-t border-dashed text-sf-fg pt-2.5 font-bold">
								Tổng Số Tiền:
							</div>
							<div className="border-t border-dashed text-sf-fg pt-2.5 text-right font-bold text-lg">
								${placedOrderDetails.totalAmount}
							</div>
						</div>
					</div>

					{paymentMethod === "Bank Transfer" && (
						<div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/50 text-left space-y-2">
							<span className="text-xs uppercase tracking-widest font-bold text-amber-700 dark:text-amber-300 block">
								Hướng Dẫn Thanh Toán Chuyển Khoản
							</span>
							<p className="text-[11px] text-amber-600 dark:text-amber-400 font-light leading-relaxed">
								Vui lòng chuyển khoản đúng số tiền{" "}
								<strong className="text-base font-bold">
									${placedOrderDetails.totalAmount}
								</strong>{" "}
								Tới VPBank:{" "}
								<strong className="font-semibold text-sf-fg">50041808</strong>{" "}
								(SOULFLOW LTD) with memo content{" "}
								<strong className="font-semibold text-sf-fg">
									{placedOrderDetails.id}
								</strong>
								.
							</p>
						</div>
					)}

					<div className="pt-4">
						<Link
							id="checkout-receipt-back-btn"
							href={soulFlowRoutes.home}
							className="inline-block px-6 py-3 rounded-full bg-amber-600 text-white dark:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest hover:bg-[#C49B83] dark:hover:bg-[#C49B83] hover:text-white dark:hover:text-white transition-colors duration-200"
						>
							Tiếp Tục Khám Phá Cửa Hàng
						</Link>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			<div className="text-center space-y-2 mb-10">
				<span className="text-sm font-bold tracking-widest text-[#C49B83] uppercase block">
					Thanh Toán An Toàn
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Kiểm Tra Và Xác Nhận Đơn Hàng Của Bạn
				</h1>
			</div>

			{cart.length === 0 ? (
				<div className="text-center py-20 bg-sf-bg-elevated rounded-2xl border text-sf-fg max-w-md mx-auto">
					<ShoppingBag className="mx-auto h-10 w-10 text-[#C49B83] opacity-65 mb-4" />
					<h3 className="font-serif text-lg text-sf-fg">
						Giỏ hàng của bạn đang trống!
					</h3>
					<p className="text-xs text-[#666666] dark:text-[#A0A0A0] mt-1 max-w-xs mx-auto leading-relaxed font-light">
						Vui lòng thêm một số sản phẩm vào giỏ hàng của bạn để bắt đầu quy
						trình thanh toán.
					</p>
				</div>
			) : (
				<form
					onSubmit={handlePlaceOrder}
					className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start"
				>
					{/* Left Columns - Details Form & Payments */}
					<div className="lg:col-span-7 space-y-6">
						{/* Recipient details card */}
						<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-4">
							<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-[#EBE5DA] dark:border-[#222222] pb-3">
								<Truck className="h-4.5 w-4.5 text-[#C49B83]" />
								1. Thông Tin Người Nhận
							</h2>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label
										htmlFor="recipient-name-input"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Tên Người Nhận
									</label>
									<input
										id="recipient-name-input"
										type="text"
										required
										value={recipientName}
										onChange={(e) => setRecipientName(e.target.value)}
										className="w-full text-xs rounded-lg border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="recipient-phone-input"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Số Điện Thoại Người Nhận
									</label>
									<input
										id="recipient-phone-input"
										type="tel"
										required
										value={recipientPhone}
										onChange={(e) => setRecipientPhone(e.target.value)}
										className="w-full text-xs rounded-lg border text-sf-fg bg-sf-bg-elevated p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
							</div>

							{/* Cascade selectors */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="space-y-1">
									<label
										htmlFor="city-select"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Tỉnh / Thành phố
									</label>
									<select
										id="city-select"
										value={selectedCity}
										onChange={(e) => {
											setSelectedCity(e.target.value);
											const city = locationData.find(
												(c) => c.code === e.target.value,
											);
											if (city && city.districts.length > 0) {
												setSelectedDistrict(city.districts[0]);
											}
										}}
										className="w-full text-xs rounded-lg border text-sf-fg bg-sf-bg-elevated p-3 outline-none focus:border-[#C49B83] cursor-pointer animate-none"
									>
										{locationData.map((city) => (
											<option key={city.code} value={city.code}>
												{city.name}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="district-select"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Quận/Huyện
									</label>
									<select
										id="district-select"
										value={selectedDistrict}
										onChange={(e) => setSelectedDistrict(e.target.value)}
										className="w-full text-xs rounded-lg border text-sf-fg bg-sf-bg-elevated p-3 outline-none focus:border-[#C49B83] cursor-pointer"
									>
										{/* {districtsOfCity.map((dist) => (
											<option key={dist} value={dist}>
												{dist}
											</option>
										))} */}
									</select>
								</div>

								<div className="space-y-1">
									<label
										htmlFor="ward-input"
										className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
									>
										Phường/Xã
									</label>
									<input
										id="ward-input"
										type="text"
										required
										value={ward}
										onChange={(e) => setWard(e.target.value)}
										placeholder="Thảo Điền Ward"
										className="w-full text-xs rounded-lg border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label
									htmlFor="address-street"
									className="text-sm uppercase tracking-wider font-bold text-[#666666] dark:text-[#A0A0A0]"
								>
									Địa Chỉ Đường phố & Căn Hộ
								</label>
								<input
									id="address-street"
									type="text"
									required
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									className="w-full text-xs rounded-lg border text-sf-fg bg-sf-bg-elevated p-3 outline-none focus:border-[#C49B83]"
								/>
							</div>
						</div>

						{/* Vietnam Payment Options with Tabs */}
						<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-4">
							<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-[#EBE5DA] dark:border-[#222222] pb-3">
								<CreditCard className="h-4.5 w-4.5 text-[#C49B83]" />
								2. Chọn Phương Thức Thanh Toán
							</h2>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{[
									{
										id: "VNPAY" as const,
										label: "VNPAY QR-PAY",
										desc: "Quét mã VNPay an toàn, không cần nhập liệu thủ công. Hoàn hảo cho người dùng địa phương.",
									},
									{
										id: "MoMo" as const,
										label: "MOMO E-WALLET",
										desc: "Thanh toán an toàn thông qua nền tảng ứng dụng di động MoMo.",
									},
									{
										id: "Bank Transfer" as const,
										label: "BANK TRANSFER",
										desc: "Chuyển khoản ngân hàng nhanh chóng với ghi chú đơn hàng.",
									},
								].map((pay) => {
									const isChose = paymentMethod === pay.id;
									return (
										<button
											id={`payment-btn-${pay.id.toLowerCase().replace(/\s+/g, "-")}`}
											key={pay.id}
											type="button"
											onClick={() => setPaymentMethod(pay.id)}
											className={`text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between h-24 ${
												isChose
													? "border-[#C49B83] bg-[#C49B83]/5 ring-1 ring-[#C49B83]"
													: "text-sf-fg hover:border-[#C49B83]"
											}`}
										>
											<span className="block text-xs font-semibold text-sf-fg uppercase">
												{pay.label}
											</span>
											<p className="text-xs text-[#888888] font-light leading-tight">
												{pay.desc}
											</p>
											{isChose && (
												<div className="flex h-3 w-3 self-end rounded-full bg-[#C49B83]" />
											)}
										</button>
									);
								})}
							</div>

							{/* Payment Instructions boxes based on selection */}
							<AnimatePresence mode="wait">
								{paymentMethod === "VNPAY" && (
									<motion.div
										key="vnpay"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="p-4 bg-red-50/50 dark:bg-red-950/25 border border-red-200/50 rounded-xl space-y-3"
									>
										<span className="text-xs font-bold tracking-widest text-[#D9381E] uppercase block">
											Hướng Dẫn Thanh Toán VNPAY QR-PAY
										</span>
										<p className="text-xs text-[#D9381E] font-light leading-relaxed">
											A secured dynamic VNPay QR code will be generated on
											confirmation. Perfect for effortless local payouts.
										</p>
										<div className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#EBE5DA] p-1.5">
											<span className="text-sm font-mono font-bold text-black shadow-xs">
												VNPAY - QR PAY ENABLED
											</span>
										</div>
									</motion.div>
								)}

								{paymentMethod === "MoMo" && (
									<motion.div
										key="momo"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="p-4 bg-pink-50/50 dark:bg-pink-950/25 border border-pink-200/50 rounded-xl space-y-3"
									>
										<span className="text-xs font-bold tracking-widest text-[#D82685] uppercase block">
											Instructions
										</span>
										<p className="text-xs text-[#D82685] font-light leading-relaxed">
											Pay instantly with MoMo wallet on confirmation. Ensure
											your mobile billing credentials matches properly.
										</p>
									</motion.div>
								)}

								{paymentMethod === "Bank Transfer" && (
									<motion.div
										key="bank"
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="p-4 bg-sf-surface rounded-xl space-y-3"
									>
										<span className="text-xs font-bold tracking-widest text-[#C49B83] uppercase block">
											Atelier Settlement Credentials
										</span>
										<div className="text-xs text-sf-fg space-y-2">
											<p className="font-light leading-relaxed">
												Manually transfer exactly the total invoice sum to our
												secure central shop reserves:
											</p>

											<div className="bg-sf-bg-elevated p-3 rounded-lg border text-sf-fg space-y-1 relative">
												<p>
													<strong className="font-normal text-sf-fg">
														Ngân Hàng:
													</strong>{" "}
													VPBank
												</p>
												<p>
													<strong className="font-normal text-sf-fg">
														Số Tài Khoản:
													</strong>{" "}
													00000000
												</p>
												<p>
													<strong className="font-normal text-sf-fg">
														Tên Chủ Tài Khoản:
													</strong>{" "}
													SOULFLOW FLOWER SHOP
												</p>

												<button
													id="copy-bank-details"
													type="button"
													onClick={handleCopyBank}
													className="absolute right-3 top-3 p-1.5 border text-sf-fg rounded-md hover:bg-[#FCFAF7] dark:hover:bg-[#161616]"
													title="Copy details"
												>
													<Clipboard className="h-3.5 w-3.5 text-gray-500" />
												</button>
												{clipboardCopied && (
													<span className="absolute right-12 top-4 text-xs text-green-500 font-bold uppercase">
														Đã sao chép!
													</span>
												)}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Right Column - Order Summary Billing */}
					<div className="lg:col-span-5 bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-5">
						<h2 className="font-serif text-lg font-semibold text-sf-fg pb-3 border-b border-[#EBE5DA] dark:border-[#222222] flex items-center gap-2">
							<ShoppingBag className="h-4.5 w-4.5 text-[#C49B83]" />
							3. Đơn Hàng Của Bạn
						</h2>

						{/* List items */}
						<div className="space-y-4 max-h-55 overflow-y-auto pr-2 scrollbar-none">
							{cart.map((item) => (
								<div
									key={item.id}
									className="flex gap-3 justify-between items-start text-xs border-b border-sf-border pb-3"
								>
									<div className="flex gap-2">
										<div className="relative h-10 w-10 rounded-sm overflow-hidden bg-sf-bg">
											<Image
												src={item.flower.image}
												alt={item.flower.name}
												className="h-10 w-10 rounded-sm object-cover grayscale-1/10 shrink-0"
												referrerPolicy="no-referrer"
												fill
												sizes="40px"
											/>
										</div>
										<div>
											<h4 className="font-serif font-semibold text-[#1A1A1A] dark:text-white line-clamp-1 leading-tight">
												{item.flower.name}
											</h4>
											<p className="text-sm text-[#A0A0A0] mt-0.5">
												Size: {item.selectedSize} · Số lượng: {item.quantity}
											</p>
										</div>
									</div>
									<span className="font-bold text-[#1A1A1A] dark:text-white">
										${item.priceUnit * item.quantity}
									</span>
								</div>
							))}
						</div>

						{/* Invoice summaries */}
						<div className="space-y-2 text-xs border-t border-sf-border pt-4">
							<div className="flex justify-between text-[#666666] dark:text-[#A0A0A0]">
								<span>Thành Tiền</span>
								<span>${subtotal}</span>
							</div>
							{discount > 0 && (
								<div className="flex justify-between text-green-500 font-semibold uppercase">
									<span>Khuyến mãi</span>
									<span>-${discount.toFixed(0)}</span>
								</div>
							)}
							<div className="flex justify-between text-[#666666] dark:text-[#A0A0A0]">
								<span>Phí Vận Chuyển</span>
								<span>${shippingFee}</span>
							</div>
							<div className="flex justify-between font-bold text-sm text-sf-fg border-t border-sf-border pt-3">
								<span>Tổng Cộng</span>
								<span className="text-[#C49B83] text-base font-bold">
									${total.toFixed(0)}
								</span>
							</div>
						</div>

						{/* Place Order Trigger */}
						<button
							id="checkout-submit-btn"
							type="submit"
							className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#1A1A1A] dark:bg-[#FCFAF7] py-4 text-xs font-bold uppercase tracking-widest text-white dark:text-[#1F1A16] hover:bg-[#C49B83] dark:hover:bg-[#C49B83] hover:text-white dark:hover:text-white transition-all duration-300 shadow-md"
						>
							<Check className="h-4 w-4 text-[#C49B83]" />
							Xác Nhận Thanh Toán
						</button>
						<p className="text-sm text-center text-[#888888] font-light leading-normal flex items-start justify-center gap-2">
							<input type="checkbox" required className="mt-1.5 h-3 w-3" />

							<span>
								Khi đặt hàng, bạn đã đồng ý với{" "}
								<Link
									href={soulFlowRoutes.terms}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#C49B83] hover:underline"
								>
									Điều khoản và Điều kiện
								</Link>
							</span>
						</p>
					</div>
				</form>
			)}
		</div>
	);
}
