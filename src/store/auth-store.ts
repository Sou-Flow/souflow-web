// src/store/auth-store.ts

import Cookies from "js-cookie";
import { create } from "zustand";
import type { UserFE } from "@/types/auth.type";
import { useCartStore } from "./cart-store";

interface AuthState {
	user: UserFE | null;
	setUser: (userData: UserFE | null) => void;
	clearUser: () => void;
	logout: () => void;
	updateUser: (profile: Partial<UserFE>) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
	user: null,
	setUser: (userData) => {
		set({ user: userData });
		if (userData) {
			useCartStore.getState().fetchCart();
		}
	},
	clearUser: () => {
		set({ user: null });
		useCartStore.getState().clearCartState();
	},
	logout: () => {
		Cookies.remove("accessToken");
		set({ user: null });
		useCartStore.getState().clearCartState();
	},
	updateUser: (profile) =>
		set({ user: { ...get().user, ...profile } as UserFE }),
}));
