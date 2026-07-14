import { z } from "zod";

export const checkoutValidator = z.object({
	fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
	phone: z
		.string()
		.regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
	address: z.string().optional(),
	ward: z.string().optional(),
	city: z.string().optional(),
	district: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutValidator>;
