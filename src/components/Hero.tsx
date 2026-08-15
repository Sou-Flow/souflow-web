"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Filter, Leaf, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { soulFlowRoutes } from "@/lib/souflow/routes";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useCategoryStore } from "@/store/category-store";

export function Hero() {
	const [_isMounted, setIsMounted] = useState(false);
	const { user } = useAuthStore();
	const { addToCart, cart } = useCartStore();
	const { setSelectedCategory } = useCategoryStore();
	const router = useRouter();
	const [addingItems, setAddingItems] = useState<Record<number, boolean>>({});

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const rawData = await categoryService.getAllCategory();
			return rawData;
		},
	});

	const { data: flowers = [] } = useQuery({
		queryKey: ["flowers"],
		queryFn: async () => {
			const rawData = await productService.getAllFlower();
			return rawData;
		},
	});

	const randomBudgetFlowers = useMemo(() => {
		if (!flowers || flowers.length === 0) return [];

		// Giả định property chứa giá trị số nguyên của bạn là 'price'
		const budgetFlowers = flowers.filter((f) => f.price < 500000);

		// Randomize (xáo trộn) mảng và lấy 3 phần tử đầu
		// eslint-disable-next-line react-hooks/purity
		const shuffled = [...budgetFlowers].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, 3);
	}, [flowers]);

	const _budgetTiers = [
		{
			label: "Petite Delight",
			value: "Dưới 500k",
			img: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=300",
			desc: "Thiết kế tinh tế nhỏ gọn, tô điểm bàn làm việc.",
		},
		{
			label: "Atelier Signature",
			value: "500k - 1 Triệu",
			img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=300",
			desc: "Bó hoa xoắn tròn nguyên bản tinh xảo từ nghệ nhân.",
		},
		{
			label: "Grand Opulence",
			value: "Trên 1 Triệu",
			img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=300",
			desc: "Cực phẩm hoa quý phái sang trọng cho buổi lễ đỉnh cao.",
		},
	];

	const brandPillars = [
		{
			icon: Sparkles,
			title: "Hoa Tươi Mỗi Ngày",
			desc: "Cam kết sử dụng hoa tươi mới nhập về trong ngày, được chăm chút cẩn thận trước khi giao đến tay bạn.",
		},
		{
			icon: Leaf,
			title: "Nguồn Gốc Rõ Ràng",
			desc: "Hoa được nhập trực tiếp từ các nhà vườn uy tín tại Đà Lạt và các khu vực lân cận, đảm bảo chất lượng.",
		},
		{
			icon: Filter,
			title: "Tận Tâm Phục Vụ",
			desc: "Luôn lắng nghe nhu cầu của khách hàng để mang đến những sản phẩm hoa ưng ý và ý nghĩa nhất.",
		},
	];

	return (
		<div className="relative overflow-hidden bg-sf-bg transition-colors duration-300">
			{/* Decorative Blur Orbs */}
			<div className="absolute top-1/4 left-1/10 h-72 w-72 rounded-full bg-sf-accent/10 blur-3xl" />
			<div className="absolute bottom-1/4 right-1/10 h-96 w-96 rounded-full bg-(--sf-surface)/50 blur-3xl" />

			{/* Main Hero Showcase */}
			<section className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-10">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="lg:col-span-12 xl:col-span-7 space-y-6 text-center lg:text-left"
					>
						<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-sf-fg leading-tight">
							Hoa dành cho những
							<br />
							<span className="font-normal italic text-sf-accent">
								khoảnh khắc đáng nhớ
							</span>
						</h1>

						<p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-sf-fg-muted font-light leading-relaxed">
							Chào mừng bạn đến với{" "}
							<span className="font-medium text-sf-fg">SouFlow</span>. Chúng
							tôi lưu giữ thông điệp lãng mạn thông qua ngôn từ tinh tế của cánh
							hoa tươi nguyên bản.
						</p>

						<div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
							<Link
								id="hero-shop-now-btn"
								href={soulFlowRoutes.catalog}
								onClick={() => setSelectedCategory(null)} // Reset về All (null) khi vào shop
								className="group flex items-center gap-2 rounded-full bg-sf-fg px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-sf-bg hover:bg-sf-accent hover:text-white transition-all duration-300 shadow-md cursor-pointer"
							>
								Khám Phá Cửa Hàng
								<ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
							</Link>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.1 }}
						className="lg:col-span-12 xl:col-span-5 relative"
					>
						<div className="relative aspect-4/5 w-full h-72 sm:h-96 md:h-110 overflow-hidden rounded-xl">
							<div className="absolute inset-0 bg-sf-surface" />{" "}
							{/* Main Hero Image */}
							<Image
								src="/images/about-us-main1.avif"
								alt="Hero Image"
								fill
								sizes="(max-width: 768px) 100vw, 500px"
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
							<div className="absolute bottom-6 left-6 sm:left-10 z-10">
								<span className="text-xs sm:text-base uppercase tracking-widest text-rose-500 font-bold drop-shadow-sm">
									BẢN TÌNH CA MÙA XUÂN
								</span>
								<h3 className="font-serif text-lg sm:text-xl font-normal leading-tight text-white drop-shadow-md mt-1">
									Bộ Sưu Tập Mới Nhất
								</h3>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Brand Pillars */}
			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3 border-y border-sf-border py-12">
					{brandPillars.map((p, idx) => (
						<motion.div
							key={p.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: idx * 0.1 }}
							className="flex items-start gap-4"
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sf-accent/10 text-sf-accent">
								<p.icon className="h-5 w-5" />
							</div>
							<div className="space-y-1">
								<h3 className="font-serif text-base font-medium text-sf-fg">
									{p.title}
								</h3>
								<p className="text-sm text-sf-fg-muted font-light leading-relaxed">
									{p.desc}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* CATEGORY SHOWCASE ROWS SECTION (ĐÃ KẾT NỐI API) */}
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
				<div className="text-center space-y-2">
					<span className="text-sm font-bold tracking-widest text-sf-accent uppercase block">
						Bộ Sưu Tập Nổi Bật
					</span>
					<h2 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
						Bản Thiết Kế Nổi Bật Trang Chủ
					</h2>
					<p className="max-w-md mx-auto text-xs text-sf-fg-muted font-light">
						Các tác phẩm tiêu biểu được nghệ nhân kiến tạo đặc biệt theo từng
						danh mục. Ấn xem tất cả để khám phá toàn diện.
					</p>
				</div>

				{/* 2. Map qua danh sách category lấy từ BE (Giới hạn hiển thị 4 danh mục thôi cho đỡ dài) */}
				{categories.slice(0, 4).map((cat) => {
					// 3. Lọc hoa thuộc category này (so sánh categoryId với pk của category)
					const categoryFlowers = flowers
						.filter((f) => f.categoryId === cat.id)
						.slice(0, 4); // Chỉ lấy 4 sản phẩm đầu tiên

					// Nếu danh mục chưa có sản phẩm nào thì ẩn luôn dòng đó
					if (categoryFlowers.length === 0) return null;

					return (
						<div key={cat.id} className="space-y-6">
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-sf-border pb-3">
								<div>
									<h3 className="font-serif text-xl font-medium text-sf-fg">
										{cat.nameVn} {/* Lấy tên tiếng Việt từ DTO */}
									</h3>
									<p className="text-xs text-sf-fg-muted font-light mt-0.5">
										{cat.descriptionVn || "Khám phá bộ sưu tập độc đáo"}
									</p>
								</div>

								<Link
									href={soulFlowRoutes.catalog}
									onClick={() => setSelectedCategory(cat.id)} // Set đúng PK của danh mục khi bấm Xem tất cả
									className="group flex items-center gap-1.5 text-xs font-bold text-sf-accent hover:text-sf-fg uppercase tracking-widest transition-colors cursor-pointer"
								>
									Xem tất cả
									<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
								</Link>
							</div>

							<div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
								{categoryFlowers.map((flower) => {
									const cartItem = cart.find((i) => i.product.id === flower.id);
									const currentCartQty = cartItem ? cartItem.quantity : 0;
									const availableStock = Math.max(
										0,
										flower.stockQuantity - currentCartQty,
									);

									return (
										<motion.div
											key={flower.id}
											whileHover={{ y: -6 }}
											className="group relative cursor-pointer flex flex-col h-full bg-sf-bg-elevated border border-sf-border rounded-xl p-2.5 sm:p-3 shadow-xs hover:shadow-md transition-all duration-300"
										>
											<Link
												href={soulFlowRoutes.product(
													flower.businessId || flower.code || String(flower.id),
												)}
												className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-sf-surface items-center justify-center text-sf-fg-muted text-xs ${availableStock <= 0 ? "grayscale opacity-70" : ""}`}
											>
												<Image
													src={flower.imageUrl || "/images/about-us-main1.avif"}
													alt={flower.nameVn}
													fill
													sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
													className="object-cover group-hover:scale-105 transition-transform duration-500"
												/>
												{availableStock <= 0 && (
													<div className="absolute inset-0 flex items-center justify-center bg-black/30">
														<span className="bg-sf-fg text-sf-bg px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider">
															Hết hàng
														</span>
													</div>
												)}
											</Link>

											<div className="flex flex-col justify-between grow mt-2.5 sm:mt-3">
												<Link
													href={soulFlowRoutes.product(
														flower.businessId ||
															flower.code ||
															String(flower.id),
													)}
													className="block"
												>
													<h4 className="font-serif text-xs sm:text-sm font-semibold text-sf-fg group-hover:text-sf-accent transition-colors line-clamp-1">
														{flower.nameVn} {/* Tên hoa */}
													</h4>

													<p className="text-[10px] sm:text-[11px] text-sf-fg-muted font-light mt-1 sm:mt-1.5 line-clamp-2 h-7 sm:h-8 leading-normal">
														{flower.descriptionVn} {/* Mô tả hoa */}
													</p>
												</Link>

												<div className="flex items-center justify-between border-t border-sf-border mt-2.5 sm:mt-3 pt-2">
													<div>
														<span className="text-[9px] sm:text-[10px] text-sf-fg-muted uppercase tracking-wider block font-bold">
															{availableStock > 0
																? `Kho: ${availableStock}`
																: "Hết hàng"}
														</span>
														<span className="text-xs sm:text-sm text-sf-fg font-bold">
															{flower.formattedPrice}{" "}
															{/* Giá đã format sẵn "120.000 ₫" */}
														</span>
													</div>

													<button
														type="button"
														onClick={async (e) => {
															e.stopPropagation();
															if (availableStock <= 0) return;
															if (!user) {
																toast.error(
																	"Vui lòng đăng nhập để thêm vào giỏ hàng",
																);
																router.push("/login");
																return;
															}
															setAddingItems((prev) => ({
																...prev,
																[flower.id]: true,
															}));
															await addToCart(flower);
															setAddingItems((prev) => ({
																...prev,
																[flower.id]: false,
															}));
														}}
														disabled={
															addingItems[flower.id] || availableStock <= 0
														}
														className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-sf-fg text-sf-bg hover:bg-sf-accent hover:text-white transition-colors duration-200 cursor-pointer disabled:bg-gray-400 disabled:text-gray-200 shrink-0"
														aria-label="Add to cart"
													>
														{addingItems[flower.id] ? (
															<div className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
														) : (
															<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
														)}
													</button>
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</div>
					);
				})}
			</section>

			{/* Design By Budget Section */}
			<section className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6 lg:px-8">
				{/* Giữ nguyên phần render của BudgetTiers */}
				<div className="text-center space-y-2 mb-12">
					<span className="text-sm font-bold tracking-widest text-sf-accent uppercase block">
						Thanh lịch mang dấu ấn riêng
					</span>
					<h2 className="font-serif text-3xl font-light text-sf-fg">
						Lựa Chọn Theo Ngân Sách
					</h2>
					<p className="max-w-md mx-auto text-xs text-sf-fg-muted font-light">
						Chúng tôi kiến tạo các tác phẩm thích ứng tuyệt đẹp theo từng phân
						khúc tài chính để mang trọn mỹ cảm đến bạn.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{randomBudgetFlowers.map((flower) => (
						<Link
							key={flower.id}
							href={soulFlowRoutes.product(
								flower.businessId || flower.code || String(flower.id),
							)}
							className="block"
						>
							<motion.div
								whileHover={{ y: -8 }}
								className="group cursor-pointer overflow-hidden rounded-xl border border-sf-border bg-sf-bg-elevated p-4 shadow-sm hover:shadow-md transition-all duration-300"
							>
								<div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-sf-surface flex items-center justify-center text-sf-fg-muted">
									<Image
										src={flower.imageUrl || "/images/about-us-main1.avif"}
										alt={flower.nameVn}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-500"
									/>

									<span className="absolute top-3 right-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white tracking-widest">
										{flower.formattedPrice}
									</span>
								</div>

								<div className="mt-4 space-y-1">
									<h3 className="font-serif text-base font-semibold text-sf-fg group-hover:text-sf-accent transition-colors line-clamp-1">
										{flower.nameVn}
									</h3>
									<p className="text-xs text-sf-fg-muted font-light text-ellipsis overflow-hidden line-clamp-2">
										{flower.descriptionVn ||
											"Thiết kế tinh tế nhỏ gọn, điểm tô không gian."}
									</p>
								</div>
							</motion.div>
						</Link>
					))}
					{randomBudgetFlowers.length === 0 && (
						<p className="col-span-3 text-center text-sm text-sf-fg-muted py-8">
							Chưa có sản phẩm nào phù hợp với ngân sách này.
						</p>
					)}
				</div>
			</section>
		</div>
	);
}
