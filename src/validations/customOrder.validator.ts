import { z } from "zod";

export const customOrderValidator = z.object({
	fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
	phone: z
		.string()
		.regex(/^(84|0)(3|5|7|8|9)[0-9]{8}$/, "Số điện thoại không hợp lệ"),
	address: z.string().min(5, "Địa chỉ nhận hoa phải có ít nhất 5 ký tự"),
	budget: z.string().min(1, "Vui lòng nhập ngân sách dự kiến"),
	occasion: z.string().optional(),
	description: z.string().min(5, "Vui lòng mô tả yêu cầu hoặc loài hoa mong muốn"),
});

export type CustomOrderFormValues = z.infer<typeof customOrderValidator>;
