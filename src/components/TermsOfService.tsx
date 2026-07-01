"use client";

import { AlertCircle, FileText, Leaf } from "lucide-react";

export function TermsOfService() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 bg-sf-bg-elevated transition-colors duration-300">
			<div className="text-center space-y-4 mb-16 border-b border-[#C49B83]/30 pb-10">
				<div className="flex justify-center mb-4">
					<FileText className="h-10 w-10 text-[#C49B83]" />
				</div>
				<span className="text-xs font-bold tracking-widest text-[#C49B83] uppercase block">
					SouFlow Legal
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
					Điều Khoản & Dịch Vụ
				</h1>
				<p className="text-sm text-[#A0A0A0] italic">
					Cập nhật lần cuối: Tháng 5, 2026
				</p>
			</div>

			<div className="space-y-12 text-sm text-[#666666] dark:text-[#A0A0A0] font-light leading-relaxed">
				<section className="space-y-4">
					<h2 className="font-serif text-xl font-medium text-sf-fg flex items-center gap-2">
						<Leaf className="h-5 w-5 text-[#C49B83]" />
						1. Đặc thù sản phẩm hoa tươi
					</h2>
					<p>
						Hoa tươi là sản phẩm nghệ thuật mang tính tự nhiên. Tùy thuộc vào
						mùa vụ và điều kiện khí hậu, một số loại hoa hoặc màu sắc có thể
						không có sẵn chính xác 100% như trên ảnh mẫu.
					</p>
					<div className="p-4 rounded-xl bg-[#C49B83]/5 border border-[#C49B83]/20">
						<p className="text-xs text-sf-fg font-medium">
							Lưu ý quan trọng: Trong trường hợp thiếu hụt nguyên liệu, nghệ
							nhân của chúng tôi sẽ chủ động thay thế bằng các loại hoa có giá
							trị tương đương hoặc cao hơn, đồng thời đảm bảo giữ nguyên tone
							màu và cấu trúc thẩm mỹ tổng thể của tác phẩm.
						</p>
					</div>
				</section>

				<section className="space-y-4">
					<h2 className="font-serif text-xl font-medium text-sf-fg">
						2. Chính sách giao nhận
					</h2>
					<ul className="list-disc pl-5 space-y-2 marker:text-[#C49B83]">
						<li>
							Thời gian giao hàng có thể dao động trong khoảng 30 phút so với
							giờ hẹn trước do các yếu tố khách quan (giao thông, thời tiết).
						</li>
						<li>
							Nếu người nhận không có mặt tại địa chỉ giao hàng, chúng tôi sẽ
							liên hệ với người đặt để tìm phương án giải quyết (gửi bảo vệ, lễ
							tân hoặc hàng xóm).
						</li>
						<li>
							Chúng tôi không chịu trách nhiệm về chất lượng hoa nếu quá trình
							giao nhận bị trì hoãn quá lâu do không liên lạc được với khách
							hàng.
						</li>
					</ul>
				</section>

				<section className="space-y-4">
					<h2 className="font-serif text-xl font-medium text-sf-fg flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-[#C49B83]" />
						3. Hủy đơn và Hoàn tiền
					</h2>
					<p>
						Do đặc thù hàng hóa dễ hỏng hóc và quy trình chuẩn bị nguyên liệu
						sớm, các yêu cầu thay đổi hoặc hủy đơn hàng phải được thực hiện tối
						thiểu <strong>24 giờ</strong> trước thời điểm giao hàng dự kiến. Các
						đơn hàng hủy sát giờ sẽ không được hoàn trả chi phí.
					</p>
				</section>
			</div>
		</div>
	);
}
