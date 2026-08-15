"use client";

import { CreditCard, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { useCartStore } from "@/store/cart-store";
import { useDiscountStore } from "@/store/discount-store";

type CartDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
	const router = useRouter();
	const { cart, removeFromCart, updateCartQuantity, revalidateCart } =
		useCartStore();
	const { appliedDiscount, checkAndApplyDiscount } = useDiscountStore();

	const [promoCode, setPromoCode] = useState("");
	const [_promoError, setPromoError] = useState(false);
	const [_promoSuccess, setPromoSuccess] = useState(false);

	useEffect(() => {
		if (isOpen) {
			revalidateCart();
		}
	}, [isOpen, revalidateCart]);

	const subtotal = cart.reduce(
		(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
		0,
	);
	const discount = appliedDiscount
		? (subtotal * appliedDiscount.percentage) / 100
		: 0;
	const total = subtotal - discount;

	const _handleApplyPromo = async (e: React.FormEvent) => {
		e.preventDefault();
		setPromoError(false);
		setPromoSuccess(false);
		const success = await checkAndApplyDiscount(promoCode, subtotal);
		if (success) {
			setPromoSuccess(true);
			setPromoCode("");
		} else {
			setPromoError(true);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Overlay mask */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.4 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-50 bg-black backdrop-blur-xs"
					/>

					{/* Sliding panel content */}
					<motion.div
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 25, stiffness: 220 }}
						className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-sf-border bg-sf-bg shadow-2xl transition-colors duration-300"
					>
						{/* Header block */}
						<div className="flex h-16 items-center justify-between border-b border-sf-border px-6">
							<div className="flex items-center gap-2">
								<ShoppingBag className="h-5 w-5 text-sf-accent" />
								<h2 className="font-serif text-lg font-semibold text-sf-fg">
									Giỏ Hàng Của Bạn
								</h2>
							</div>
							<button
								type="button"
								id="cart-drawer-close-btn"
								onClick={onClose}
								className="p-1.5 rounded-lg text-sf-fg-muted hover:bg-sf-surface transition-colors"
								aria-label="Close cart"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Scrolling items cart list */}
						<div className="flex-1 overflow-y-auto p-6 space-y-4">
							{cart.map((item) => (
								<div
									id={`cart-item-${item.itemPk}-${item.product.id}`}
									key={`cart-item-${item.itemPk || "new"}-${item.product.id}`}
									className="flex items-start gap-4 bg-sf-bg-elevated p-3 rounded-xl border border-sf-border shadow-sm"
								>
									{/* Photo container */}
									<div className="relative h-16 w-16">
										<Image
											src={
												item.product.imageUrl || "/images/about-us-main1.avif"
											}
											alt={item.product.nameVn}
											fill
											className="h-16 w-16 rounded-lg object-cover grayscale-1/10 shrink-0"
											referrerPolicy="no-referrer"
											sizes="64px"
										/>
									</div>

									{/* Text descriptions */}
									<div className="flex-1 space-y-1">
										<div className="flex justify-between items-start gap-2">
											<div className="flex items-center flex-wrap gap-2">
												<h4 className="font-serif text-sm font-semibold text-sf-fg line-clamp-1 leading-tight">
													{item.product.nameVn}
												</h4>
												{item.product.stockQuantity <= 0 && (
													<span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[8px] font-bold text-red-700 uppercase tracking-widest border border-red-200 shrink-0">
														Hết hàng
													</span>
												)}
											</div>
											<button
												type="button"
												id={`cart-delete-btn-${item.product.id}`}
												onClick={() => removeFromCart(item.product.id)}
												className="p-1 text-sf-fg-muted hover:text-red-500 transition-colors"
												title="Delete item"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</button>
										</div>

										<div className="flex flex-wrap gap-1.5 pt-0.5">
											<span className="rounded-full bg-sf-surface px-2 py-0.5 text-[10px] text-sf-fg-muted uppercase border border-sf-border font-medium">
												{item.product.price.toLocaleString("vi-VN")} đ / Cái
											</span>
										</div>

										{/* Quantity Selector controls */}
										<div className="flex items-center justify-between pt-2">
											<div className="flex items-center gap-1 rounded-lg border border-sf-border bg-sf-bg p-0.5">
												<button
													type="button"
													id={`cart-qty-minus-${item.product.id}`}
													onClick={() =>
														updateCartQuantity(
															item.product.id,
															item.quantity - 1,
														)
													}
													className="p-1 rounded-md text-sf-fg-muted hover:bg-sf-surface transition-colors"
												>
													<Minus className="h-3 w-3" />
												</button>
												<span className="px-2 text-sm font-semibold text-sf-fg">
													{item.quantity}
												</span>
												<button
													type="button"
													id={`cart-qty-plus-${item.product.id}`}
													onClick={() => {
														if (item.quantity >= item.product.stockQuantity) {
															toast.error("Đã đạt giới hạn tồn kho");
															return;
														}
														updateCartQuantity(
															item.product.id,
															item.quantity + 1,
														);
													}}
													disabled={item.quantity >= item.product.stockQuantity}
													className="p-1 rounded-md text-sf-fg-muted hover:bg-sf-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
												>
													<Plus className="h-3 w-3" />
												</button>
											</div>

											<span className="font-sans font-bold text-sm text-sf-fg">
												{(item.product.price * item.quantity).toLocaleString(
													"vi-VN",
												)}{" "}
												đ
											</span>
										</div>
									</div>
								</div>
							))}

							{cart.length === 0 && (
								<div className="text-center py-16 space-y-3">
									<ShoppingBag className="mx-auto h-8 w-8 text-sf-accent opacity-60" />
									<h3 className="font-serif text-base font-semibold text-sf-fg">
										Giỏ hàng của bạn đang trống
									</h3>
									<p className="text-sm text-sf-fg-muted font-light max-w-xs mx-auto leading-relaxed">
										Duyệt qua bộ sưu tập của chúng tôi và thêm những bó hoa độc
										đáo vào giỏ hàng của bạn.
									</p>
								</div>
							)}
						</div>

						{/* Static invoice recap block and promo code coupon */}
						{cart.length > 0 && (
							<div className="border-t border-sf-border bg-sf-bg-elevated p-6 space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
								{/* Promo Code Form */}
								{/* <form onSubmit={handleApplyPromo} className="flex gap-2">
									<input
										id="cart-coupon-input"
										type="text"
										placeholder="Nhập mã giảm giá (VD: SOULWINTER)"
										value={promoCode}
										onChange={(e) => setPromoCode(e.target.value)}
										className="grow text-sm rounded-lg border border-sf-border bg-sf-bg text-sf-fg placeholder:text-sf-fg-muted px-3 py-2 outline-none focus:border-sf-accent focus:ring-1 focus:ring-sf-accent transition-all"
									/>
									<button
										id="cart-apply-coupon-btn"
										type="submit"
										className="rounded-lg bg-sf-accent px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-sf-accent/90 transition-colors"
									>
										Áp dụng
									</button>
								</form>

								{promoSuccess && appliedDiscount && (
									<p className="text-xs text-green-500 font-semibold uppercase tracking-wider">
										Mã giảm giá đã được áp dụng thành công!
										<span className="block text-[12px] text-sf-fg-muted font-normal tracking-normal uppercase">
											({appliedDiscount.percentage}% off toàn bộ giỏ hàng)
										</span>
									</p>
								)}
								{appliedDiscount && !promoSuccess && (
									<div className="flex items-center gap-1.5 text-xs text-sf-accent font-bold uppercase tracking-wider bg-sf-accent/10 px-3 py-2 rounded-md">
										<Tag className="h-3.5 w-3.5" />
										Mã Khuyến Mãi: {appliedDiscount.code} (-
										{appliedDiscount.percentage}%)
									</div>
								)} */}

								{/* Pricing summary list */}
								<div className="space-y-2 text-sm">
									<div className="flex justify-between text-sf-fg-muted">
										<span>Giá Trị Giỏ Hàng</span>
										<span>{subtotal.toLocaleString("vi-VN")} đ</span>
									</div>
									{discount > 0 && appliedDiscount && (
										<div className="flex justify-between text-green-500 font-medium">
											<span>Giảm Giá ({appliedDiscount.percentage}%)</span>
											<span>-{discount.toLocaleString("vi-VN")} đ</span>
										</div>
									)}

									<div className="flex justify-between border-t border-sf-border pt-3 font-bold text-base text-sf-fg">
										<span>Tổng Số Tiền</span>
										<span className="text-sf-accent">
											{total.toLocaleString("vi-VN")}
										</span>
									</div>
								</div>

								{/* Direct route checkout trigger */}
								<button
									type="button"
									id="checkout-redirect-btn"
									onClick={() => {
										router.push(soulFlowRoutes.checkout);
										onClose();
									}}
									className="w-full flex items-center justify-center gap-2 rounded-xl bg-sf-fg py-4 text-xs font-bold uppercase tracking-widest text-sf-bg hover:bg-sf-accent hover:text-white transition-all duration-300 shadow-md mt-2"
								>
									<CreditCard className="h-4 w-4" />
									Tiến Hành Thanh Toán
								</button>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
