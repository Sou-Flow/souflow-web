"use client";

import { SlidersHorizontal } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface PriceFilterProps {
	minPrice: number | null;
	maxPrice: number | null;
	onFilter: (min: number | null, max: number | null) => void;
	maxLimit?: number;
}

export function PriceFilter({
	minPrice,
	maxPrice,
	onFilter,
	maxLimit = 5000000, // Mặc định 5 triệu
}: PriceFilterProps) {
	const [localMin, setLocalMin] = useState<number>(minPrice || 0);
	const [localMax, setLocalMax] = useState<number>(maxPrice || maxLimit);
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	// Đồng bộ khi state bên ngoài (từ nút xóa filter) thay đổi
	useEffect(() => {
		setLocalMin(minPrice || 0);
		setLocalMax(maxPrice || maxLimit);
	}, [minPrice, maxPrice, maxLimit]);

	// Tắt popup khi click ra ngoài
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Math.min(Number(e.target.value), localMax - 50000); // Cách nhau ít nhất 50k
		setLocalMin(value);
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Math.max(Number(e.target.value), localMin + 50000);
		setLocalMax(value);
	};

	const applyFilter = () => {
		onFilter(
			localMin > 0 ? localMin : null,
			localMax < maxLimit ? localMax : null,
		);
		setIsOpen(false);
	};

	// Tính phần trăm để vẽ màu cho thanh trượt
	const minPercent = (localMin / maxLimit) * 100;
	const maxPercent = (localMax / maxLimit) * 100;

	return (
		<div className="relative" ref={popoverRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center gap-2 rounded-lg border py-1.5 px-3 text-xs font-semibold transition-colors ${
					minPrice !== null || maxPrice !== null
						? "border-sf-accent bg-sf-accent/10 text-sf-accent"
						: "border-sf-border bg-sf-bg-elevated text-sf-fg hover:border-sf-accent"
				}`}
			>
				<SlidersHorizontal className="h-4 w-4" />
				Mức Giá
			</button>

			{isOpen && (
				<div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-sf-border bg-sf-surface p-5 shadow-xl z-50">
					<h4 className="text-sm font-bold text-sf-fg mb-6">Khoảng Giá</h4>

					{/* Custom Dual Range Slider */}
					<div className="relative h-1.5 w-full bg-sf-border rounded-full mb-8">
						{/* Vùng màu hiển thị khoảng giá đã chọn */}
						<div
							className="absolute h-full bg-sf-accent rounded-full pointer-events-none"
							style={{
								left: `${minPercent}%`,
								width: `${maxPercent - minPercent}%`,
							}}
						/>

						{/* Nút kéo Min */}
						<input
							type="range"
							min="0"
							max={maxLimit}
							step="50000"
							value={localMin}
							onChange={handleMinChange}
							className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sf-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
						/>
						{/* Nút kéo Max */}
						<input
							type="range"
							min="0"
							max={maxLimit}
							step="50000"
							value={localMax}
							onChange={handleMaxChange}
							className="absolute w-full -top-1.5 h-4 appearance-none bg-transparent pointer-events-none cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-sf-accent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
						/>
					</div>

					{/* Input số tiền */}
					<div className="flex items-center gap-2 mb-5">
						<div className="flex-1">
							<label
								htmlFor="price-min"
								className="text-[10px] uppercase font-bold text-sf-fg-muted block mb-1"
							>
								Từ
							</label>
							<div className="relative">
								<input
									id="price-min"
									type="number"
									value={localMin}
									onChange={(e) => setLocalMin(Number(e.target.value))}
									className="w-full rounded-md border border-sf-border bg-sf-bg px-2 py-1.5 text-xs text-sf-fg outline-none focus:border-sf-accent"
								/>
							</div>
						</div>
						<span className="text-sf-fg-muted mt-4">-</span>
						<div className="flex-1">
							<label
								htmlFor="price-max"
								className="text-[10px] uppercase font-bold text-sf-fg-muted block mb-1"
							>
								Đến
							</label>
							<div className="relative">
								<input
									id="price-max"
									type="number"
									value={localMax}
									onChange={(e) => setLocalMax(Number(e.target.value))}
									className="w-full rounded-md border border-sf-border bg-sf-bg px-2 py-1.5 text-xs text-sf-fg outline-none focus:border-sf-accent"
								/>
							</div>
						</div>
					</div>

					{/* Nút hành động */}
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={() => {
								setLocalMin(0);
								setLocalMax(maxLimit);
								onFilter(null, null);
								setIsOpen(false);
							}}
							className="px-3 py-1.5 text-xs font-semibold text-sf-fg-muted hover:text-sf-fg transition-colors"
						>
							Bỏ lọc
						</button>
						<button
							type="button"
							onClick={applyFilter}
							className="px-4 py-1.5 rounded-md bg-sf-accent text-white text-xs font-bold hover:bg-sf-accent/90 transition-colors"
						>
							Áp Dụng
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
