"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
	Check,
	CheckCircle2,
	CreditCard,
	Loader2,
	Lock,
	ShoppingBag,
	Truck,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { orderService } from "@/services/orderService";
import { shippingService } from "@/services/shippingService";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useDiscountStore } from "@/store/discount-store";
import { useLocationStore } from "@/store/location-store";
import { useOrderStore } from "@/store/order-store";
import type { District, Ward } from "@/types/location.type";
import type { OrderFE } from "@/types/order.type";
import { decodeAddress, encodeAddress } from "@/utils/addressUtils";
import {
	type CheckoutFormValues,
	checkoutValidator,
} from "@/validations/checkout.validator";

export function CheckoutForm() {
	const router = useRouter();
	const queryClient = useQueryClient();
	// === 1. LẤY DATA TỪ STORE ===
	const { user } = useAuthStore();

	// Auth Guard: Bắt buộc đăng nhập để thanh toán
	useEffect(() => {
		const token = Cookies.get("accessToken");
		if (!token && !user) {
			toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
			router.replace("/login?redirect=/checkout");
		}
	}, [user, router]);

	const { placeOrder, isPlacingOrder } = useOrderStore();
	const { cart, clearCart, updateCartQuantity } = useCartStore(); // Lấy thêm clearCart và updateCartQuantity
	const { locationData } = useLocationStore();
	const {
		appliedDiscount,
		checkAndApplyDiscount,
		removeDiscount,
		clearDiscount,
	} = useDiscountStore();

	const [discountCodeInput, setDiscountCodeInput] = useState("");
	const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

	// Phải khai báo subtotal sớm hơn một chút, hoặc tính lại tạm thời để truyền vào checkAndApplyDiscount
	// Thực tế subtotal đã được khai báo ở dưới (line 158), nhưng ta đang dùng ở đây (line 52)
	// => Javascript tính toán theo thứ tự trên dưới nên ta phải tính tạm thời.
	const handleApplyDiscount = async () => {
		if (!discountCodeInput.trim()) return;
		setIsApplyingDiscount(true);

		const subtotalTemp = cart.reduce(
			(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
			0,
		);

		try {
			const success = await checkAndApplyDiscount(
				discountCodeInput,
				subtotalTemp,
			);
			if (success) {
				toast.success(`Áp dụng mã ${discountCodeInput} thành công!`);
				setDiscountCodeInput("");
			}
		} finally {
			setIsApplyingDiscount(false);
		}
	};

	// === 2. STATES QUẢN LÝ FORM ===
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<CheckoutFormValues>({
		resolver: zodResolver(checkoutValidator),
		defaultValues: {
			fullName: "",
			phone: "",
			address: "",
			ward: "",
			city: "",
			district: "",
		},
	});

	const selectedCity = watch("city");
	const selectedDistrict = watch("district");

	// Rút gọn lại chỉ còn SEPAY, COD, và STORE
	const [paymentMethod, setPaymentMethod] = useState<
		"SEPAY" | "COD" | "STORE" | null
	>(null);
	// 2. Thêm cờ đánh dấu xem đã điền tự động lần nào chưa
	const [hasAutoFilled, setHasAutoFilled] = useState(false);

	// 3. Dùng useEffect bắt nhịp dữ liệu
	useEffect(() => {
		// Nếu có thông tin user, có địa chỉ, chưa từng điền tự động VÀ locationData đã sẵn sàng
		if (
			user?.address &&
			!hasAutoFilled &&
			locationData &&
			locationData.length > 0
		) {
			// Lấy đúng tên thuộc tính trong DB của bạn
			setValue("fullName", user.fullName || "");
			setValue("phone", user.phone || "");

			const { street, cityCode, districtCode, wardCode } = decodeAddress(
				user.address,
				locationData,
			);

			setValue("address", street);
			setValue("city", String(cityCode));

			// Đợi React render xong options của district dựa trên city
			setTimeout(() => {
				setValue("district", String(districtCode));
				// Đợi React render xong options của ward dựa trên district
				setTimeout(() => {
					setValue("ward", String(wardCode));
					// Đánh dấu đã điền xong
					setHasAutoFilled(true);
				}, 50);
			}, 50);

			// Cực kỳ quan trọng: Bật cờ lên để lần sau không điền đè nữa
			// Đã chuyển setHasAutoFilled(true) vào trong setTimeout cuối cùng
		}
	}, [user, hasAutoFilled, setValue, locationData]);

	// === 3. STATES QUẢN LÝ TRẠNG THÁI ĐƠN HÀNG ===
	// IDLE: Đang điền form | WAITING_PAYMENT: Hiện QR chờ quét | SUCCESS: Đã xong | CANCELED: Đã hủy | OUT_OF_STOCK: Lỗi hết hàng
	const [orderStatus, setOrderStatus] = useState<
		"IDLE" | "WAITING_PAYMENT" | "SUCCESS" | "CANCELED" | "OUT_OF_STOCK"
	>("IDLE");
	const [placedOrderDetails, setPlacedOrderDetails] = useState<OrderFE | null>(
		null,
	);
	const [timeLeft, setTimeLeft] = useState(60); // 5 phút đếm ngược cho QR

	// === 4. TÍNH TOÁN TIỀN BẠC ===
	const subtotal = cart.reduce(
		(sum, item) => sum + (item.product?.price || 0) * (item.quantity || 1),
		0,
	);
	const discount = appliedDiscount
		? (subtotal * appliedDiscount.percentage) / 100
		: 0;

	const [shippingFee, setShippingFee] = useState(0);
	const [_isCalculatingShip, setIsCalculatingShip] = useState(false);

	const selectedWard = watch("ward");

	useEffect(() => {
		if (paymentMethod === "STORE") {
			setShippingFee(0);
			return;
		}

		if (selectedCity && selectedDistrict && selectedWard) {
			const fetchFee = async () => {
				setIsCalculatingShip(true);
				const cityObj = (locationData || []).find(
					(c) => String(c.code) === String(selectedCity),
				);
				const distObj = cityObj?.districts?.find(
					(d) => String(d.code) === String(selectedDistrict),
				);
				const wardObj = distObj?.wards?.find(
					(w) => String(w.code) === String(selectedWard),
				);

				if (distObj?.id && wardObj?.code) {
					try {
						const fee = await shippingService.calculateFee({
							toDistrictId: distObj.id,
							toWardCode: String(wardObj.code),
							insuranceValue: subtotal,
						});
						setShippingFee(fee);
					} catch (_error) {
						setShippingFee(30000); // Fallback
					} finally {
						setIsCalculatingShip(false);
					}
				} else {
					setIsCalculatingShip(false);
				}
			};
			fetchFee();
		} else {
			setShippingFee(0);
		}
	}, [
		selectedCity,
		selectedDistrict,
		selectedWard,
		locationData,
		subtotal,
		paymentMethod,
	]);

	const total = subtotal - discount + shippingFee;

	// === 4.5. POPUP XÁC NHẬN THANH TOÁN ===
	const [showConfirmPopup, setShowConfirmPopup] = useState(false);
	const [pendingOrderData, setPendingOrderData] =
		useState<CheckoutFormValues | null>(null);

	const onPreSubmit = (data: CheckoutFormValues) => {
		if (!paymentMethod) {
			toast.error("Vui lòng chọn phương thức giao hàng / thanh toán!");
			return;
		}
		if (paymentMethod !== "STORE") {
			if (!data.address || !data.city || !data.district || !data.ward) {
				toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng!");
				return;
			}
		}
		setPendingOrderData(data);
		setShowConfirmPopup(true);
	};

	// === 5. XỬ LÝ NHẤN ĐẶT HÀNG CHÍNH THỨC ===
	const onSubmit = async (data: CheckoutFormValues) => {
		const cityObj = (locationData || []).find(
			(c) => String(c.code) === String(selectedCity),
		);
		const cityName = cityObj ? cityObj.name : selectedCity;
		const distObj = cityObj?.districts?.find(
			(d: District) => String(d.code) === String(selectedDistrict),
		);
		const districtName = distObj?.name || selectedDistrict;
		const wardObj = distObj?.wards?.find(
			(w: Ward) => String(w.code) === String(data.ward),
		);
		const wardName = wardObj?.name || data.ward;

		const fullAddress = encodeAddress(
			String(data.address),
			String(wardName),
			String(districtName),
			String(cityName),
		);

		const details = {
			recipientName: data.fullName,
			recipientPhone: data.phone,
			address: paymentMethod === "STORE" ? "Nhận tại cửa hàng" : fullAddress,
			city: paymentMethod === "STORE" ? "Không" : cityName || "",
			district: paymentMethod === "STORE" ? "Không" : selectedDistrict || "",
			paymentMethod: paymentMethod as "COD" | "SEPAY" | "STORE",
			shippingFee: paymentMethod === "STORE" ? 0 : shippingFee,
			discountCode: appliedDiscount?.code || null,
			discountAmount: discount || 0,
		};

		try {
			// Gửi API tạo đơn (status ở BE lúc này sẽ là PENDING_SEPAY hoặc PENDING_COD)
			const newOrder = await placeOrder(details);

			// CHÈN DÒNG NÀY ĐỂ KIỂM TRA:
			console.log("=== ĐÃ TẠO ĐƠN THÀNH CÔNG. DATA THỰC TẾ LÀ: ===", newOrder);

			// Đảm bảo có items và hình ảnh để hiển thị hoá đơn
			if (!newOrder.items || newOrder.items.length === 0) {
				newOrder.items = cart.map((item) => ({
					productNameVn: item.product.nameVn,
					productNameEng: item.product.nameEng,
					productPrice: item.product.price,
					quantity: item.quantity,
					subtotal: item.quantity * item.product.price,
					productImage: item.product.imageUrl || item.product.images?.[0],
				}));
			} else {
				// Nếu BE có trả về items nhưng thiếu ảnh, tự đắp ảnh từ giỏ hàng vào
				newOrder.items.forEach((item, idx) => {
					if (!item.productImage && cart[idx]) {
						item.productImage =
							cart[idx].product.imageUrl || cart[idx].product.images?.[0];
					}
				});
			}

			setPlacedOrderDetails(newOrder);

			// Chia luồng giao diện dựa trên phương thức thanh toán
			if (paymentMethod === "SEPAY") {
				// SEPAY thì chuyển sang màn chờ quét mã
				setTimeLeft(30); // Đặt lại thời gian đếm ngược
				setOrderStatus("WAITING_PAYMENT");
			} else {
				// COD thì không cần quét mã, cho qua trang Success luôn
				setOrderStatus("SUCCESS");
				queryClient.removeQueries({ queryKey: ["flowers"] });
				queryClient.removeQueries({ queryKey: ["flower"] });
				queryClient.removeQueries({ queryKey: ["orderHistory"] });
				clearCart();
				clearDiscount();
			}
		} catch (error: unknown) {
			console.error("Lỗi đặt hàng:", error);

			// Xử lý lỗi cạn kho do người khác mua mất (Race condition)
			// Lấy thông báo lỗi từ Backend (Spring Boot thường trả về trong error.response.data.message hoặc error.response.data)
			// biome-ignore lint/suspicious/noExplicitAny: skip
			const err = error as any;
			const backendData = err?.response?.data;
			const backendMessage =
				typeof backendData === "string" ? backendData : backendData?.message;

			if (err?.response?.status === 400 || err?.response?.status === 409) {
				const errorStr = String(backendMessage || "").toLowerCase();
				// Nếu BE có trả về chữ tồn kho, hết hàng, không đủ... thì báo rõ
				if (
					errorStr.includes("tồn kho") ||
					errorStr.includes("không đủ") ||
					errorStr.includes("hết") ||
					errorStr.includes("stock") ||
					err?.response?.status === 409
				) {
					setOrderStatus("OUT_OF_STOCK");

					// Xoá dòng clearCart() để khách không bị mất các món hàng khác.
					// Chỉ cần gọi revalidateCart() để lấy số lượng mới nhất từ backend.
					queryClient.invalidateQueries({ queryKey: ["flowers"] });
					queryClient.invalidateQueries({ queryKey: ["flower"] });
					useCartStore.getState().revalidateCart();
					return;
				}

				toast.error(
					`Lỗi tạo đơn: ${backendMessage || "Vui lòng kiểm tra lại thông tin!"}`,
				);
			} else {
				toast.error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
			}
		}
	};

	// === 6. EFFECT KIỂM TRA TIỀN (POLLING) DÀNH CHO SEPAY ===
	useEffect(() => {
		let interval: NodeJS.Timeout;

		// Chỉ chạy interval khi đang ở màn hình chờ thanh toán SEPAY
		if (orderStatus === "WAITING_PAYMENT" && placedOrderDetails) {
			interval = setInterval(async () => {
				try {
					console.log("Đang kiểm tra trạng thái thanh toán...");
					const res = await orderService.getOrderByCode(
						(placedOrderDetails.businessId || placedOrderDetails.id) as string,
					);

					if (
						res &&
						["PAID", "COMPLETED", "SUCCESS", "PAID_SEPAY"].includes(res.status)
					) {
						clearInterval(interval);
						toast.success("Success!");
						queryClient.removeQueries({ queryKey: ["flowers"] });
						queryClient.removeQueries({ queryKey: ["flower"] });
						queryClient.removeQueries({ queryKey: ["orderHistory"] });

						if (!res.items || res.items.length === 0) {
							res.items = placedOrderDetails.items;
						} else if (placedOrderDetails.items) {
							// Đắp lại ảnh từ placedOrderDetails nếu backend trả về thiếu ảnh
							res.items.forEach((resItem, idx) => {
								if (!resItem.productImage && placedOrderDetails.items?.[idx]) {
									resItem.productImage =
										placedOrderDetails.items[idx].productImage;
								}
							});
						}

						clearCart();
						clearDiscount();
						setPlacedOrderDetails(res);
						setOrderStatus("SUCCESS");
					}
				} catch (error) {
					console.error("Lỗi khi kiểm tra thanh toán", error);
				}
			}, 3000); // Cứ 3 giây hỏi BE một lần
		}

		return () => clearInterval(interval);
	}, [
		orderStatus,
		placedOrderDetails,
		clearCart,
		clearDiscount,
		queryClient.removeQueries,
	]);

	const handleCancelOrder = useCallback(async () => {
		if (!placedOrderDetails) return;
		try {
			// Yêu cầu từ Backend mới nhất: Gọi API PUT với status=CANCELLED
			await orderService.updateOrderStatus(
				(placedOrderDetails.businessId || placedOrderDetails.id) as string,
				"CANCELLED",
			);

			// Xóa cache để lấy lại số lượng tồn kho mới được hoàn trả
			queryClient.removeQueries({ queryKey: ["flowers"] });
			queryClient.removeQueries({ queryKey: ["flower"] });

			toast.success("Đã hủy thanh toán và hoàn trả tồn kho!");
		} catch (error: unknown) {
			console.warn(
				"⚠️ Lỗi khi hủy đơn:",
				error instanceof Error ? error.message : String(error),
			);
			toast.error("Không thể hủy đơn trên server, vui lòng thử lại sau.");
		} finally {
			// LUÔN LUÔN quay lại form IDLE, giữ nguyên giỏ hàng
			setOrderStatus("IDLE");
			setPlacedOrderDetails(null);
		}
	}, [placedOrderDetails, queryClient.removeQueries]);

	// === 6.1. EFFECT ĐẾM NGƯỢC THỜI GIAN QR ===
	useEffect(() => {
		let timer: NodeJS.Timeout;

		if (orderStatus === "WAITING_PAYMENT" && timeLeft > 0) {
			timer = setInterval(() => {
				setTimeLeft((prev) => prev - 1);
			}, 1000);
		} else if (orderStatus === "WAITING_PAYMENT" && timeLeft === 0) {
			// Xử lý hết giờ -> Tự động hủy
			// Đưa hàm cập nhật state vào setTimeout để chạy bất đồng bộ, tránh lỗi cascading render
			const cancelTimeout = setTimeout(() => {
				handleCancelOrder();
			}, 0);

			// Dọn dẹp cả timeout nếu component unmount bất ngờ
			return () => clearTimeout(cancelTimeout);
		}

		return () => clearInterval(timer);
	}, [orderStatus, timeLeft, handleCancelOrder]);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	// ==========================================
	// KHU VỰC RENDER GIAO DIỆN
	// ==========================================

	// CHẶN 1: NẾU CHƯA ĐĂNG NHẬP
	if (!user) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-6">
				<Lock className="h-12 w-12 text-[#C49B83] mx-auto opacity-50" />
				<h2 className="font-serif text-3xl text-sf-fg">Vui Lòng Đăng Nhập</h2>
				<p className="text-sf-fg-muted text-sm max-w-md mx-auto">
					Bạn cần đăng nhập để tiến hành thanh toán và theo dõi đơn hàng của
					mình.
				</p>
				<Link
					href={`${soulFlowRoutes.login}?callbackUrl=/checkout`}
					className="inline-block bg-[#1A1A1A] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#C49B83] transition-colors"
				>
					Đi tới Đăng Nhập
				</Link>
			</div>
		);
	}

	// CHẶN 2: MÀN HÌNH CHỜ THANH TOÁN QR CODE (SEPAY)
	if (orderStatus === "WAITING_PAYMENT" && placedOrderDetails) {
		const orderId = placedOrderDetails.businessId || placedOrderDetails.id;
		// Link tạo QR tự động của SePay theo thiết lập của bạn
		const qrCodeUrl = `https://qr.sepay.vn/img?bank=VPBank&acc=AGBSPE74K58LCEU9&template=compact&amount=${placedOrderDetails.total}&des=SF${orderId}&showinfo=true&fullacc=true&holder=DANG%20HUY%20HOANG&store=C%E1%BB%ADa%20H%C3%A0ng%20B%C3%A1n%20Hoa%20SouFlow`;

		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-sf-bg-elevated rounded-2xl border border-[#C49B83]/30 p-8 shadow-xl space-y-6"
				>
					<h2 className="font-serif text-2xl text-sf-fg">
						Thanh Toán Đơn Hàng
					</h2>
					<p className="text-sm text-sf-fg-muted">
						Mã đơn:{" "}
						<strong className="text-sf-fg">
							{placedOrderDetails.businessId || placedOrderDetails.id}
						</strong>
					</p>

					<div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
						<Image
							src={qrCodeUrl}
							alt="Mã QR Thanh Toán"
							width={256}
							height={256}
							className="w-64 h-64 object-contain mx-auto"
						/>
					</div>

					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-6 w-6 text-[#C49B83] animate-spin" />
						<p className="text-xs text-amber-600 font-medium tracking-wide uppercase">
							Hệ thống đang chờ nhận tiền...
						</p>
						<p className="text-xl font-bold font-mono text-red-500">
							{formatTime(timeLeft)}
						</p>
						<p className="text-[11px] text-sf-fg-muted">
							Mã QR sẽ tự động hủy nếu quá thời gian hoặc thanh toán thất bại.
						</p>
						<button
							type="button"
							onClick={handleCancelOrder}
							className="mt-4 px-6 py-2 rounded-full border border-red-500 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
						>
							Hủy thanh toán
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	// CHẶN 2.5: MÀN HÌNH HỦY THANH TOÁN (CANCELED)
	if (orderStatus === "CANCELED" && placedOrderDetails) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-sf-bg-elevated rounded-2xl border border-red-500/30 p-8 shadow-xl space-y-6"
				>
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
						<CheckCircle2 className="h-8 w-8 text-red-500" />
					</div>
					<div className="space-y-2">
						<span className="text-sm text-red-500 uppercase tracking-widest font-bold block">
							Đã Hủy Giao Dịch
						</span>
						<h1 className="font-serif text-3xl font-light text-sf-fg">
							Đơn hàng của bạn đã bị hủy!
						</h1>
						<p className="text-xs text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto leading-relaxed">
							Mã đơn{" "}
							<strong className="text-sf-fg">
								{placedOrderDetails.businessId || placedOrderDetails.id}
							</strong>{" "}
							đã được hủy thành công. Bạn có thể đặt lại đơn hàng khác bất cứ
							lúc nào.
						</p>
					</div>
					<div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
						<button
							type="button"
							onClick={async () => {
								const toastId = toast.loading("Đang khôi phục giỏ hàng...");
								await useCartStore.getState().recreateCart();
								toast.dismiss(toastId);
								setOrderStatus("IDLE");
							}}
							className="inline-block px-6 py-3 rounded-full bg-sf-accent text-white text-xs font-bold uppercase tracking-widest hover:bg-sf-accent/90 transition-colors"
						>
							Đổi Cách Thanh Toán
						</button>
						<button
							type="button"
							onClick={() => router.push("/catalog")}
							className="inline-block px-6 py-3 rounded-full bg-sf-surface border border-sf-border text-sf-fg text-xs font-bold uppercase tracking-widest hover:bg-sf-bg transition-colors"
						>
							Mua Sắm Thêm
						</button>
						<button
							type="button"
							onClick={() => {
								clearCart();
								router.push("/catalog");
							}}
							className="inline-block px-6 py-3 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 border border-red-200 dark:border-red-900/50 text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
						>
							Hủy Giỏ Hàng
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	// CHẶN 2.6: MÀN HÌNH HẾT HÀNG / CÓ NGƯỜI MUA TRƯỚC (RACE CONDITION)
	if (orderStatus === "OUT_OF_STOCK") {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="bg-sf-bg-elevated rounded-2xl border border-[#C49B83]/30 p-8 shadow-xl space-y-6"
				>
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/50">
						<ShoppingBag className="h-8 w-8 text-orange-500" />
					</div>
					<div className="space-y-2">
						<span className="text-sm text-orange-500 uppercase tracking-widest font-bold block">
							Rất tiếc! Chậm một bước
						</span>
						<h1 className="font-serif text-3xl font-light text-sf-fg">
							Sản phẩm vừa có người mua mất!
						</h1>
						<p className="text-xs text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto leading-relaxed">
							Trong lúc bạn đang điền thông tin, một khách hàng khác đã nhanh
							tay thanh toán và làm cạn số lượng tồn kho của một vài sản phẩm
							trong giỏ của bạn. <br />
							<br />
							Hệ thống đã tự động làm mới lại giỏ hàng và danh sách hoa. Mong
							bạn thông cảm vì sự bất tiện này nhé!
						</p>
					</div>
					<div className="pt-4">
						<button
							type="button"
							onClick={() => router.push("/catalog")}
							className="inline-block px-6 py-3 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors"
						>
							Quay Lại Cửa Hàng
						</button>
					</div>
				</motion.div>
			</div>
		);
	}

	// MÀN HÌNH 3: HOÀN TẤT ĐƠN HÀNG (SUCCESS INVOICE)
	if (orderStatus === "SUCCESS" && placedOrderDetails) {
		return (
			<div className="mx-auto max-w-2xl px-4 py-16 text-center">
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
							Đặt Hàng Thành Công
						</span>
						<h1 className="font-serif text-3xl font-light text-sf-fg">
							Cảm ơn bạn đã tin tưởng SouFlow!
						</h1>
						<p className="text-xs text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto leading-relaxed">
							Đơn{" "}
							<strong className="text-sf-fg">
								{placedOrderDetails.businessId || placedOrderDetails.id}
							</strong>{" "}
							của bạn đã được xác nhận. Chúng tôi sẽ liên hệ qua SĐT{" "}
							<strong className="text-sf-fg">
								{placedOrderDetails.phoneNumber}
							</strong>
							.
						</p>
					</div>

					{/* Hoá đơn chi tiết */}
					<div className="rounded-xl border text-sf-fg bg-sf-surface p-5 text-left text-xs space-y-4">
						<h3 className="font-serif text-sm font-semibold pb-2 border-b border-[#EBE5DA]/50 dark:border-[#2C2C2C]/50">
							Hoá Đơn Chi Tiết
						</h3>

						{/* Danh sách sản phẩm */}
						{placedOrderDetails.items &&
							placedOrderDetails.items.length > 0 && (
								<div className="border-b border-dashed border-[#EBE5DA]/50 dark:border-[#2C2C2C]/50 pb-3 space-y-2">
									{placedOrderDetails.items.map((item, idx) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: no unique ID
											key={`item-${idx}`}
											className="flex justify-between items-center text-xs pb-3 border-b border-sf-border last:border-0 last:pb-0"
										>
											<div className="flex items-center gap-3 mr-4">
												{item.productImage ? (
													<div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-sf-border bg-sf-surface">
														<Image
															src={item.productImage}
															alt={item.productNameVn || "Product"}
															width={40}
															height={40}
															className="w-full h-full object-cover"
														/>
													</div>
												) : (
													<div className="w-10 h-10 rounded-md shrink-0 border border-sf-border bg-sf-surface flex items-center justify-center">
														<ShoppingBag className="w-4 h-4 text-sf-fg-muted opacity-50" />
													</div>
												)}
												<div className="text-sf-fg-muted line-clamp-2">
													{item.quantity}x{" "}
													{item.productNameVn ||
														item.productNameEng ||
														"Sản phẩm"}
												</div>
											</div>
											<div className="font-medium whitespace-nowrap">
												{Number(
													item.subtotal || item.productPrice * item.quantity,
												).toLocaleString("vi-VN")}{" "}
												đ
											</div>
										</div>
									))}
								</div>
							)}

						<div className="grid grid-cols-2 gap-y-2.5">
							<div className="text-sf-fg-muted">Mã Đơn Hàng:</div>
							<div className="text-right font-medium">
								{placedOrderDetails.businessId || placedOrderDetails.id}
							</div>

							<div className="text-sf-fg-muted">Phương Thức:</div>
							<div className="text-right font-medium uppercase">
								{paymentMethod || placedOrderDetails.paymentMethod}
							</div>

							<div className="text-sf-fg-muted">Người Nhận:</div>
							<div className="text-right font-medium">
								{placedOrderDetails.fullname}
							</div>

							<div className="text-sf-fg-muted">Phí Vận Chuyển:</div>
							<div className="text-right font-medium">
								{Number(placedOrderDetails.shippingFee || 0).toLocaleString(
									"vi-VN",
								)}{" "}
								đ
							</div>

							{placedOrderDetails.discountAmount &&
							placedOrderDetails.discountAmount > 0 ? (
								<>
									<div className="text-green-600 font-medium">
										Mã Giảm Giá ({placedOrderDetails.discountCode}):
									</div>
									<div className="text-right font-medium text-green-600">
										-
										{Number(placedOrderDetails.discountAmount).toLocaleString(
											"vi-VN",
										)}{" "}
										đ
									</div>
								</>
							) : null}

							<div className="border-t border-dashed pt-2.5 font-bold">
								Tổng Số Tiền:
							</div>
							<div className="border-t border-dashed pt-2.5 text-right font-bold text-lg text-[#C49B83]">
								{Number(placedOrderDetails.total).toLocaleString("vi-VN")} đ
							</div>
						</div>
					</div>

					<div className="pt-4">
						<Link
							href={soulFlowRoutes.home}
							className="inline-block px-6 py-3 rounded-full bg-amber-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C49B83] transition-colors"
						>
							Tiếp Tục Mua Sắm
						</Link>
					</div>
				</motion.div>
			</div>
		);
	}

	// ==========================================
	// MÀN HÌNH CHÍNH: FORM ĐIỀN THÔNG TIN
	// ==========================================
	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			<div className="text-center space-y-2 mb-10">
				<span className="text-sm font-bold tracking-widest text-[#C49B83] uppercase block">
					Thanh Toán An Toàn
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Xác Nhận Đơn Hàng Của Bạn
				</h1>
			</div>

			{cart.length === 0 ? (
				<div className="text-center py-20 bg-sf-bg-elevated rounded-2xl border text-sf-fg max-w-md mx-auto">
					<ShoppingBag className="mx-auto h-10 w-10 text-[#C49B83] opacity-65 mb-4" />
					<h3 className="font-serif text-lg">Giỏ hàng của bạn đang trống!</h3>
				</div>
			) : (
				<form
					onSubmit={handleSubmit(onPreSubmit)}
					className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start"
				>
					{/* CỘT TRÁI: THÔNG TIN VÀ PHƯƠNG THỨC TT */}
					<div className="lg:col-span-7 space-y-6">
						{/* Box 1: Người nhận */}
						<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-4">
							<h2 className="font-serif text-lg font-semibold flex items-center gap-2 border-b border-[#EBE5DA] pb-3">
								<Truck className="h-4.5 w-4.5 text-[#C49B83]" /> 1. Thông Tin
								Nhận Hàng
							</h2>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<label
										htmlFor="checkout-fullname"
										className="text-sm uppercase font-bold text-[#666666]"
									>
										Tên Người Nhận
									</label>
									<input
										id="checkout-fullname"
										{...register("fullName")}
										className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.fullName ? "border-red-500" : ""}`}
									/>
									{errors.fullName && (
										<p className="text-red-500 text-[10px] mt-1">
											{errors.fullName.message}
										</p>
									)}
								</div>
								<div className="space-y-1">
									<label
										htmlFor="checkout-phone"
										className="text-sm uppercase font-bold text-[#666666]"
									>
										SĐT
									</label>
									<input
										id="checkout-phone"
										type="tel"
										{...register("phone")}
										className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.phone ? "border-red-500" : ""}`}
									/>
									{errors.phone && (
										<p className="text-red-500 text-[10px] mt-1">
											{errors.phone.message}
										</p>
									)}
								</div>
							</div>

							{paymentMethod !== "STORE" && (
								<>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
										<div className="space-y-1">
											<label
												htmlFor="checkout-city"
												className="text-sm uppercase font-bold text-[#666666]"
											>
												Tỉnh/Thành phố
											</label>
											<select
												id="checkout-city"
												{...register("city")}
												className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.city ? "border-red-500" : ""}`}
											>
												<option value="">Chọn Tỉnh/Thành phố</option>
												{(locationData || []).map((c) => (
													<option key={c.code} value={c.code}>
														{c.name}
													</option>
												))}
											</select>
											{errors.city && (
												<p className="text-red-500 text-[10px] mt-1">
													{errors.city.message}
												</p>
											)}
										</div>
										<div className="space-y-1">
											<label
												htmlFor="checkout-district"
												className="text-sm uppercase font-bold text-[#666666]"
											>
												Quận/Huyện
											</label>
											<select
												id="checkout-district"
												{...register("district")}
												className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.district ? "border-red-500" : ""}`}
											>
												<option value="">Chọn Quận/Huyện</option>
												{(
													(locationData || []).find(
														(c) => String(c.code) === String(selectedCity),
													)?.districts || []
												).map((d: District) => (
													<option key={d.code} value={d.code}>
														{d.name}
													</option>
												))}
											</select>
											{errors.district && (
												<p className="text-red-500 text-[10px] mt-1">
													{errors.district.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
										<div className="space-y-1">
											<label
												htmlFor="checkout-ward"
												className="text-sm uppercase font-bold text-[#666666]"
											>
												Phường/Xã
											</label>
											<select
												id="checkout-ward"
												{...register("ward")}
												className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.ward ? "border-red-500" : ""}`}
											>
												<option value="">Chọn Phường/Xã</option>
												{(
													(locationData || [])
														.find(
															(c) => String(c.code) === String(selectedCity),
														)
														?.districts?.find(
															(d: District) =>
																String(d.code) === String(selectedDistrict) ||
																d.name === selectedDistrict,
														)?.wards || []
												).map((w: Ward) => (
													<option key={w.code} value={w.code}>
														{w.name}
													</option>
												))}
											</select>
											{errors.ward && (
												<p className="text-red-500 text-[10px] mt-1">
													{errors.ward.message}
												</p>
											)}
										</div>
										<div className="space-y-1">
											<label
												htmlFor="checkout-address"
												className="text-sm uppercase font-bold text-[#666666]"
											>
												Số nhà, tên đường
											</label>
											<input
												id="checkout-address"
												{...register("address")}
												placeholder="Nhập địa chỉ cụ thể"
												className={`w-full text-xs rounded-lg border bg-sf-surface p-3 outline-none ${errors.address ? "border-red-500" : ""}`}
											/>
											{errors.address && (
												<p className="text-red-500 text-[10px] mt-1">
													{errors.address.message}
												</p>
											)}
										</div>
									</div>
								</>
							)}
						</div>

						{/* Box 2: Payment Methods */}
						<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-4">
							<h2 className="font-serif text-lg font-semibold flex items-center gap-2 border-b border-[#EBE5DA] pb-3">
								<CreditCard className="h-4.5 w-4.5 text-[#C49B83]" /> 2. Phương
								Thức Thanh Toán
							</h2>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
								{[
									{
										id: "SEPAY" as const,
										label: "Mã QR SePay",
										desc: "Xác nhận tự động tức thì.",
									},
									{
										id: "COD" as const,
										label: "Giao Hàng (COD)",
										desc: "Thanh toán khi nhận hoa.",
									},
									{
										id: "STORE" as const,
										label: "Tại Cửa Hàng",
										desc: "Nhận hoa trực tiếp tại tiệm.",
									},
								].map((pay) => {
									const isChose = paymentMethod === pay.id;
									return (
										<button
											key={pay.id}
											type="button"
											onClick={() => setPaymentMethod(pay.id)}
											className={`text-left p-4 rounded-xl border transition-all h-24 flex flex-col justify-between cursor-pointer ${isChose
													? "border-[#C49B83] bg-[#C49B83]/10 ring-1 ring-[#C49B83]"
													: "hover:border-[#C49B83] bg-sf-bg"
												}`}
										>
											<span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
												{pay.label}
											</span>
											<p className="text-[11px] sm:text-xs text-sf-fg-muted">{pay.desc}</p>
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* CỘT PHẢI: BILLING (Giữ nguyên giao diện của bạn) */}
					<div className="lg:col-span-5 bg-sf-bg-elevated p-6 rounded-2xl border border-[#EBE5DA] dark:border-[#222222] shadow-xs space-y-5">
						<h2 className="font-serif text-lg font-semibold pb-3 border-b border-[#EBE5DA] flex items-center gap-2">
							<ShoppingBag className="h-4.5 w-4.5 text-[#C49B83]" /> 3. Đơn Hàng
							Của Bạn
						</h2>

						<div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sf-border scrollbar-track-transparent">
							{cart.map((item) => (
								<div
									key={item.product.id}
									className="flex gap-3 justify-between items-start text-xs border-b border-sf-border pb-3"
								>
									<div className="flex gap-3">
										<div className="relative h-12 w-12 rounded-lg overflow-hidden bg-sf-bg shrink-0 border border-sf-border">
											<Image
												src={
													item.product.imageUrl ||
													item.product.images?.[0] ||
													"/placeholder.png"
												}
												alt={item.product.nameVn}
												className="object-cover"
												referrerPolicy="no-referrer"
												fill
												sizes="48px"
											/>
										</div>
										<div className="flex flex-col justify-between py-0.5">
											<h4 className="font-serif font-semibold text-sf-fg line-clamp-1 leading-tight">
												{item.product.nameVn}
											</h4>
											{/* Controls số lượng */}
											<div className="flex items-center gap-2 mt-2">
												<button
													type="button"
													disabled={item.quantity <= 1}
													onClick={(e) => {
														e.preventDefault();
														updateCartQuantity(
															item.product.id,
															item.quantity - 1,
														);
													}}
													className="h-5 w-5 rounded border border-sf-border bg-sf-surface hover:bg-sf-bg flex items-center justify-center disabled:opacity-50 transition-colors"
												>
													-
												</button>
												<span className="w-3 text-center text-[11px] font-medium">
													{item.quantity}
												</span>
												<button
													type="button"
													disabled={item.quantity >= item.product.stockQuantity}
													onClick={(e) => {
														e.preventDefault();
														updateCartQuantity(
															item.product.id,
															item.quantity + 1,
														);
													}}
													className="h-5 w-5 rounded border border-sf-border bg-sf-surface hover:bg-sf-bg flex items-center justify-center disabled:opacity-50 transition-colors"
												>
													+
												</button>
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end gap-1">
										<span className="font-bold text-sf-fg">
											{(item.product.price * item.quantity).toLocaleString(
												"vi-VN",
											)}{" "}
											đ
										</span>
										{item.quantity > 1 && (
											<span className="text-[10px] text-sf-fg-muted">
												{item.product.price.toLocaleString("vi-VN")} đ/sp
											</span>
										)}
									</div>
								</div>
							))}
						</div>

						{/* Phần nhập mã giảm giá */}
						<div className="pt-4 border-t border-sf-border mt-4">
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Nhập mã giảm giá..."
									value={discountCodeInput}
									onChange={(e) => setDiscountCodeInput(e.target.value)}
									className="flex-1 text-xs rounded-lg border bg-sf-surface p-3 outline-none"
								/>
								<button
									type="button"
									onClick={handleApplyDiscount}
									disabled={isApplyingDiscount || !discountCodeInput.trim()}
									className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg uppercase disabled:opacity-50"
								>
									{isApplyingDiscount ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Áp dụng"
									)}
								</button>
							</div>
							{appliedDiscount && (
								<div className="mt-2 flex items-center justify-between bg-green-50 text-green-700 p-2 rounded text-xs border border-green-200">
									<div>
										<span className="font-bold">{appliedDiscount.code}</span>
										<span className="ml-2">
											- Giảm {appliedDiscount.percentage}%
										</span>
									</div>
									<button
										type="button"
										onClick={removeDiscount}
										className="text-red-500 hover:underline"
									>
										Gỡ bỏ
									</button>
								</div>
							)}
						</div>

						<div className="space-y-2 text-xs pt-4">
							<div className="flex justify-between">
								<span>Phí Ship</span>
								<span>{shippingFee.toLocaleString("vi-VN")} đ</span>
							</div>
							<div className="flex justify-between">
								<span>Thành Tiền</span>
								<span>{subtotal.toLocaleString("vi-VN")} đ</span>
							</div>
							{discount > 0 && (
								<div className="flex justify-between text-green-500 font-semibold uppercase">
									<span>Khuyến mãi</span>
									<span>-{discount.toLocaleString("vi-VN")} đ</span>
								</div>
							)}
							<div className="flex justify-between font-bold text-sm border-t border-sf-border pt-3">
								<span>Tổng Cộng</span>
								<span className="text-[#C49B83] text-base">
									{total.toLocaleString("vi-VN")} đ
								</span>
							</div>
						</div>

						<button
							disabled={isSubmitting || isPlacingOrder || !paymentMethod}
							type="submit"
							className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#1A1A1A] py-4 text-xs font-bold uppercase text-white hover:bg-[#C49B83] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting || isPlacingOrder ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Check className="h-4 w-4" />
							)}
							{isSubmitting || isPlacingOrder
								? "Đang Xử Lý..."
								: !paymentMethod
									? "Vui lòng chọn P.Thức TT"
									: "Xác Nhận Thanh Toán"}
						</button>
					</div>
				</form>
			)}

			{/* POPUP XÁC NHẬN THANH TOÁN */}
			{showConfirmPopup && (
				<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-sf-bg-elevated w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-sf-border text-center space-y-4"
					>
						<h3 className="font-serif text-2xl font-semibold text-sf-fg">
							Xác Nhận Đặt Hàng
						</h3>
						<p className="text-sm text-sf-fg-muted">
							Bạn có chắc chắn muốn tiến hành thanh toán cho đơn hàng này không?
						</p>
						<div className="flex gap-3 justify-center pt-4">
							<button
								type="button"
								onClick={() => setShowConfirmPopup(false)}
								className="px-6 py-2 rounded-full border border-sf-border text-sf-fg text-xs font-bold uppercase tracking-widest hover:bg-sf-surface transition-colors"
							>
								Huỷ
							</button>
							<button
								type="button"
								disabled={isSubmitting || isPlacingOrder}
								onClick={() => {
									setShowConfirmPopup(false);
									if (pendingOrderData) {
										onSubmit(pendingOrderData);
									}
								}}
								className="px-6 py-2 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C49B83] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								{isSubmitting || isPlacingOrder ? "Đang xử lý..." : "Chắc chắn"}
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}
