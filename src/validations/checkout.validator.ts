import { z } from "zod";

export const checkoutValidator = z.object({
	fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
	phone: z
		.string()
		.regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
	address: z.string().min(5, "Số nhà, tên đường phải có ít nhất 5 ký tự"),
	ward: z.string().min(1, "Vui lòng nhập Phường/Xã"),
	city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
	district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
});

export type CheckoutFormValues = z.infer<typeof checkoutValidator>;
