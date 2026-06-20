"use client";

import { type ReactNode, useEffect } from "react";
import { useSoulFlowStore } from "@/store/soulflow-store";

type BoutiqueProvidersProps = {
	children: ReactNode;
};

/** Loads catalog and location data once on the client after hydration. */
export function BoutiqueProviders({ children }: BoutiqueProvidersProps) {
	const fetchFlowers = useSoulFlowStore((state) => state.fetchFlowers);
	const fetchLocationData = useSoulFlowStore(
		(state) => state.fetchLocationData,
	);

	useEffect(() => {
		void fetchFlowers();
		void fetchLocationData();
	}, [fetchFlowers, fetchLocationData]);

	return children;
}
