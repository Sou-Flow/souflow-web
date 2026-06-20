"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	CornerDownRight,
	Heart,
	MessageSquare,
	Send,
	ShoppingBag,
	UserCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { soulFlowRoutes } from "@/lib/soulflow/routes";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { mapCategoryResponseToFE } from "@/types/category.type";

type FlowerDetailsProps = {
	productId: string;
};

// --- Định nghĩa Types cho hệ thống Comment (Giữ nguyên UI chờ mốt nối API bảng comments) ---
type ReplyType = {
	id: string;
	author: string;
	content: string;
	timestamp: string;
};

type CommentType = {
	id: string;
	author: string;
	content: string;
	timestamp: string;
	replies: ReplyType[];
};

const MOCK_COMMENTS: CommentType[] = [
	{
		id: "c1",
		author: "Eleanor Vance",
		content: "Hoa rất đẹp và tươi lâu! Sẽ ủng hộ shop dài dài.",
		timestamp: "2 ngày trước",
		replies: [
			{
				id: "r1",
				author: "Admin SoulFlow",
				content: "Cảm ơn bạn đã tin tưởng ủng hộ shop ạ!",
				timestamp: "1 ngày trước",
			},
		],
	},
];

export function FlowerDetails({ productId }: FlowerDetailsProps) {
	const router = useRouter();
	//const { addToCart } = CartFE();

	// 1. Gọi API lấy chi tiết 1 sản phẩm
	const { data: fetchedFlower, isLoading } = useQuery({
		queryKey: ["flower", productId],
		queryFn: async () => {
			const id = Number(productId);
			if (Number.isNaN(id)) return null;
			return await productService.getFlowerById(id);
		},
	});

	// 2. Gọi API lấy danh mục để map tên
	const { data: categories = [] } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const rawData = await categoryService.getAllCategory();
			return rawData.map(mapCategoryResponseToFE);
		},
	});

	// 3. Gọi API lấy danh sách hoa (để làm phần Có thể bạn thích)
	const { data: apiFlowers = [] } = useQuery({
		queryKey: ["flowers"],
		queryFn: async () => {
			return await productService.getAllFlower();
		},
	});

	// --- Xử lý Gallery Ảnh (Mock tạm 1 ảnh chờ bảng product_images) ---
	// Mốt ông có api trả list hình thì gán vào đây: fetchedFlower.images || [...]
	const galleryImages = [
		{
			id: 1,
			image:
				"https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=500&auto=format&fit=crop",
		},
		{
			id: 2,
			image:
				"https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=500&auto=format&fit=crop",
		},
	];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isHoveringImage, setIsHoveringImage] = useState(false);
	const [prevProductId, setPrevProductId] = useState(productId);

	if (productId !== prevProductId) {
		setPrevProductId(productId);
		setCurrentIndex(0);
	}

	const handleNextImage = () =>
		setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
	const handlePrevImage = () =>
		setCurrentIndex((prev) =>
			prev === 0 ? galleryImages.length - 1 : prev - 1,
		);

	useEffect(() => {
		if (isHoveringImage) return;
		const timer = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
		}, 4000);
		return () => clearInterval(timer);
	}, [isHoveringImage, galleryImages.length]);

	// --- State Comment ---
	const [comments, setComments] = useState<CommentType[]>(MOCK_COMMENTS);
	const [newComment, setNewComment] = useState("");
	const [replyingTo, setReplyingTo] = useState<string | null>(null);
	const [replyContent, setReplyContent] = useState("");

	// --- Derived Data ---
	const categoryName =
		categories.find((c) => c.id === fetchedFlower?.categoryId)?.nameVn ||
		"Danh mục hoa";

	// Lấy 3 sản phẩm liên quan (khác id hiện tại)
	const relatedFlowers = apiFlowers
		.filter((f) => String(f.id) !== productId)
		.slice(0, 3)
		.map((f) => {
			const catName =
				categories.find((c) => c.id === f.categoryId)?.nameVn || "Danh mục";
			return {
				id: String(f.id),
				code: f.code,
				name: f.nameVn,
				category: catName,
				formattedPrice: f.formattedPrice, // Xài luôn giá đã format từ Mapper
				image:
					"https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?q=80&w=500&auto=format&fit=crop",
			};
		});

	const handleAddComment = () => {
		/* Giữ nguyên logic cũ */
		if (!newComment.trim()) return;
		setComments([
			{
				id: crypto.randomUUID(),
				author: "Guest User",
				content: newComment,
				timestamp: "Vừa xong",
				replies: [],
			},
			...comments,
		]);
		setNewComment("");
	};

	const handleAddReply = (commentId: string) => {
		/* Giữ nguyên logic cũ */
		if (!replyContent.trim()) return;
		const newReply = {
			id: crypto.randomUUID(),
			author: "Guest User",
			content: replyContent,
			timestamp: "Vừa xong",
		};
		setComments(
			comments.map((cmt) =>
				cmt.id === commentId
					? { ...cmt, replies: [...cmt.replies, newReply] }
					: cmt,
			),
		);
		setReplyContent("");
		setReplyingTo(null);
	};

	if (isLoading) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-32 flex justify-center bg-sf-bg-elevated min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sf-accent"></div>
			</div>
		);
	}

	if (!fetchedFlower) {
		return (
			<div className="mx-auto max-w-7xl px-4 py-32 text-center bg-sf-bg-elevated min-h-screen">
				<h2 className="font-serif text-2xl text-sf-fg">
					Không tìm thấy sản phẩm
				</h2>
				<Link
					href={soulFlowRoutes.catalog}
					className="text-sf-accent mt-4 inline-block hover:underline"
				>
					Quay lại cửa hàng
				</Link>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			<Link
				href={soulFlowRoutes.catalog}
				className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#666666] dark:text-[#A0A0A0] hover:text-[#C49B83] transition-colors duration-200 mb-8"
			>
				<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
				Quay lại sản phẩm
			</Link>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 mb-20">
				{/* Cột Trái: Ảnh sản phẩm */}
				<div className="lg:col-span-6 flex flex-col gap-5">
					<section
						className="relative overflow-hidden rounded-2xl border border-[#EBE5DA] dark:border-[#C49B83]/30 bg-sf-bg-elevated p-3 shadow-lg max-w-md mx-auto w-full group"
						onMouseEnter={() => setIsHoveringImage(true)}
						onMouseLeave={() => setIsHoveringImage(false)}
						onFocus={() => setIsHoveringImage(true)}
						onBlur={() => setIsHoveringImage(false)}
						aria-label="Product image gallery"
					>
						<div className="relative w-full aspect-4/5 sm:aspect-square overflow-hidden rounded-xl bg-[#EBE5DA]/50 dark:bg-[#2C2C2C]/50">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentIndex}
									initial={{ opacity: 0, scale: 0.96, x: 20 }}
									animate={{ opacity: 1, scale: 1, x: 0 }}
									exit={{ opacity: 0, scale: 1.02, x: -20 }}
									transition={{ duration: 0.45, ease: "easeOut" }}
									className="absolute inset-0 w-full h-full"
								>
									<Image
										src={galleryImages[currentIndex].image}
										alt={fetchedFlower.nameVn}
										fill
										sizes="(max-width: 768px) 100vw, 400px"
										className="object-cover"
									/>
								</motion.div>
							</AnimatePresence>
						</div>
						<div className="absolute top-6 right-6 p-2 rounded-full bg-white/80 dark:bg-black/60 shadow-md backdrop-blur-xs text-[#C49B83] cursor-pointer z-10">
							<Heart className="h-4 w-4 hover:fill-current transition-colors" />
						</div>
						<button
							type="button"
							onClick={handlePrevImage}
							className="absolute left-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 dark:bg-black/60 shadow-md text-[#C49B83] opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							onClick={handleNextImage}
							className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 dark:bg-black/60 shadow-md text-[#C49B83] opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-10"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
					</section>
				</div>

				{/* Cột Phải: Thông tin sản phẩm */}
				<div className="lg:col-span-6 flex flex-col justify-start gap-6 pt-4">
					<div>
						<span className="text-sm uppercase tracking-widest text-[#C49B83] font-bold block mb-1">
							{categoryName}
						</span>
						<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
							{fetchedFlower.nameVn}
						</h1>
						<p className="font-mono text-xs text-[#A0A0A0] mt-1">
							Mã SP: {fetchedFlower.code}
						</p>
					</div>

					<div className="flex items-center gap-4">
						<span className="font-sans text-3xl font-bold text-sf-fg">
							{fetchedFlower.formattedPrice}
						</span>
						{fetchedFlower.isAvailable ? (
							<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-widest border border-green-200">
								Còn hàng
							</span>
						) : (
							<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 uppercase tracking-widest border border-red-200">
								Hết hàng
							</span>
						)}
					</div>

					<p className="text-sm text-[#666666] dark:text-[#A0A0A0] leading-relaxed font-light mt-4">
						{fetchedFlower.descriptionVn}
					</p>

					<div className="border-t border-[#EBE5DA] dark:border-[#C49B83]/30 mt-8 pt-6">
						<button
							type="button"
							disabled={!fetchedFlower.isAvailable}
							//onClick={() => addToCart(fetchedFlower)} // Xóa selectedSize khỏi giỏ hàng
							className="w-full sm:w-2/3 group flex items-center justify-center gap-2.5 rounded-xl bg-[#1A1A1A] dark:bg-[#FCFAF7] py-4 text-xs font-bold uppercase tracking-widest text-white dark:text-[#1F1A16] hover:bg-[#C49B83] transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ShoppingBag className="h-4 w-4" />
							{fetchedFlower.isAvailable ? "Thêm vào giỏ hàng" : "Tạm hết hàng"}
						</button>
					</div>
				</div>
			</div>

			{/* Đã xóa Hướng dẫn bảo quản, giữ lại Hệ thống Comment */}
			<section className="mb-20">
				<div className="flex items-center gap-2 mb-8 pb-4 border-b border-[#C49B83]/30">
					<MessageSquare className="h-5 w-5 text-[#C49B83]" />
					<h2 className="font-serif text-2xl font-light text-sf-fg">
						Trải nghiệm & Thắc mắc về hoa
					</h2>
				</div>

				<div className="max-w-4xl space-y-8">
					{/* ... (Phần UI render input thêm comment và list comments tui giữ y xì của ông) ... */}
					<div className="flex gap-4 items-start">
						<div className="p-2 rounded-full bg-[#C49B83]/10 text-[#C49B83]">
							<UserCircle2 className="h-6 w-6" />
						</div>
						<div className="flex-1 space-y-3">
							<textarea
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								placeholder="Chia sẻ trải nghiệm của bạn..."
								className="w-full min-h-25 p-4 rounded-xl border border-[#C49B83]/30 bg-transparent text-sm text-sf-fg focus:outline-none focus:border-[#C49B83] focus:ring-1 focus:ring-[#C49B83] transition-all resize-y"
							/>
							<div className="flex justify-end">
								<button
									type="button"
									onClick={handleAddComment}
									disabled={!newComment.trim()}
									className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C49B83] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A37B65] transition-colors disabled:opacity-50"
								>
									<Send className="h-3 w-3" /> Đăng bình luận
								</button>
							</div>
						</div>
					</div>

					<div className="space-y-6 pt-4">
						{comments.map((comment) => (
							<div key={comment.id} className="space-y-4">
								<div className="p-5 rounded-2xl border border-[#C49B83]/20 bg-[#C49B83]/5">
									<div className="flex justify-between items-start mb-2">
										<div className="flex items-center gap-2">
											<span className="font-bold text-sm text-sf-fg">
												{comment.author}
											</span>
											<span className="text-xs text-[#A0A0A0]">
												• {comment.timestamp}
											</span>
										</div>
									</div>
									<p className="text-sm text-[#666666] dark:text-[#D0D0D0] leading-relaxed">
										{comment.content}
									</p>
									<div className="mt-3">
										<button
											type="button"
											onClick={() =>
												setReplyingTo(
													replyingTo === comment.id ? null : comment.id,
												)
											}
											className="text-xs font-bold text-[#C49B83] hover:underline flex items-center gap-1.5"
										>
											<CornerDownRight className="h-3 w-3" /> Trả lời
										</button>
									</div>
								</div>
								{replyingTo === comment.id && (
									<div className="pl-10 flex gap-3 items-start">
										<div className="flex-1 flex gap-2">
											<input
												type="text"
												value={replyContent}
												onChange={(e) => setReplyContent(e.target.value)}
												placeholder="Nhập câu trả lời..."
												className="w-full px-4 py-2.5 rounded-lg border border-[#C49B83]/30 bg-transparent text-sm text-sf-fg focus:outline-none focus:border-[#C49B83] transition-all"
											/>
											<button
												type="button"
												onClick={() => handleAddReply(comment.id)}
												disabled={!replyContent.trim()}
												className="px-4 py-2.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C49B83] transition-colors disabled:opacity-50"
											>
												Gửi
											</button>
										</div>
									</div>
								)}
								{comment.replies.length > 0 && (
									<div className="pl-10 space-y-4 border-l-2 border-[#C49B83]/10 ml-5">
										{comment.replies.map((reply) => (
											<div
												key={reply.id}
												className="p-4 rounded-xl border border-[#C49B83]/10 bg-transparent"
											>
												<div className="flex justify-between items-start mb-1.5">
													<div className="flex items-center gap-2">
														<span className="font-bold text-sm text-sf-fg">
															{reply.author}
														</span>
														<span className="text-xs text-[#A0A0A0]">
															• {reply.timestamp}
														</span>
													</div>
												</div>
												<p className="text-sm text-[#666666] dark:text-[#D0D0D0] leading-relaxed">
													{reply.content}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Sản phẩm liên quan */}
			<section>
				<div className="flex items-center justify-between mb-8 pb-4 border-b border-[#C49B83]/30">
					<h2 className="font-serif text-2xl font-light text-sf-fg">
						Có thể bạn cũng thích
					</h2>
					<Link
						href={soulFlowRoutes.catalog}
						className="text-xs font-bold text-[#C49B83] uppercase tracking-wider hover:underline"
					>
						Khám phá thêm
					</Link>
				</div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
					{relatedFlowers.map((item) => (
						<button
							type="button"
							key={item.id}
							onClick={() => router.push(soulFlowRoutes.product(item.id))}
							className="group cursor-pointer overflow-hidden rounded-xl border border-[#C49B83]/30 bg-sf-bg-elevated p-3 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all"
						>
							<div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#EBE5DA] dark:bg-[#2C2C2C] grayscale-1/10 group-hover:grayscale-0">
								<Image
									src={item.image}
									alt={item.name}
									fill
									sizes="(max-width: 640px) 100vw, 33vw"
									className="object-cover group-hover:scale-103 transition-transform"
								/>
							</div>
							<div className="mt-3 text-left">
								<span className="text-[8px] tracking-widest uppercase font-bold text-[#C49B83] block">
									{item.category}
								</span>
								<h4 className="font-serif text-sm font-semibold text-sf-fg mt-0.5 group-hover:text-[#C49B83] line-clamp-1">
									{item.name}
								</h4>
								<p className="font-sans text-xs font-bold text-sf-fg mt-1">
									{item.formattedPrice}
								</p>
							</div>
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
