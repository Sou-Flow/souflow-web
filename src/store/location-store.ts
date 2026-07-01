// src/store/location-store.ts

import { create } from "zustand";
import { defaultLocations } from "@/lib/data/default-locations";
import type { VietnamCity } from "@/types/location.type";

interface LocationState {
	locationData: VietnamCity[];
	fetchLocationData: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
	locationData: defaultLocations, // Fallback data

	fetchLocationData: async () => {
		try {
			const response = await fetch("/data/ghn-locations.json");
			if (!response.ok) throw new Error("Failed to load locations");
			const data = await response.json();
			if (Array.isArray(data)) {
				set({ locationData: data });
			} else if (data && Array.isArray(data.value)) {
				set({ locationData: data.value });
			} else {
				throw new Error("Invalid location data format");
			}
		} catch {
			// Lỗi thì giữ nguyên defaultLocations, không cần làm gì
		}
	},
}));
