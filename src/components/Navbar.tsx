"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronDown,
	LogIn,
	LogOut,
	Menu,
	Search,
	ShoppingBag,
	SquarePen,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { soulFlowRoutes } from "@/lib/soulflow/routes";
import { authService } from "@/services/authService";
import { categoryService } from "@/services/categoryService";
import { useSoulFlowStore } from "@/store/soulflow-store";
import { mapCategoryResponseToFE } from "@/types/category.type";

type NavbarProps = {
	onOpenCart: () => void;
};

export function Navbar({ onOpenCart }: NavbarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const {
		cart,
		user,
		setUser,
		searchQuery,
		setSearchQuery,
		selectedCategory,
		setSelectedCategory,
	} = useSoulFlowStore();

	const isHome = pathname === soulFlowRoutes.home;
	const isCatalog = pathname.startsWith(soulFlowRoutes.catalog);
	//const isBespoke = pathname === soulFlowRoutes.bespoke;
	const isContact = pathname === soulFlowRoutes.contact;
	const isAccount = pathname === soulFlowRoutes.account;
	const isAbout = pathname === soulFlowRoutes.about;
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const rawData = await categoryService.getAllCategory();
			return rawData.map(mapCategoryResponseToFE);
		},
	});

	const showToast = (
		message: string,
		type: "success" | "error" | "loading" = "success",
	) => {
		if (type === "success") {
			toast.success(message);
		} else if (type === "error") {
			toast.error(message);
		} else if (type === "loading") {
			toast.loading(message);
		} else {
			toast(message);
		}
	};

	const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	const handleCategorySelect = (catId: number) => {
		setSelectedCategory(catId);
		router.push(soulFlowRoutes.catalog);
		setIsDropdownOpen(false);
	};

	const goToCatalogWithSearch = (query: string) => {
		setSearchQuery(query);
		if (!isCatalog) {
			router.push(soulFlowRoutes.catalog);
		}
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b border-sf-border bg-sf-bg/90 backdrop-blur-md transition-colors duration-300">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between gap-4">
					{/* Logo */}
					<div className="flex items-center shrink-0">
						<Link
							id="navbar-logo-btn"
							href={soulFlowRoutes.home}
							onClick={() => {
								setSelectedCategory(null);
								setSearchQuery("");
							}}
							className="group flex items-center gap-3 text-left cursor-pointer"
						>
							{/* The Blooming Petal Logo */}
							<div className="relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-[#C49B83]/10 bg-white shadow-sm transition-all duration-500 hover:shadow-md group">
								{/* 4 cánh hoa */}
								<div className="absolute h-5 w-5 -translate-x-1.5 -translate-y-1.5 rounded-tr-full rounded-bl-full bg-[#C49B83]/20 transition-transform duration-500 group-hover:rotate-45 group-hover:bg-[#C49B83]/40"></div>
								<div className="absolute h-5 w-5 translate-x-1.5 -translate-y-1.5 rounded-tl-full rounded-br-full bg-[#C49B83]/30 transition-transform duration-500 group-hover:-rotate-45 group-hover:bg-[#C49B83]/50"></div>
								<div className="absolute h-5 w-5 -translate-x-1.5 translate-y-1.5 rounded-tl-full rounded-br-full bg-[#C49B83]/40 transition-transform duration-500 group-hover:-rotate-45 group-hover:bg-[#C49B83]/60"></div>
								<div className="absolute h-5 w-5 translate-x-1.5 translate-y-1.5 rounded-tr-full rounded-bl-full bg-[#C49B83]/50 transition-transform duration-500 group-hover:rotate-45 group-hover:bg-[#C49B83]/70"></div>

								{/* Nhụy hoa trung tâm */}
								<div className="relative z-10 h-2 w-2 scale-100 rounded-full border border-[#C49B83] bg-white shadow-sm transition-transform group-hover:scale-125"></div>
							</div>

							{/* Brand text */}
							<div className="leading-tight">
								<span className="block font-serif md:text-lg text-base font-semibold tracking-[0.28em] text-sf-fg">
									SOULFLOW
								</span>
							</div>
						</Link>
					</div>

					{/* Desktop Nav Links & Interactive Dropdown on Hover */}
					<nav
						className="hidden md:flex space-x-1 items-center"
						aria-label="Desktop navigation"
					>
						{/* Home Link */}
						<Link
							id="nav-link-home"
							href={soulFlowRoutes.home}
							className={`relative px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
								isHome
									? "text-sf-accent"
									: "text-[#4A4A4A]fg-muted hover:text-sf-accent"
							}`}
						>
							Trang Chủ
							{isHome && (
								<motion.span
									layoutId="navUnderline"
									className="absolute bottom-0 left-3 right-3 h-0.5 bg-sf-accent"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</Link>

						{/* Botanical Shop with Dropdown Hover container */}
						<div
							className="relative"
							onMouseEnter={() => setIsDropdownOpen(true)}
							onMouseLeave={() => setIsDropdownOpen(false)}
							role="menu"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setIsDropdownOpen(!isDropdownOpen);
								}
							}}
						>
							<Link
								id="nav-link-catalog"
								href={soulFlowRoutes.catalog}
								onFocus={() => setIsDropdownOpen(true)}
								onClick={() => setSelectedCategory(null)}
								className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
									isCatalog
										? "text-sf-accent"
										: "text-[#4A4A4A]fg-muted hover:text-sf-accent"
								}`}
							>
								Sản Phẩm
								<ChevronDown className="h-3 w-3 text-[#4A4A4A]fg-muted hover:text-sf-accent" />
								{isCatalog && (
									<motion.span
										layoutId="navUnderline"
										className="absolute bottom-0 left-3 right-3 h-0.5 bg-sf-accent"
										transition={{ type: "spring", stiffness: 380, damping: 30 }}
									/>
								)}
							</Link>

							{/* Elegant Dropdown Menu */}
							<AnimatePresence>
								{isDropdownOpen && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										transition={{ duration: 0.15 }}
										className="absolute left-0 mt-0 w-56 rounded-xl border border-sf-border bg-sf-bg-elevated p-2 shadow-xl ring-1 ring-black/5 z-50 overflow-hidden"
									>
										<div className="px-3 py-2 border-b border-sf-border mb-1">
											<p className="text-xs uppercase tracking-widest font-bold text-sf-accent">
												Bộ Sưu Tập Hoa
											</p>
										</div>
										{categories.map((cat) => (
											<button
												type="button"
												key={cat.id} // Dùng id làm key (pk trong DB)
												id={`header-dropdown-cat-${cat.code.toLowerCase()}`}
												onClick={() => handleCategorySelect(cat.id)} // Truyền id (number) vào store
												className={`flex w-full items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium cursor-pointer transition-colors ${
													selectedCategory === cat.id && isCatalog
														? "bg-sf-accent/10 text-sf-accent font-bold"
														: "text-sf-fg-muted hover:bg-sf-surface hover:text-sf-accent"
												}`}
											>
												{/* CHỈ LẤY nameVn SHOW RA Ở ĐÂY */}
												<span>{cat.nameVn}</span>

												{selectedCategory === cat.id && isCatalog && (
													<span className="h-1.5 w-1.5 rounded-full bg-sf-accent" />
												)}
											</button>
										))}
									</motion.div>
								)}
							</AnimatePresence>
						</div>
						{/* Contact link */}
						<Link
							id="nav-link-contact"
							href={soulFlowRoutes.contact}
							className={`relative px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
								isContact
									? "text-sf-accent"
									: "text-[#4A4A4A]fg-muted hover:text-sf-accent"
							}`}
						>
							Liên Hệ
							{isContact && (
								<motion.span
									layoutId="navUnderline"
									className="absolute bottom-0 left-3 right-3 h-0.5 bg-sf-accent"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</Link>

						<Link
							id="nav-link-about"
							href={soulFlowRoutes.about}
							className={`relative px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
								isAbout
									? "text-sf-accent"
									: "text-[#4A4A4A]fg-muted hover:text-sf-accent"
							}`}
						>
							Về Chúng Tôi
							{isAbout && (
								<motion.span
									layoutId="navUnderline"
									className="absolute bottom-0 left-3 right-3 h-0.5 bg-sf-accent"
									transition={{ type: "spring", stiffness: 380, damping: 30 }}
								/>
							)}
						</Link>
					</nav>

					{/* Luxury Integrated Search Bar */}
					<div className="relative grow w-min md:max-w-md hidden sm:block">
						<Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-sf-accent" />
						<input
							id="header-search-input"
							type="text"
							placeholder="Tìm hoa, loại hoa..."
							value={searchQuery}
							onChange={(e) => goToCatalogWithSearch(e.target.value)}
							className="w-full rounded-full border border-sf-border bg-sf-bg-elevated/70 pl-9 pr-8 py-2 text-[15px] text-sf-fg focus:border-sf-accent focus:bg-sf-bg-elevated focus:ring-1 focus:ring-sf-accent outline-none transition-all placeholder:text-sf-fg-muted shadow-inner"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1.5 h-4.5 w-4.5 flex items-center justify-center text-sf-fg-muted hover:text-sf-fg text-xs font-bold"
								title="Clear Search"
							>
								×
							</button>
						)}
					</div>

					{/* User Controls */}

					<div className="flex items-center space-x-1 md:space-x-2 shrink-0">
						<ThemeToggle />

						{/* Account Profile Link */}

						<div className="hidden md:flex items-center gap-3">
							{!user ? (
								<div className="flex items-center bg-sf-surface border border-sf-border rounded-full p-1">
									<button
										type="button"
										onClick={() => {
											showToast("Chuyển đến trang đăng nhập", "success");
											router.push(soulFlowRoutes.login);
										}}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
											pathname === soulFlowRoutes.login
												? "bg-sf-accent text-white shadow-sm"
												: "text-sf-fg-muted hover:text-sf-accent"
										}`}
									>
										<LogIn
											className={`h-3.5 w-3.5 ${
												pathname === soulFlowRoutes.login
													? "text-white"
													: "text-sf-accent"
											}`}
										/>
										<span className="hidden lg:inline">Đăng Nhập</span>
									</button>

									<button
										type="button"
										onClick={() => {
											showToast("Chuyển đến trang đăng ký", "success");
											router.push(soulFlowRoutes.register);
										}}
										className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all cursor-pointer ${
											pathname === soulFlowRoutes.register
												? "bg-sf-accent text-white shadow-sm"
												: "text-sf-fg-muted hover:text-sf-accent"
										}`}
									>
										<SquarePen
											className={`h-3.5 w-3.5 ${
												pathname === soulFlowRoutes.register
													? "text-white"
													: "text-sf-accent"
											}`}
										/>
										<span className="hidden lg:inline">Đăng Ký</span>
									</button>
								</div>
							) : (
								<>
									<Link
										id="account-nav-btn"
										href={soulFlowRoutes.account}
										className={`flex items-center gap-2 p-1.5 rounded-full hover:bg-sf-surface transition-colors ${
											isAccount ? "ring-2 ring-sf-accent" : ""
										}`}
									>
										<Image
											src={user.avatar}
											alt={user.fullName}
											className="h-7 w-7 rounded-full object-cover grayscale brightness-105 border border-sf-border"
											referrerPolicy="no-referrer"
											width={25}
											height={25}
											priority
										/>

										<span className="hidden lg:inline text-sm font-bold tracking-widest text-sf-fg uppercase">
											{user.fullName
												? user.fullName.trim().split(" ").at(-1)
												: "User"}
										</span>
									</Link>

									<LogOut
										className="h-4 w-4 text-sf-fg-muted hover:text-red-400 cursor-pointer transition-colors"
										onClick={() => {
											authService.logout(); // Xoá token trong localStorage
											setUser(null); // Xoá data user trong Global Store -> Navbar sẽ tự đổi thành UI Đăng Nhập
											showToast("Đăng xuất thành công", "success");
											router.push(soulFlowRoutes.home); // Đá về trang chủ
										}}
									/>
								</>
							)}
						</div>
					</div>

					{/* Shopping Bag Button */}
					<button
						type="button"
						id="cart-nav-btn"
						onClick={onOpenCart}
						className="hidden md:flex relative p-2 rounded-lg text-sf-fg hover:bg-sf-surface transition-colors duration-200 cursor-pointer"
						aria-label="Open shopping bag"
					>
						<ShoppingBag className="h-4.5 w-4.5" />
						<AnimatePresence>
							{cartItemsCount > 0 && (
								<motion.span
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-sf-accent text-xs font-bold text-white shadow-sm"
								>
									{cartItemsCount}
								</motion.span>
							)}
						</AnimatePresence>
					</button>

					{/* Mobile Hamburger Menu Toggle */}
					<button
						type="button"
						id="mobile-menu-toggle-btn"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="p-2 rounded-lg text-sf-fg-muted md:hidden hover:bg-sf-surface transition-colors cursor-pointer"
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>
			{/* Mobile Drawer Navigation with Search support included */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden border-t border-sf-border bg-sf-bg overflow-hidden"
					>
						<div className="space-y-2 px-4 py-3 pb-6">
							{/* Mobile User Profile */}
							<div className="border-b border-sf-border pb-3 mb-2 space-y-1">
								{user ? (
									// Trạng thái đã đăng nhập
									<>
										<Link
											id="mobile-nav-link-account"
											href={soulFlowRoutes.account}
											onClick={() => setMobileMenuOpen(false)}
											className={`flex w-full items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${
												isAccount
													? "bg-sf-accent/10 text-sf-accent"
													: "text-sf-fg hover:bg-sf-surface"
											}`}
										>
											<Image
												src={user.avatar || "/images/avatar-placeholder.png"}
												alt={user.fullName || "User"}
												className="h-8 w-8 rounded-full object-cover grayscale brightness-105 border border-sf-border"
												referrerPolicy="no-referrer"
												width={32}
												height={32}
												priority
												blurDataURL="/images/avatar-placeholder.png"
												loading="eager"
											/>
											<span>
												{user.fullName ? user.fullName.split(" ")[0] : "User"}
											</span>
										</Link>

										{/* Thêm luôn nút Đăng xuất cho Mobile cho tiện */}
										<button
											type="button"
											onClick={() => {
												// handleLogout();
												showToast("Đăng xuất thành công", "success");
												setMobileMenuOpen(false);
											}}
											className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-sf-fg-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
										>
											<LogOut className="h-4 w-4" />
											Đăng xuất
										</button>
									</>
								) : (
									// Trạng thái chưa đăng nhập
									<div className="flex flex-col gap-1 px-2">
										<Link
											href={soulFlowRoutes.login}
											onClick={() => setMobileMenuOpen(false)}
											className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-sf-accent hover:bg-sf-surface"
										>
											<LogIn className="h-4 w-4" />
											Đăng nhập
										</Link>
										<Link
											href={soulFlowRoutes.register}
											onClick={() => setMobileMenuOpen(false)}
											className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-sf-fg-muted hover:bg-sf-surface"
										>
											<SquarePen className="h-4 w-4" />
											Đăng ký tài khoản
										</Link>
									</div>
								)}
							</div>
							<div className="border-b border-sf-border pb-2">
								<button
									type="button"
									id="mobile-cart-nav-btn"
									onClick={onOpenCart}
									aria-label="Open shopping bag"
									className="flex w-full items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-sf-fg hover:bg-sf-surface transition-colors"
								>
									<p className="flex w-full items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-sf-fg hover:bg-sf-surface">
										<ShoppingBag className="h-4.5 w-4.5" />
										Giỏ Hàng
									</p>
								</button>
							</div>
							{/* Mobile Search input */}
							<div className="relative py-1">
								<Search className="absolute left-3 top-3 h-3.5 w-3.5 text-sf-accent" />
								<input
									type="text"
									placeholder="Tìm hoa, ý nghĩa..."
									value={searchQuery}
									onChange={(e) => goToCatalogWithSearch(e.target.value)}
									className="w-full rounded-lg border border-sf-border bg-sf-bg-elevated pl-9 pr-4 py-2 text-xs text-sf-fg focus:border-sf-accent outline-none"
								/>
							</div>

							{/* Home */}
							<Link
								id="mobile-nav-link-home"
								href={soulFlowRoutes.home}
								onClick={() => setMobileMenuOpen(false)}
								className={`flex w-full items-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
									isHome
										? "bg-sf-accent/10 text-sf-accent"
										: "text-sf-fg-muted hover:bg-sf-surface"
								}`}
							>
								Trang Chủ
							</Link>

							{/* Catalog Categories Trigger */}
							<div className="border-t border-sf-border pt-2 mt-2">
								<p className="px-4 text-xs uppercase tracking-widest text-sf-accent font-bold mb-1">
									Cửa hàng danh mục
								</p>
								{categories.map((cat) => (
									<button
										type="button"
										key={cat.id}
										id={`mobile-dropdown-cat-${cat.code.toLowerCase()}`}
										onClick={() => {
											handleCategorySelect(cat.id);
											setMobileMenuOpen(false);
										}}
										className={`flex w-full items-center pl-8 pr-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
											selectedCategory === cat.id && isCatalog
												? "bg-sf-accent/10 text-sf-accent font-bold"
												: "text-sf-fg-muted hover:bg-sf-surface"
										}`}
									>
										{/* CHỈ LẤY nameVn SHOW RA Ở ĐÂY */}
										{cat.nameVn}

										{selectedCategory === cat.id && isCatalog && (
											<span className=" h-1.5 w-1.5 rounded-full bg-sf-accent" />
										)}
									</button>
								))}
							</div>
							{/* Contact us */}
							<Link
								id="mobile-nav-link-contact"
								href={soulFlowRoutes.contact}
								onClick={() => setMobileMenuOpen(false)}
								className={`flex w-full items-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
									isContact
										? "bg-sf-accent/10 text-sf-accent"
										: "text-sf-fg-muted"
								}`}
							>
								Liên Hệ
							</Link>
							<Link
								id="mobile-nav-link-about"
								href={soulFlowRoutes.about}
								onClick={() => setMobileMenuOpen(false)}
								className={`flex w-full items-center px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest ${
									isAbout
										? "bg-sf-accent/10 text-sf-accent"
										: "text-sf-fg-muted"
								}`}
							>
								Về Chúng Tôi
							</Link>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
