"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { soulFlowRoutes } from "@/lib/souflow/routes";

export default function NotFound() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchTerm.trim()) {
			router.push(
				`${soulFlowRoutes.catalog}?search=${encodeURIComponent(searchTerm.trim())}`,
			);
		} else {
			router.push(soulFlowRoutes.catalog);
		}
	};

	return (
		<div className="grow flex flex-col items-center justify-center px-4 sm:px-6 md:px-12 py-16 md:py-24 min-h-[75vh]">
			<div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 items-center gap-10 md:gap-14">
				{/* Flower Artwork */}
				<div className="md:col-span-5 flex justify-center">
					<div className="relative w-60 h-76 sm:w-68 sm:h-88 overflow-hidden rounded-t-full rounded-b-2xl bg-sf-surface border border-sf-border shadow-sm">
						<Image
							alt="SouFlow 404"
							className="w-full h-full object-cover"
							src="/images/404-flower.avif"
							width={320}
							height={450}
							priority
						/>
					</div>
				</div>

				{/* Editorial Typography & Actions */}
				<div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
					<div className="space-y-2">
						<p className="font-serif text-sm md:text-base tracking-widest uppercase text-sf-accent font-semibold">
							404 — Trang Không Tồn Tại
						</p>
						<h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-sf-fg leading-tight">
							Bông hoa này <br className="hidden sm:block" />
							<span className="italic">chưa kịp nở rộ.</span>
						</h1>
						<p className="text-sm sm:text-base text-sf-fg-muted font-light max-w-md pt-1 leading-relaxed">
							Đường dẫn bạn vừa truy cập có thể đã đổi tên hoặc không còn tồn tại. Hãy thử tìm kiếm hoặc khám phá các bộ sưu tập hoa tươi của chúng tôi.
						</p>
					</div>

					{/* Clean Search Input */}
					<form onSubmit={handleSearch} className="w-full max-w-md">
						<div className="relative flex items-center">
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Tìm kiếm bó hoa, sự kiện..."
								className="w-full h-11 pl-10 pr-20 rounded-lg bg-sf-bg-elevated border border-sf-border text-sf-fg placeholder:text-sf-fg-muted/60 text-sm focus:outline-none focus:border-sf-accent transition-colors"
							/>
							<Search className="absolute left-3.5 h-4 w-4 text-sf-fg-muted pointer-events-none" />
							<button
								type="submit"
								className="absolute right-1.5 h-8 px-3.5 rounded-md bg-sf-accent text-white text-xs font-medium hover:bg-sf-accent/90 transition-colors cursor-pointer"
							>
								Tìm
							</button>
						</div>
					</form>

					{/* Navigation Buttons */}
					<div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
						<Link
							href="/"
							className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-sf-fg text-sf-bg text-xs font-semibold uppercase tracking-wider hover:bg-sf-accent hover:text-white transition-colors cursor-pointer"
						>
							Về Trang Chủ
						</Link>

						<Link
							href={soulFlowRoutes.catalog}
							className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg border border-sf-border bg-sf-bg-elevated text-sf-fg text-xs font-semibold uppercase tracking-wider hover:border-sf-accent hover:text-sf-accent transition-colors cursor-pointer"
						>
							Xem Bộ Sưu Tập
							<ArrowRight className="h-3.5 w-3.5" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
