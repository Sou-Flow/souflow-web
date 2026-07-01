"use client";

import { Eye, Lock, ShieldCheck } from "lucide-react";

export function PrivacyPolicy() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			<div className="text-center space-y-4 mb-16 border-b border-[#C49B83]/30 pb-10">
				<div className="flex justify-center mb-4">
					<ShieldCheck className="h-10 w-10 text-[#C49B83]" />
				</div>
				<span className="text-xs font-bold tracking-widest text-[#C49B83] uppercase block">
					SouFlow Legal
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Chính Sách Bảo Mật
				</h1>
				<p className="text-sm text-[#A0A0A0] italic">
					Cập nhật lần cuối: Tháng 5, 2026
				</p>
			</div>

			<div className="space-y-12 text-sm text-[#666666] dark:text-[#A0A0A0] font-light leading-relaxed">
				<section className="space-y-4">
					<h2 className="font-serif text-xl font-medium text-sf-fg flex items-center gap-2">
						<Eye className="h-5 w-5 text-[#C49B83]" />
						1. Thu thập thông tin
					</h2>
					<p>
						Chúng tôi tôn trọng sự riêng tư của bạn. Khi bạn trải nghiệm mua sắm
						tại Boutique, chúng tôi chỉ thu thập những thông tin cần thiết nhất
						để hoàn thiện tác phẩm và giao đến tận tay người nhận:
					</p>
					<ul className="list-disc pl-5 space-y-2 marker:text-[#C49B83]">
						<li>
							Thông tin liên hệ (Tên, Số điện thoại, Email) của người đặt và
							người nhận.
						</li>
						<li>Địa chỉ giao nhận chi tiết.</li>
						<li>Nội dung lời chúc trên thiệp đính kèm.</li>
						<li>
							Dữ liệu duyệt web cơ bản (Cookies) để tối ưu hóa gợi ý sản phẩm
							phù hợp với gu thẩm mỹ của bạn.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="font-serif text-xl font-medium text-sf-fg flex items-center gap-2">
						<Lock className="h-5 w-5 text-[#C49B83]" />
						2. Bảo vệ dữ liệu
					</h2>
					<p>
						Mọi thông tin thanh toán và dữ liệu cá nhân đều được mã hóa theo
						tiêu chuẩn bảo mật hiện đại nhất. Chúng tôi cam kết{" "}
						<strong>KHÔNG</strong> bán, trao đổi hoặc chia sẻ thông tin của bạn
						cho bất kỳ bên thứ ba nào vì mục đích thương mại, ngoại trừ đối tác
						vận chuyển để thực hiện việc giao hàng.
					</p>
				</section>

				<section className="space-y-4 border-t border-[#C49B83]/20 pt-8">
					<h2 className="font-serif text-xl font-medium text-sf-fg">
						3. Quyền lợi của bạn
					</h2>
					<p>
						Bạn có quyền yêu cầu trích xuất, sửa đổi hoặc xóa bỏ hoàn toàn dữ
						liệu cá nhân của mình khỏi hệ thống của chúng tôi bất cứ lúc nào.
						Vui lòng gửi email đến bộ phận hỗ trợ thông qua trang Liên Hệ để
						được xử lý nhanh chóng.
					</p>
				</section>
			</div>
		</div>
	);
}
