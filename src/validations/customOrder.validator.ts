import { z } from "zod";

export const customOrderValidator = z.object({
	fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
	phone: z
		.string()
		.regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
	address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
	description: z.string().min(10, "Mô tả yêu cầu phải có ít nhất 10 ký tự"),
});

export type CustomOrderFormValues = z.infer<typeof customOrderValidator>;
