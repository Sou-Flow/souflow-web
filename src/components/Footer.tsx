"use client";

import {
	Clock,
	Heart,
	Mail,
	MapPin,
	Phone,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import { soulFlowRoutes } from "@/lib/souflow/routes";

export function Footer() {
	return (
		<footer className="bg-sf-bg-elevated border-t border-sf-border text-sf-fg transition-colors duration-300">
			{/* Main Footer Content */}
			<div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
					{/* Col 1: Brand & Philosophy (Span 4) */}
					<div className="lg:col-span-4 space-y-4">
						<Link
							href={soulFlowRoutes.home}
							className="group inline-flex items-center gap-2.5"
						>
							{/* Petal Logo Icon */}
							<div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-sf-accent/30 bg-sf-surface shadow-xs transition-transform duration-500 group-hover:scale-105">
								<div className="absolute h-3.5 w-3.5 -translate-x-1 -translate-y-1 rounded-tr-full rounded-bl-full bg-sf-accent/30 transition-transform duration-500 group-hover:rotate-45" />
								<div className="absolute h-3.5 w-3.5 translate-x-1 -translate-y-1 rounded-tl-full rounded-br-full bg-sf-accent/40 transition-transform duration-500 group-hover:-rotate-45" />
								<div className="absolute h-3.5 w-3.5 -translate-x-1 translate-y-1 rounded-tl-full rounded-br-full bg-sf-accent/50 transition-transform duration-500 group-hover:-rotate-45" />
								<div className="absolute h-3.5 w-3.5 translate-x-1 translate-y-1 rounded-tr-full rounded-bl-full bg-sf-accent/60 transition-transform duration-500 group-hover:rotate-45" />
								<div className="relative z-10 h-1.5 w-1.5 rounded-full border border-sf-accent bg-sf-bg" />
							</div>

							<span className="font-serif text-lg font-bold tracking-[0.24em] text-sf-fg">
								SOUFLOW
							</span>
						</Link>

						<p className="text-xs sm:text-sm text-sf-fg-muted font-light leading-relaxed max-w-sm">
							Không gian hoa nghệ thuật cao cấp. Mỗi tác phẩm là một bản giao
							hưởng tinh tế từ những cánh hoa tươi được tuyển chọn khắt khe mỗi
							ngày.
						</p>

						<div className="flex items-center gap-2 text-xs text-sf-fg-muted pt-1">
							<Sparkles className="h-4 w-4 text-sf-accent shrink-0" />
							<span>100% Hoa tươi nhập vườn tiêu chuẩn cao</span>
						</div>
					</div>

					{/* Col 2: Khám Phá (Span 2) */}
					<div className="lg:col-span-2 space-y-3">
						<h4 className="text-xs font-bold uppercase tracking-widest text-sf-accent">
							Khám Phá
						</h4>
						<ul className="space-y-2 text-xs font-medium text-sf-fg-muted">
							<li>
								<Link
									id="footer-btn-home"
									href={soulFlowRoutes.home}
									className="hover:text-sf-accent transition-colors"
								>
									Trang Chủ
								</Link>
							</li>
							<li>
								<Link
									id="footer-btn-catalog"
									href={soulFlowRoutes.catalog}
									className="hover:text-sf-accent transition-colors"
								>
									Bộ Sưu Tập Hoa
								</Link>
							</li>
							<li>
								<Link
									id="footer-btn-about"
									href={soulFlowRoutes.about}
									className="hover:text-sf-accent transition-colors"
								>
									Về Chúng Tôi
								</Link>
							</li>
							<li>
								<Link
									id="footer-btn-contact"
									href={soulFlowRoutes.contact}
									className="hover:text-sf-accent transition-colors"
								>
									Liên Hệ Tư Vấn
								</Link>
							</li>
						</ul>
					</div>

					{/* Col 3: Chính Sách & Hỗ Trợ (Span 3) */}
					<div className="lg:col-span-3 space-y-3">
						<h4 className="text-xs font-bold uppercase tracking-widest text-sf-accent">
							Chính Sách &amp; Hỗ Trợ
						</h4>
						<ul className="space-y-2 text-xs font-medium text-sf-fg-muted">
							<li>
								<Link
									href={soulFlowRoutes.privacy}
									className="hover:text-sf-accent transition-colors"
								>
									Chính Sách Bảo Mật
								</Link>
							</li>
							<li>
								<Link
									href={soulFlowRoutes.terms}
									className="hover:text-sf-accent transition-colors"
								>
									Điều Khoản Dịch Vụ
								</Link>
							</li>
							<li>
								<span className="text-sf-fg-muted/80">
									Giao Hoa Hỏa Tốc 2 Giờ
								</span>
							</li>
							<li>
								<span className="text-sf-fg-muted/80">
									Cam Kết Hoàn Tiền Nếu Hoa Hỏng
								</span>
							</li>
						</ul>
					</div>

					{/* Col 4: Liên Hệ & Showroom (Span 3) */}
					<div className="lg:col-span-3 space-y-3">
						<h4 className="text-xs font-bold uppercase tracking-widest text-sf-accent">
							Showroom &amp; Liên Hệ
						</h4>
						<ul className="space-y-2 text-xs text-sf-fg-muted font-light">
							<li className="flex items-start gap-2">
								<MapPin className="h-4 w-4 text-sf-accent shrink-0 mt-0.5" />
								<span>
									Tòa nhà QTSC 9, Công viên phần mềm Quang Trung, Quận 12, TP.
									Hồ Chí Minh
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-sf-accent shrink-0" />
								<span className="font-semibold text-sf-fg">
									Hotline: 0901 234 567
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Mail className="h-4 w-4 text-sf-accent shrink-0" />
								<span>contact@souflow.shop</span>
							</li>
							<li className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-sf-accent shrink-0" />
								<span>Mở cửa: 08:00 - 21:00 (Hàng ngày)</span>
							</li>
						</ul>

						<div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
							<ShieldCheck className="h-4 w-4" />
							<span>Thanh toán Bảo mật 100%</span>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-10 border-t border-sf-border pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-sf-fg-muted">
					<p className="flex items-center gap-1">
						© 2026 SouFlow Botanical Vietnam. Kiến tạo với{" "}
						<Heart className="h-3 w-3 text-rose-500 fill-current inline" /> tình
						yêu hoa tươi.
					</p>

					<div className="flex items-center gap-4">
						<Link
							href={soulFlowRoutes.privacy}
							className="hover:text-sf-accent transition-colors"
						>
							Bảo Mật
						</Link>
						<span>•</span>
						<Link
							href={soulFlowRoutes.terms}
							className="hover:text-sf-accent transition-colors"
						>
							Điều Khoản
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
