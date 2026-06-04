"use client";

import { ArrowRight, Filter, Leaf, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { soulFlowRoutes } from "@/lib/soulflow/routes";
import { useSoulFlowStore } from "@/store/soulflow-store";

export function Hero() {
	const { flowers, setSelectedCategory, addToCart } = useSoulFlowStore();

	const budgetTiers = [
		{
			label: "Petite Delight",
			value: "$45 - $60",
			img: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=300",
			desc: "Thiết kế tinh tế nhỏ gọn, tô điểm bàn làm việc.",
		},
		{
			label: "Atelier Signature",
			value: "$75 - $110",
			img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&q=80&w=300",
			desc: "Bó hoa xoắn tròn nguyên bản tinh xảo từ nghệ nhân.",
		},
		{
			label: "Grand Opulence",
			value: "$120 - $200+",
			img: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=300",
			desc: "Cực phẩm hoa quý phái sang trọng cho buổi lễ đỉnh cao.",
		},
	];

	const brandPillars = [
		{
			icon: Sparkles, // Giữ lại icon cũ
			title: "Hoa Tươi Mỗi Ngày",
			desc: "Cam kết sử dụng hoa tươi mới nhập về trong ngày, được chăm chút cẩn thận trước khi giao đến tay bạn.",
		},
		{
			icon: Leaf,
			title: "Nguồn Gốc Rõ Ràng",
			desc: "Hoa được nhập trực tiếp từ các nhà vườn uy tín tại Đà Lạt và các khu vực lân cận, đảm bảo chất lượng.",
		},
		{
			icon: Filter, // Hoặc đổi sang icon Heart/Smile nếu có
			title: "Tận Tâm Phục Vụ",
			desc: "Luôn lắng nghe nhu cầu của khách hàng để mang đến những sản phẩm hoa ưng ý và ý nghĩa nhất.",
		},
	];

	const categoriesToShow = [
		{
			id: "Roses",
			title: "Bộ Sưu Tập Hoa Hồng Premium",
			subtitle:
				"Khơi gợi nét lãng mạn tinh tế và chiều sâu cảm xúc đầy quý phái.",
		},
		{
			id: "Peonies",
			title: "Mẫu Đơn Vương Giả",
			subtitle:
				"Biểu trưng hoàng cung cao sang, sự thịnh vượng và sung túc trọn vẹn.",
		},
		{
			id: "Dried Botanicals",
			title: "Hoa Khô Bản Nghệ Thuật",
			subtitle:
				"Gìn giữ nét thanh tao vĩnh cửu, mang phong cách châu Âu cổ cổ điển.",
		},
		{
			id: "Exotics",
			title: "Sắc Hoa Nhập Khẩu Độc Bản",
			subtitle:
				"Nghệ thuật thăng hoa của sắc màu độc bản quý hiếm trên thế giới.",
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
					{/* Left Text Column */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="lg:col-span-12 xl:col-span-7 space-y-6 text-center lg:text-left"
					>
						{/* <div className="inline-flex items-center gap-2 rounded-full border border-(--sf-accent)/30 bg-sf-accent/10 px-3 py-1 text-sm font-bold tracking-widest uppercase text-sf-accent">
							<Sparkles className="h-3.5 w-3.5 animate-spin" />
							NGHỆ THUẬT HOA THIẾT KẾ RIÊNG
						</div> */}

						<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-sf-fg leading-tight">
							Hoa dành cho những
							<br />
							<span className="font-normal italic text-sf-accent">
								khoảnh khắc đáng nhớ
							</span>
						</h1>

						<p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-sf-fg-muted font-light leading-relaxed">
							Chào mừng bạn đến với{" "}
							<span className="font-medium text-sf-fg">SoulFlow</span>, Chúng
							tôi lưu giữ thông điệp lãng mạn thông qua ngôn từ tinh tế của cánh
							hoa tươi nguyên bản.
						</p>

						<div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
							<Link
								id="hero-shop-now-btn"
								href={soulFlowRoutes.catalog}
								onClick={() => setSelectedCategory("All")}
								className="group flex items-center gap-2 rounded-full bg-sf-fg px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-sf-bg hover:bg-sf-accent hover:text-white transition-all duration-300 shadow-md cursor-pointer"
							>
								Khám Phá Cửa Hàng
								<ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
							</Link>

							{/* <Link
								id="hero-bespoke-btn"
								href={soulFlowRoutes.bespoke}
								className="flex items-center gap-2 rounded-full border border-sf-accent bg-transparent px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-sf-accent hover:bg-sf-accent/10 transition-colors duration-300 cursor-pointer"
							>
								Tư Vấn Thợ Hoa AI
								<Sparkles className="h-4 w-4 text-sf-accent" />
							</Link> */}
						</div>
					</motion.div>

					{/* Right Floating Image Layout */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.1 }}
						className="lg:col-span-12 xl:col-span-5 relative"
					>
						{/* Main Image Frame */}
						<div className="relative aspect-4/5 w-full h-110 overflow-hidden rounded-xl">
							<Image
								src="/images/hero-main.jpg"
								alt="SoulFlow luxury floral bouquet curation"
								className="aspect-4/5 w-full object-cover grayscale-10 hover:grayscale-0 transition-all duration-700 hover:scale-105"
								referrerPolicy="no-referrer"
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
								priority
							/>

							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

							<div className="absolute bottom-6 left-28 z-10">
								<span className="text-base uppercase tracking-widest text-rose-500 font-bold drop-shadow-sm">
									BẢN TÌNH CA MÙA XUÂN
								</span>
								<h3 className="font-serif text-xl font-normal leading-tight text-white drop-shadow-md mt-1">
									Bó Tulip Đỏ Chân Thành
								</h3>
							</div>
						</div>

						{/* Little floating detail card */}
						<div className="absolute -bottom-6 -left-20 hidden sm:block p-4 rounded-xl border border-sf-border bg-(--sf-bg-elevated)/90 backdrop-blur-md shadow-lg max-w-46">
							<span className="font-serif font-bold text-sf-accent italic text-base block">
								Ý nghĩa của Tulip đỏ
							</span>
							<p className="text-sm font-medium text-sf-fg mt-1">
								&quot;Biểu tượng của một tình yêu hoàn hảo, chân thành và lời tỏ
								tình sâu đậm từ trái tim.&quot;
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Brand Pillars */}
			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-3 border-y border-sf-border py-12">
					{brandPillars.map((p, idx) => (
						<motion.div
							id={`hero-pillar-${p.title.toLowerCase().replace(/\s+/g, "-")}`}
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

			{/* CATEGORY SHOWCASE ROWS SECTION */}
			<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
				<div className="text-center space-y-2">
					<span className="text-sm font-bold tracking-widest text-sf-accent uppercase block">
						Bộ Sưu Tập Nổi Bật
					</span>
					<h2 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
						Bản Thiết Kế Nổi Bật Trang Chủ
					</h2>
					<p className="max-w-md mx-auto text-xs text-sf-fg-muted font-light">
						Các tác phẩm tiêu biểu được nghệ nhân kiến tạo đặc biệt theo hàng
						danh mục. Ấn xem tất cả để khám phá toàn diện.
					</p>
				</div>

				{categoriesToShow.map((cat) => {
					const categoryFlowers = flowers
						.filter((f) => f.category === cat.id)
						.slice(0, 4);
					if (categoryFlowers.length === 0) return null;

					return (
						<div
							key={cat.id}
							className="space-y-6"
							id={`home-category-row-${cat.id.toLowerCase()}`}
						>
							{/* Category Header Row */}
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-sf-border pb-3">
								<div>
									<h3 className="font-serif text-xl font-medium text-sf-fg">
										{cat.title}
									</h3>
									<p className="text-xs text-sf-fg-muted font-light mt-0.5">
										{cat.subtitle}
									</p>
								</div>

								<Link
									id={`home-view-all-${cat.id.toLowerCase()}`}
									href={soulFlowRoutes.catalog}
									onClick={() => setSelectedCategory(cat.id)}
									className="group flex items-center gap-1.5 text-xs font-bold text-sf-accent hover:text-sf-fg uppercase tracking-widest transition-colors cursor-pointer"
								>
									Xem tất cả
									<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
								</Link>
							</div>

							{/* Flowers Grid for this Category (Max 4 items) */}
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
								{categoryFlowers.map((flower) => (
									<motion.div
										id={`home-flower-card-${flower.id}`}
										key={flower.id}
										whileHover={{ y: -6 }}
										className="group relative cursor-pointer flex flex-col h-full bg-sf-bg-elevated border border-sf-border rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300"
									>
										{/* Image Area */}
										<Link
											href={soulFlowRoutes.product(flower.id)}
											className="relative block aspect-square w-full overflow-hidden rounded-lg bg-sf-surface"
										>
											<Image
												src={flower.image}
												alt={flower.name}
												className="h-full w-full object-cover group-hover:scale-104 transition-transform duration-500"
												referrerPolicy="no-referrer"
												fill
												sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
												loading="eager"
											/>

											{flower.popular && (
												<span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-amber-500 text-white px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase">
													BEST
												</span>
											)}
										</Link>

										{/* Metadata */}
										<div className="flex flex-col justify-between grow mt-3">
											<Link
												href={soulFlowRoutes.product(flower.id)}
												className="block"
											>
												<h4 className="font-serif text-sm font-semibold text-sf-fg group-hover:text-sf-accent transition-colors line-clamp-1">
													{flower.name}
												</h4>

												<p className="font-mono text-xs text-sf-fg-muted italic mt-0.5">
													{flower.scientificName}
												</p>

												<p className="text-[11px] text-sf-fg-muted font-light mt-1.5 line-clamp-2 h-8 leading-normal">
													{flower.description}
												</p>
											</Link>

											{/* Buy Action and Price */}
											<div className="flex items-center justify-between border-t border-sf-border mt-3 pt-2">
												<div>
													<span className="text-sm text-sf-fg font-bold">
														${flower.priceMedium}
													</span>
												</div>

												<button
													type="button"
													id={`home-add-cart-${flower.id}`}
													onClick={(e) => {
														e.stopPropagation();
														addToCart(flower, "M");
													}}
													className="flex h-7 w-7 items-center justify-center rounded-full bg-sf-fg text-sf-bg hover:bg-sf-accent hover:text-white transition-all cursor-pointer"
												>
													<Plus className="h-3 w-3" />
												</button>
											</div>
										</div>
									</motion.div>
								))}
							</div>
						</div>
					);
				})}
			</section>

			{/* Design By Budget Section */}
			<section className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6 lg:px-8">
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
					{budgetTiers.map((tier) => (
						<Link
							key={tier.label}
							href={soulFlowRoutes.catalog}
							onClick={() => setSelectedCategory("All")}
							className="block"
						>
							<motion.div
								id={`hero-budget-tier-${tier.label.toLowerCase().replace(/\s+/g, "-")}`}
								whileHover={{ y: -8 }}
								className="group cursor-pointer overflow-hidden rounded-xl border border-sf-border bg-sf-bg-elevated p-4 shadow-sm hover:shadow-md transition-all duration-300"
							>
								<div className="relative aspect-16/10 w-full overflow-hidden rounded-lg bg-sf-surface">
									<Image
										src={tier.img}
										alt={tier.label}
										className="h-full w-full object-cover grayscale-2/10 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
										referrerPolicy="no-referrer"
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
										loading="eager"
									/>

									<span className="absolute top-3 right-3 rounded-full bg-black/80 backdrop-blur-md px-3 py-1 text-xs font-bold text-white tracking-widest">
										{tier.value}
									</span>
								</div>

								<div className="mt-4 space-y-1">
									<h3 className="font-serif text-base font-semibold text-sf-fg group-hover:text-sf-accent transition-colors">
										{tier.label}
									</h3>

									<p className="text-xs text-sf-fg-muted font-light text-ellipsis overflow-hidden">
										{tier.desc}
									</p>
								</div>
							</motion.div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
