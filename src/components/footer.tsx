"use client";

import { ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { soulFlowRoutes } from "@/lib/soulflow/routes";

export function Footer() {
	return (
		<footer className="bg-sf-bg border-t-4 border-sf-border transition-colors duration-300">
			<div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-12">
					<div className="space-y-3 md:col-span-3">
						<span className="font-sans font-bold text-2xl tracking-[0.25em] text-sf-fg">
							SOULFLOW
						</span>
						<p className="text-sm text-sf-fg-muted font-light leading-relaxed">
							Một không gian hoa tinh tế và nghệ thuật lưu giữ vẻ đẹp thiên
							nhiên. Chúng tôi tạo nên những thiết kế mang cảm hứng cảm xúc, sự
							thanh lịch và nét đẹp riêng trong từng loài hoa.
						</p>
					</div>

					<div className="space-y-3 md:col-span-2">
						<h4 className="text-sm font-bold tracking-widest uppercase text-sf-accent">
							Đường Dẫn Nhanh
						</h4>
						<ul className="space-y-1 text-xs font-light text-sf-fg-muted">
							<li>
								<Link
									id="footer-btn-home"
									href={soulFlowRoutes.home}
									className="hover:text-sf-accent text-sm transition-colors"
								>
									Trang Chủ
								</Link>
							</li>
							<li>
								<Link
									id="footer-btn-catalog"
									href={soulFlowRoutes.catalog}
									className="hover:text-sf-accent text-sm transition-colors"
								>
									Danh Mục Sản Phẩm
								</Link>
							</li>
							{/* <li>
								<Link
									id="footer-btn-bespoke"
									href={soulFlowRoutes.bespoke}
									className="hover:text-sf-accent text-sm transition-colors"
								>
									Dịch Vụ Đặt Hoa Theo Yêu Cầu
								</Link>
							</li> */}
							<li>
								<Link
									id="footer-btn-contact"
									href={soulFlowRoutes.contact}
									className="hover:text-sf-accent text-sm transition-colors font-medium"
								>
									Liên Hệ Chúng Tôi
								</Link>
							</li>
						</ul>
					</div>

					<div className="space-y-3 md:col-span-4">
						<h4 className="text-sm font-bold tracking-widest uppercase text-sf-accent">
							Cam Kết Bền Vững
						</h4>
						<div className="space-y-2 text-sm font-light text-sf-fg-muted leading-relaxed">
							<div className="flex items-center gap-1.5 text-sm uppercase font-bold text-sf-fg">
								<Sparkles className="h-6.5 w-6.5 text-sf-accent" />
								Người trồng hoa địa phương được tuyển chọn kỹ lưỡng
							</div>
							<p className="text-[17px] leading-relaxed">
								Chúng tôi hợp tác với những người trồng hoa địa phương cam kết
								thực hành bền vững, đảm bảo rằng mỗi bó hoa không chỉ đẹp mà còn
								có nguồn gốc đạo đức và thân thiện với môi trường.
							</p>
						</div>
					</div>

					<div className="space-y-3 md:col-span-3">
						<h4 className="text-sm font-bold tracking-widest uppercase text-sf-accent">
							Địa Chỉ Cửa Hàng
						</h4>
						<p className="text-sm text-sf-fg-muted leading-relaxed">
							88 Đồng Khởi, Phường Bến Nghé, Quận 1, Hồ Chí Minh, Việt Nam
						</p>
						<div className="flex items-center gap-1 text-xl pt-4.5 text-sf-fg-muted font-semibold uppercase">
							<ShieldCheck className="h-8 w-8 text-green-500" />
							An Toàn &amp; Bảo Mật
						</div>
					</div>
				</div>

				<div className="mt-2 border-t-2 border-sf-border pt-3 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-sf-fg-muted">
					<p>© 2026 SoulFlow Flower Vietnam. All rights reserved.</p>
					<div className="flex gap-4">
						<Link
							href={soulFlowRoutes.privacy}
							className="hover:underline cursor-pointer"
						>
							Chính Sách Bảo Mật
						</Link>
						<Link
							href={soulFlowRoutes.terms}
							className="hover:underline cursor-pointer"
						>
							Điều Khoản Dịch Vụ
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
