"use client";

import {
	ArrowRight,
	HeartHandshake,
	Leaf,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { soulFlowRoutes } from "@/lib/soulflow/routes"; // Giữ nguyên route của bạn

export function AboutUs() {
	const coreValues = [
		{
			icon: <Leaf className="h-6 w-6" />,
			title: "Nguyên Bản & Tươi Mới",
			desc: "Mỗi bông hoa đều được tuyển chọn kỹ lưỡng từ các nhà vườn uy tín nhất trong ngày, đảm bảo độ tươi và hương thơm tự nhiên trọn vẹn khi đến tay bạn.",
		},
		{
			icon: <Sparkles className="h-6 w-6" />,
			title: "Nghệ Thuật Thủ Công",
			desc: "Chúng tôi không chỉ bó hoa, chúng tôi kiến tạo nghệ thuật. Mỗi thiết kế là sự tính toán tỉ mỉ về bố cục, màu sắc và thông điệp ẩn giấu bên trong.",
		},
		{
			icon: <HeartHandshake className="h-6 w-6" />,
			title: "Tận Tâm Phục Vụ",
			desc: "Lắng nghe câu chuyện của khách hàng để biến những cảm xúc khó nói thành ngôn ngữ của các loài hoa. Sự hài lòng của bạn là ưu tiên hàng đầu.",
		},
		{
			icon: <ShieldCheck className="h-6 w-6" />,
			title: "Phát Triển Bền Vững",
			desc: "Ưu tiên sử dụng vật liệu đóng gói thân thiện với môi trường, hạn chế rác thải nhựa vì một hành tinh xanh bền vững.",
		},
	];

	return (
		<div className="min-h-screen bg-sf-bg-elevated transition-colors duration-300">
			{/* Header / Hero Section */}
			<section className="relative px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
				<span className="text-sm font-bold uppercase tracking-[0.3em] text-[#C49B83] mb-4 block">
					Về Chúng Tôi
				</span>
				<h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-sf-fg leading-tight max-w-4xl mb-6">
					Nơi Cảm Xúc Nở Hoa, <br className="hidden sm:block" />
					<span className="italic text-[#C49B83]">Vẻ Đẹp Vượt Thời Gian</span>
				</h1>
				<p className="text-xs sm:text-base text-sf-lg max-w-2xl font-light leading-relaxed mb-12">
					Chào mừng bạn đến với không gian nghệ thuật thực vật của chúng tôi.
					Nơi mỗi nhành hoa, chiếc lá đều được nâng niu để kể lên câu chuyện
					riêng biệt của bạn.
				</p>

				{/* Hero Images Grid */}
				<div className="flex flex-col md:grid md:grid-cols-3 gap-4 w-full">
					<div className="relative w-full h-75 md:h-112.5 md:col-span-2 overflow-hidden rounded-2xl">
						<Image
							src="/images/about-us-main1.avif"
							alt="Florist working on a bouquet"
							fill
							className="object-cover hover:scale-105 transition-transform duration-700"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
							loading="eager"
						/>
					</div>
					<div className="relative w-full h-75 md:h-112.5 overflow-hidden rounded-2xl">
						<Image
							src="/images/about-us-main2.avif"
							alt="Beautiful floral arrangement details"
							fill
							className="object-cover hover:scale-105 transition-transform duration-700"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
							loading="eager"
						/>
					</div>
				</div>
			</section>

			{/* Our Story Section */}
			<section className="px-4 py-16 sm:py-24 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#EBE5DA] dark:border-[#C49B83]/30">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
					<div className="relative order-2 lg:order-1">
						<div className="aspect-4/5 rounded-2xl overflow-hidden border border-[#C49B83]/30 p-2 sm:p-4">
							<div className="relative w-full h-full rounded-xl overflow-hidden bg-[#EBE5DA] dark:bg-[#2C2C2C]">
								<Image
									src="/images/about-us-main3.jpg"
									alt="Florist arranging flowers in a workshop"
									fill
									className="w-full h-full object-cover grayscale-20"
									sizes="(max-width: 768px) 100vw, 50vw"
									loading="lazy"
								/>
								{/* Overlay element */}
								<div className="absolute inset-0 bg-[#C49B83]/10 mix-blend-multiply"></div>
							</div>
						</div>
						{/* Decorative background element */}
						<div className="absolute -bottom-6 -left-6 w-32 h-32 border-l border-b border-[#C49B83] opacity-30 rounded-bl-3xl hidden sm:block"></div>
					</div>

					<div className="order-1 lg:order-2 space-y-6">
						<span className="text-sm uppercase tracking-widest text-[#C49B83] font-bold block">
							Câu Chuyện Của Chúng Tôi
						</span>
						<h2 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg leading-snug">
							Khởi Nguồn Từ Tình Yêu <br /> Với Cái Đẹp Nguyên Sơ
						</h2>
						<div className="space-y-4 text-sm sm:text-base text-sf-lg font-light leading-relaxed">
							<p>
								Dự án bắt đầu từ một niềm đam mê mãnh liệt với thực vật và mong
								muốn mang thiên nhiên đến gần hơn với nhịp sống hối hả của đô
								thị. Chúng tôi tin rằng hoa không chỉ là món đồ trang trí vô
								tri, mà là phương tiện mang theo linh hồn và xúc cảm.
							</p>
							<p>
								Từ một xưởng thiết kế nhỏ, chúng tôi đã vươn lên thành một
								thương hiệu được yêu thích. Từng thiết kế tại đây đều thấm đẫm
								sự trau chuốt, tỉ mỉ của những nghệ nhân tâm huyết nhất.
							</p>
							<p>
								Không rập khuôn, không đại trà. Mỗi tác phẩm mang tên thương
								hiệu chúng tôi là một bản giao hưởng độc bản của màu sắc, hình
								dáng và hương thơm — dành riêng cho bạn và những người thân yêu.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Quote / Highlight Section */}
			<section className="bg-[#C49B83]/5 dark:bg-[#C49B83]/10 py-20 px-4 mt-8">
				<div className="max-w-4xl mx-auto text-center space-y-6">
					<div className="text-[#C49B83] flex justify-center mb-6">
						<Leaf className="h-8 w-8 opacity-50" />
					</div>
					<blockquote className="font-serif text-2xl sm:text-3xl md:text-4xl font-light text-sf-fg leading-relaxed italic">
						&quot;Giống như ngôn ngữ, mỗi loài hoa đều có giọng nói riêng của
						nó. Nhiệm vụ của chúng tôi là sắp xếp chúng thành một bài thơ gửi
						đến trái tim.&quot;
					</blockquote>
					<p className="text-xs uppercase tracking-[0.2em] font-bold text-[#C49B83]">
						— Founder of SoulFlow
					</p>
				</div>
			</section>

			{/* Core Values / Why Choose Us */}
			<section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<span className="text-sm uppercase tracking-widest text-[#C49B83] font-bold block mb-3">
						Triết Lý Hoạt Động
					</span>
					<h2 className="font-serif text-3xl sm:text-4xl font-light text-sf-fg">
						Cam Kết Của Thương Hiệu
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{coreValues.map((value) => (
						<div
							key={value.title}
							className="p-6 rounded-2xl border border-[#C49B83]/20 bg-transparent hover:bg-[#C49B83]/5 hover:-translate-y-1 transition-all duration-300 group"
						>
							<div className="w-12 h-12 rounded-full bg-[#C49B83]/10 text-[#C49B83] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
								{value.icon}
							</div>
							<h3 className="font-serif text-lg font-semibold text-sf-fg mb-3">
								{value.title}
							</h3>
							<p className="text-sm text-sf-fg-muted  leading-relaxed">
								{value.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Call to Action Banner */}
			<section className="px-4 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="relative rounded-3xl overflow-hidden bg-[#1A1A1A] dark:bg-[#111111] border border-[#C49B83]/20 flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 shadow-2xl">
					{/* Decorative abstract elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-[#C49B83] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

					<div className="relative z-10 max-w-xl text-center md:text-left mb-8 md:mb-0">
						<h2 className="font-serif text-3xl font-light text-white mb-4">
							Sẵn Sàng Trao Gửi Yêu Thương?
						</h2>
						<p className="text-xl text-gray-300 font-light leading-relaxed">
							Khám phá bộ sưu tập hoa tươi nghệ thuật được thiết kế riêng biệt
							cho mọi dịp quan trọng của bạn.
						</p>
					</div>

					<div className="relative z-10 w-full md:w-auto">
						<Link
							href={soulFlowRoutes.catalog}
							className="group flex w-full md:w-auto items-center justify-center gap-2 px-8 py-4 bg-[#C49B83] text-sf-fg rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#A37B65] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
						>
							Khám Phá Bộ Sưu Tập
							<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
