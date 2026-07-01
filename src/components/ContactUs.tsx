"use client";

import {
	CheckCircle2,
	//ChevronLeft,
	//ChevronRight,
	Clock,
	Mail,
	MapPin,
	//MessageSquare,
	Phone,
	Send,
	//Star,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

// // Dữ liệu mẫu (Gộp dữ liệu cũ của bạn và thêm vài đánh giá có nửa sao)
// const MOCK_FEEDBACKS = [
// 	{
// 		id: 1,
// 		name: "Isabelle Laurent",
// 		date: "May 14, 2026",
// 		comment:
// 			"The Sarah Bernhardt blush peonies survived beautifully for 8 days! Incredible grade.",
// 		rating: 5,
// 	},
// 	{
// 		id: 2,
// 		name: "Viet Nguyen",
// 		date: "Apr 28, 2026",
// 		comment:
// 			"Phục vụ tận tâm, thiết kế bó hoa bespoke màu Pastel rực rỡ và có chiều sâu.",
// 		rating: 4.5,
// 	},
// 	{
// 		id: 3,
// 		name: "Sarah Connor",
// 		date: "Apr 15, 2026",
// 		rating: 5,
// 		comment: "Mùi hương rất sang trọng, đúng phong cách Boutique.",
// 	},
// 	{
// 		id: 4,
// 		name: "Hải Đăng",
// 		date: "Apr 10, 2026",
// 		rating: 3.5,
// 		comment:
// 			"Hoa đẹp, tuy nhiên size Petite hơi nhỏ hơn một chút so với mình tưởng tượng.",
// 	},
// 	{
// 		id: 5,
// 		name: "Linda",
// 		date: "Mar 22, 2026",
// 		rating: 5,
// 		comment:
// 			"Sẽ ủng hộ shop dài dài. Dịch vụ gói quà và viết thiệp tay quá xuất sắc.",
// 	},
// ];

export function ContactUs() {
	// --- States Form Liên hệ ---
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [tel, setTel] = useState("");
	const [msg, setMsg] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);

	// --- States Form Đánh giá ---
	// const [feedbacks, setFeedbacks] = useState(MOCK_FEEDBACKS);
	// const [fbName, setFbName] = useState("");
	// const [fbComment, setFbComment] = useState("");
	// const [rating, setRating] = useState(5); // Điểm chọn (Hỗ trợ số thập phân)
	// const [hoverRating, setHoverRating] = useState(0); // Hiệu ứng hover
	// const [fbSuccess, setFbSuccess] = useState(false);

	// // --- States Quản lý List Đánh giá ---
	// const [sortBy, setSortBy] = useState("newest");
	// const [currentPage, setCurrentPage] = useState(1);
	// const itemsPerPage = 3;

	// Xử lý gửi Form Liên hệ
	const handleSubmitInquiry = (e: React.FormEvent) => {
		e.preventDefault();
		setSending(true);
		setTimeout(() => {
			setSending(false);
			setSent(true);
			setName("");
			setEmail("");
			setTel("");
			setMsg("");
			setTimeout(() => setSent(false), 4000);
		}, 1500);
	};

	// Xử lý gửi Đánh giá mới
	// const handlePostFeedback = (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	if (!fbName || !fbComment) return;

	// 	const newFeedback = {
	// 		id: Date.now(),
	// 		name: fbName,
	// 		date: new Date().toLocaleDateString("en-US", {
	// 			month: "short",
	// 			day: "numeric",
	// 			year: "numeric",
	// 		}),
	// 		comment: fbComment,
	// 		rating: rating,
	// 	};

	// 	setFeedbacks([newFeedback, ...feedbacks]);
	// 	setFbName("");
	// 	setFbComment("");
	// 	setRating(5);
	// 	setFbSuccess(true);
	// 	setTimeout(() => setFbSuccess(false), 3000);
	// };

	// --- Logic tính toán, phân trang, sắp xếp ---
	// const totalReviews = feedbacks.length;
	// const averageRating =
	// 	totalReviews === 0
	// 		? 0
	// 		: (
	// 				feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
	// 			).toFixed(1);

	// const sortedFeedbacks = useMemo(() => {
	// 	return [...feedbacks].sort((a, b) => {
	// 		if (sortBy === "newest")
	// 			return new Date(b.date).getTime() - new Date(a.date).getTime();
	// 		if (sortBy === "oldest")
	// 			return new Date(a.date).getTime() - new Date(b.date).getTime();
	// 		if (sortBy === "highest") return b.rating - a.rating;
	// 		if (sortBy === "lowest") return a.rating - b.rating;
	// 		return 0;
	// 	});
	// }, [feedbacks, sortBy]);

	// const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
	// const currentFeedbacks = sortedFeedbacks.slice(
	// 	(currentPage - 1) * itemsPerPage,
	// 	currentPage * itemsPerPage,
	// );

	// const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
	// 	setSortBy(e.target.value);
	// 	setCurrentPage(1); // Trở về trang 1 khi đổi bộ lọc
	// };

	// // Hàm render hiển thị sao (hỗ trợ nửa sao)
	// const renderStars = (ratingValue: number, sizeClass = "h-3.5 w-3.5") => {
	// 	return (
	// 		<div className="flex gap-0.5 mt-1">
	// 			{[1, 2, 3, 4, 5].map((starIndex) => {
	// 				const isFull = ratingValue >= starIndex;
	// 				const isHalf =
	// 					ratingValue >= starIndex - 0.5 && ratingValue < starIndex;

	// 				return (
	// 					<div key={starIndex} className="relative inline-block">
	// 						<Star
	// 							className={`${sizeClass} text-[#EBE5DA] dark:text-gray-600`}
	// 						/>
	// 						{(isFull || isHalf) && (
	// 							<div
	// 								className={`absolute top-0 left-0 overflow-hidden ${isHalf ? "w-[50%]" : "w-full"}`}
	// 							>
	// 								<Star
	// 									className={`${sizeClass} fill-yellow-400 text-yellow-400`}
	// 								/>
	// 							</div>
	// 						)}
	// 					</div>
	// 				);
	// 			})}
	// 		</div>
	// 	);
	// };

	return (
		<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			{/* Page Title */}
			<div className="text-center space-y-2 mb-12">
				<span className="text-sm font-bold tracking-widest text-[#C49B83] uppercase block">
					Kết nối với SouFlow
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Liên hệ với chúng tôi
				</h1>
				<p className="max-w-md mx-auto text-base text-sf-fg-muted">
					Để lại yêu cầu thiết kế, đặt câu hỏi về dịch vụ, hoặc chia sẻ phản hồi
					của bạn với chúng tôi. Chúng tôi rất mong được nghe từ bạn và sẽ phản
					hồi trong thời gian sớm nhất có thể!
				</p>
			</div>

			<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start mb-20">
				{/* Left Column - Contact Form */}
				<div className="lg:col-span-7 bg-sf-bg-elevated p-6 rounded-2xl border border-[#C49B83]/30 shadow-sm space-y-6">
					<h2 className="font-serif text-lg font-semibold text-sf-fg flex items-center gap-2 border-b border-[#EBE5DA] dark:border-[#C49B83]/30 pb-3">
						<Send className="h-4.5 w-4.5 text-[#C49B83]" />
						Gửi Yêu Cầu
					</h2>

					<form onSubmit={handleSubmitInquiry} className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1">
								<label
									htmlFor="contact-name"
									className="text-sm uppercase tracking-wider font-bold text-sf-lg"
								>
									Tên của bạn
								</label>
								<input
									id="contact-name"
									type="text"
									required
									value={name}
									placeholder="VD: Nguyễn Thị Hồng"
									onChange={(e) => setName(e.target.value)}
									className="w-full text-xs rounded-lg border border-sf-border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
								/>
							</div>

							<div className="space-y-1">
								<label
									htmlFor="contact-email"
									className="text-sm uppercase tracking-wider font-bold text-sf-lg"
								>
									Địa chỉ Email
								</label>
								<input
									id="contact-email"
									type="email"
									required
									value={email}
									placeholder="your.email@example.com"
									onChange={(e) => setEmail(e.target.value)}
									className="w-full text-xs rounded-lg border border-sf-border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
								/>
							</div>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="contact-phone"
								className="text-sm uppercase tracking-wider font-bold text-sf-lg"
							>
								Số Điện Thoại
							</label>
							<input
								id="contact-phone"
								type="tel"
								value={tel}
								placeholder="+84 912 345 678"
								onChange={(e) => setTel(e.target.value)}
								className="w-full text-xs rounded-lg border border-sf-border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
							/>
						</div>

						<div className="space-y-1">
							<label
								htmlFor="contact-message"
								className="text-sm uppercase tracking-wider font-bold text-sf-lg"
							>
								Chúng tôi có thể giúp gì cho bạn?
							</label>
							<textarea
								id="contact-message"
								rows={4}
								required
								value={msg}
								onChange={(e) => setMsg(e.target.value)}
								placeholder="Mô tả không gian thiết kế, chủ đề hôn lễ, hoặc yêu cầu về bảng màu hoa..."
								className="w-full text-xs rounded-xl border border-sf-border bg-sf-bg-elevated text-sf-fg p-3 outline-none focus:border-[#C49B83]"
							/>
						</div>

						<div className="flex items-center justify-between pt-2">
							<button
								id="contact-submit-btn"
								type="submit"
								disabled={sending}
								className="rounded-lg bg-amber-500 text-sf-lg hover:bg-[#C49B83] dark:hover:bg-[#C49B83] disabled:opacity-50 text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors shadow-sm"
							>
								{sending ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu"}
							</button>

							{sent && (
								<span className="text-xs text-green-500 font-bold uppercase flex items-center gap-1">
									<CheckCircle2 className="h-4.5 w-4.5" />
									Yêu cầu đã được gửi! Chúng tôi sẽ liên hệ lại sớm.
								</span>
							)}
						</div>
					</form>
				</div>

				{/* Right Column - Studio Info coordinates */}
				<div className="lg:col-span-5 space-y-6">
					<div className="bg-sf-bg-elevated p-6 rounded-2xl border border-[#C49B83]/30 text-sf-fg space-y-6 shadow-md">
						<h3 className="font-serif text-lg font-bold text-sf-fg">
							Thông Tin Liên Hệ & Địa Chỉ
						</h3>

						<div className="space-y-4 text-xs font-light">
							<div className="flex items-start gap-3">
								<MapPin className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Cửa Hàng SouFlow
									</p>
									<p className="text-sf-fg text-[17px] leading-relaxed mt-0.5">
										Tòa nhà QTSC 9, Công viên phần mềm Quang Trung, Quận 12,
										Thành phố Hồ Chí Minh
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Phone className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Đường Dây Hỗ Trợ Khách Hàng
									</p>
									<p className="text-sf-fg text-[17px] mt-1">
										+84 28 3824 5678
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Mail className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sf-fg uppercase tracking-wider">
										Email Hỗ Trợ & Đặt Hàng
									</p>
									<p className="text-sf-fg text-[17px] mt-1">
										contact@souflow.com
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Clock className="h-4.5 w-4.5 text-[#C49B83] shrink-0 mt-0.5" />
								<div>
									<p className="font-bold text-sm text-sf-fg uppercase tracking-wider">
										Giờ Mở Cửa
									</p>
									<p className="text-sf-fg text-[16px] leading-relaxed mt-0.5">
										T2 – T7: 08:00 AM – 08:30 PM
									</p>
									<p className="text-sf-fg-muted font-bold leading-relaxed mt-0.5">
										Chủ Nhật: 10:00 AM – 06:00 PM (Đặt hẹn trước để được phục vụ
										tốt nhất)
									</p>
								</div>
							</div>
						</div>

						{/* Bản đồ nhúng Google Maps trực quan */}
						<div className="relative aspect-video w-full rounded-xl overflow-hidden border border-[#C49B83]/30 shadow-md group">
							<iframe
								src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d692.6899093231182!2d106.62639276160782!3d10.853653643009181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a20d8555e69%3A0x743b1e9558fb89e0!2sQTSC%209%20Building!5e0!3m2!1svi!2s!4v1782786735429!5m2!1svi!2s"
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen={true}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="SouFlow Atelier Map"
								className="h-full w-full object-cover transition-all duration-300 dark:invert-90 dark:hue-rotate-180"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
