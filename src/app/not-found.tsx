"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { SoulFlowShell } from "@/components/SoulFlowShell";

export default function NotFound() {
	return (
		<SoulFlowShell>
			{/* Main Wrapper: flex-grow để nó chiếm hết phần không gian trống giữa Header và Footer */}
			<div className="grow flex flex-col items-center justify-center px-4 md:px-16 py-12 relative overflow-hidden min-h-[75vh]">
				{/* Background Atmospheric Accents (Vệt sáng mờ phía sau) */}
				<div className="absolute top-10 right-[-10%] w-96 h-96 bg-sf-accent/10 rounded-full blur-3xl -z-10"></div>
				<div className="absolute bottom-10 left-[-5%] w-80 h-80 bg-sf-heading/5 rounded-full blur-3xl -z-10"></div>

				<div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-24 z-10">
					{/* Phần Hình Ảnh (Visual Side) - Hiển thị trước trên mobile */}
					<div className="relative flex justify-center order-1 md:order-1">
						{/* Dùng Framer Motion để tạo hiệu ứng bay lơ lửng (float) */}
						<motion.div
							animate={{ y: [0, -15, 0] }}
							transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
							className="relative w-64 h-80 md:w-80 md:h-112.5 bg-sf-surface rounded-t-full rounded-b-[40%] overflow-hidden shadow-2xl shadow-sf-hover-shadow"
						>
							<Image
								alt="A wilting but elegant rose"
								className="w-full h-full object-cover opacity-90 mix-blend-multiply"
								src="/images/404-flower.avif"
								width={320}
								height={450}
								priority
							/>
						</motion.div>

						{/* Decorative Petals (Mấy mảng decor nhỏ xung quanh ảnh) */}
						<div className="absolute -top-4 -left-4 w-12 h-12 bg-sf-accent/30 rounded-full blur-xl"></div>
						<div className="absolute bottom-10 -right-8 w-20 h-20 border border-sf-border rounded-full"></div>
					</div>

					{/* Phần Nội Dung (Content Side) */}
					<div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-2">
						<span className="text-sm font-bold text-sf-accent uppercase tracking-[0.2em] mb-4">
							404 Error
						</span>

						<h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-sf-heading mb-6 leading-tight">
							Ối! Bông hoa này <br className="hidden md:block" />
							<span className="italic text-sf-accent">chưa kịp nở.</span>
						</h1>

						<p className="text-lg text-sf-fg-muted mb-10 max-w-md">
							Trang bạn tìm kiếm không tồn tại hoặc hoa này đã được di chuyển
							sang một khu vườn khác.
						</p>

						{/* Nút bấm điều hướng */}
						<div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center md:justify-start">
							<Link
								href="/"
								className="bg-sf-accent text-sf-bg-elevated px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-sf-hover-shadow"
							>
								Về trang chủ
								{/* Icon mũi tên dạng SVG thay vì xài Google Font để đảm bảo lúc nào cũng load được */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Mũi tên</title>
									<path d="M5 12h14" />
									<path d="m12 5 7 7-7 7" />
								</svg>
							</Link>

							<Link
								href="/catalog"
								className="text-sf-heading font-semibold px-8 py-4 border border-sf-border rounded-full hover:bg-sf-surface transition-colors active:scale-95"
							>
								Xem bộ sưu tập hoa
							</Link>
						</div>
					</div>
				</div>
			</div>
		</SoulFlowShell>
	);
}
