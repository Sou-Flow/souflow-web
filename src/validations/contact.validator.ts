import { z } from "zod";

export const contactValidator = z.object({
	name: z
		.string()
		.min(2, "Tên phải có ít nhất 2 ký tự")
		.max(50, "Tên không được vượt quá 50 ký tự")
		.trim(),
	email: z
		.string()
		.min(1, "Vui lòng nhập Email")
		.email("Email không đúng định dạng (VD: abc@gmail.com)")
		.trim(),
	tel: z
		.string()
		.min(1, "Vui lòng nhập số điện thoại")
		.regex(
			/^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
			"Số điện thoại không hợp lệ (Gồm 10 số, bắt đầu bằng 0 hoặc +84)",
		)
		.trim(),
	msg: z
		.string()
		.min(10, "Nội dung cần có ít nhất 10 ký tự")
		.max(1000, "Nội dung quá dài (Tối đa 1000 ký tự)")
		.trim(),
});

export type ContactFormValues = z.infer<typeof contactValidator>;
