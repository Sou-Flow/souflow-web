import { z } from "zod";

export const registerValidator = z
	.object({
		username: z
			.string()
			.min(3, "Tên người dùng phải có ít nhất 3 ký tự")
			.max(20, "Tên người dùng không được quá 20 ký tự"),
		email: z.string().email("Địa chỉ email không hợp lệ"),
		password: z
			.string()
			.min(6, "Mật khẩu phải có ít nhất 6 ký tự")
			.regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ cái viết hoa")
			.regex(/[a-z]/, "Mật khẩu phải chứa ít nhất một chữ cái viết thường")
			.regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một số"),
		confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
		phoneNumber: z
			.string()
			.regex(/^\d{10}$/, "Số điện thoại phải có 10 chữ số")
			.regex(/^(0|\+84)/, "Số điện thoại phải bắt đầu bằng 0 hoặc +84"),
		fullName: z.string().min(1, "Họ và tên không được để trống"),
		street: z.string().min(5, "Số nhà, tên đường phải có ít nhất 5 ký tự"),
		ward: z.string().min(1, "Vui lòng chọn hoặc nhập Phường/Xã"),
		district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
		city: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu xác nhận không khớp",
	});

export type RegisterFormData = z.infer<typeof registerValidator>;
