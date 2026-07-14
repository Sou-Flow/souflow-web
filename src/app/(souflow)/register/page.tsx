import { Suspense } from "react";
import { RegisterScreen } from "@/components/RegisterScreen";

export default function RegisterPage() {
	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center">
					Loading...
				</div>
			}
		>
			<RegisterScreen />
		</Suspense>
	);
}
