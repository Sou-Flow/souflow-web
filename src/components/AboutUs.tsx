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
import { soulFlowRoutes } from "@/lib/souflow/routes"; // Giữ nguyên route của bạn

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
			<section className="relative px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
				<span className="text-sm font-bold uppercase tracking-[0.3em] text-sf-accent mb-3 block">
					Về Chúng Tôi
				</span>
				<h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-sf-fg leading-tight max-w-4xl mb-4">
					Nơi Cảm Xúc Nở Hoa, <br className="hidden sm:block" />
					<span className="italic text-sf-accent">Vẻ Đẹp Vượt Thời Gian</span>
				</h1>
				<p className="text-sm sm:text-base text-sf-fg-muted max-w-2xl font-light leading-relaxed mb-8">
					Chào mừng bạn đến với không gian nghệ thuật thực vật của chúng tôi.
					Nơi mỗi nhành hoa, chiếc lá đều được nâng niu để kể lên câu chuyện
					riêng biệt của bạn.
				</p>

				{/* Hero Images Grid */}
				<div className="flex flex-col md:grid md:grid-cols-3 gap-4 w-full">
					<div className="relative w-full h-72 md:h-96 md:col-span-2 overflow-hidden rounded-2xl">
						<Image
							src="/images/about-us-main1.avif"
							alt="Florist working on a bouquet"
							fill
							className="object-cover hover:scale-105 transition-transform duration-700"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 66vw"
							loading="eager"
						/>
					</div>
					<div className="relative w-full h-72 md:h-96 overflow-hidden rounded-2xl">
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
			<section className="px-4 py-12 sm:py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-sf-border">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
					<div className="relative order-2 lg:order-1">
						<div className="aspect-4/5 rounded-2xl overflow-hidden border border-sf-accent/30 p-2 sm:p-3">
							<div className="relative w-full h-full rounded-xl overflow-hidden bg-sf-surface">
								<Image
									src="/images/about-us-main3.jpg"
									alt="Florist arranging flowers in a workshop"
									fill
									className="w-full h-full object-cover grayscale-20"
									sizes="(max-width: 768px) 100vw, 50vw"
									loading="lazy"
								/>
								<div className="absolute inset-0 bg-sf-accent/10 mix-blend-multiply"></div>
							</div>
						</div>
					</div>

					<div className="order-1 lg:order-2 space-y-4">
						<span className="text-sm uppercase tracking-widest text-sf-accent font-bold block">
							Câu Chuyện Của Chúng Tôi
						</span>
						<h2 className="font-serif text-2xl sm:text-3xl font-light text-sf-fg leading-snug">
							Khởi Nguồn Từ Tình Yêu <br /> Với Cái Đẹp Nguyên Sơ
						</h2>
						<div className="space-y-3 text-sm text-sf-fg-muted font-light leading-relaxed">
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
			<section className="bg-sf-surface py-14 px-4 mt-6">
				<div className="max-w-4xl mx-auto text-center space-y-4">
					<div className="text-sf-accent flex justify-center mb-4">
						<Leaf className="h-7 w-7 opacity-70" />
					</div>
					<blockquote className="font-serif text-xl sm:text-2xl md:text-3xl font-light text-sf-fg leading-relaxed italic">
						&quot;Giống như ngôn ngữ, mỗi loài hoa đều có giọng nói riêng của
						nó. Nhiệm vụ của chúng tôi là sắp xếp chúng thành một bài thơ gửi
						đến trái tim.&quot;
					</blockquote>
					<p className="text-xs uppercase tracking-[0.2em] font-bold text-sf-accent">
						— Founder of SouFlow
					</p>
				</div>
			</section>

			{/* Core Values / Why Choose Us */}
			<section className="px-4 py-14 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="text-center mb-10">
					<span className="text-sm uppercase tracking-widest text-sf-accent font-bold block mb-2">
						Triết Lý Hoạt Động
					</span>
					<h2 className="font-serif text-2xl sm:text-3xl font-light text-sf-fg">
						Cam Kết Của Thương Hiệu
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{coreValues.map((value) => (
						<div
							key={value.title}
							className="p-5 rounded-2xl border border-sf-border bg-sf-bg hover:border-sf-accent hover:-translate-y-1 transition-all duration-300 group"
						>
							<div className="w-10 h-10 rounded-full bg-sf-accent/10 text-sf-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
								{value.icon}
							</div>
							<h3 className="font-serif text-base font-semibold text-sf-fg mb-2">
								{value.title}
							</h3>
							<p className="text-xs sm:text-sm text-sf-fg-muted leading-relaxed">
								{value.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Call to Action Banner */}
			<section className="px-4 pb-16 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				<div className="relative rounded-2xl overflow-hidden bg-sf-fg text-sf-bg border border-sf-border flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 shadow-lg">
					<div className="relative z-10 max-w-xl text-center md:text-left mb-6 md:mb-0">
						<h2 className="font-serif text-2xl sm:text-3xl font-light mb-2">
							Sẵn Sàng Trao Gửi Yêu Thương?
						</h2>
						<p className="text-sm text-sf-bg/80 font-light leading-relaxed">
							Khám phá bộ sưu tập hoa tươi nghệ thuật được thiết kế riêng biệt
							cho mọi dịp quan trọng của bạn.
						</p>
					</div>

					<div className="relative z-10 w-full md:w-auto">
						<Link
							href={soulFlowRoutes.catalog}
							className="group flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3.5 bg-sf-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-sf-accent-hover transition-all shadow-md hover:-translate-y-0.5"
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
