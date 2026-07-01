# 🌸 SouFlow Web

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

Frontend cho dự án tốt nghiệp **SouFlow - Website Cửa hàng hoa**.

Được thiết kế với giao diện hiện đại, tối ưu trải nghiệm người dùng (UX/UI) và tích hợp đầy đủ các tính năng thương mại điện tử.

---

## ✨ Tính năng nổi bật (Features)

* **Shopping Cart & Checkout**: Quản lý giỏ hàng với Zustand, đặt hàng và thanh toán mượt mà.
* **Authentication**: Đăng nhập/Đăng ký an toàn (tích hợp token-based auth).
* **Responsive Design**: Giao diện thích ứng trên mọi thiết bị với Tailwind CSS.
* **Modern UI**: Sử dụng Framer Motion cho animation và Lucide React cho icon.
* **Dark/Light Mode**: Hỗ trợ giao diện sáng tối linh hoạt.
* **Form Validation**: Kiểm tra dữ liệu form chặt chẽ với React Hook Form và Zod.

---

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu hệ thống

* Node.js 20+
* npm 10+

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

---

## 📥 Clone dự án

```bash
git clone https://github.com/nhockevin/flowershop-fe.git
cd flowershop-fe
```

---

## 📦 Cài đặt thư viện

```bash
npm install
```

---

## ▶️ Chạy môi trường Development

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Build Production

### 1. Build dự án

```bash
npm run build
```

### 2. Chạy Production Server

```bash
npm run start
```

---

## 🛠️ Công nghệ sử dụng

### Core
* **Framework:** Next.js 16
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4

### Data Fetching & State
* **HTTP Client:** Axios
* **Server State:** TanStack Query
* **Client State:** Zustand

### Form & Validation
* React Hook Form
* Zod
* @hookform/resolvers

### UI & UX
* Lucide React (Icons)
* Framer Motion (Animations)
* Next Themes (Dark/Light mode)
* Sonner & React Hot Toast (Notifications)

### Code Quality
* Biome (Linter & Formatter)
* Husky & Lint Staged (Pre-commit hooks)
* Commitlint (Commit message rules)

---

## 📂 Cấu trúc thư mục

```text
src/
├── app/            # App Router (Pages & Layouts)
├── components/     # Reusable UI Components
├── hooks/          # Custom React Hooks
├── lib/            # Utilities and configurations (routes, etc.)
├── providers/      # Context Providers (Auth, Theme, Query...)
├── services/       # API Services (Axios instances & calls)
├── stores/         # Zustand global states
├── types/          # TypeScript interfaces & types
└── utils/          # Helper functions
```

---

## 👥 Quy tắc làm việc nhóm

1. **Package Manager:** Luôn sử dụng `npm` để quản lý package.
2. **Security:** Tuyệt đối không commit file `.env` lên Git.
3. **Git Flow:** Luôn `git pull` code mới nhất trước khi làm việc và trước khi push.
4. **Commits:** Tuân thủ chuẩn [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
5. **Quality Gate:** Husky và Commitlint sẽ tự động kiểm tra code (`biome check`) và format commit message mỗi khi bạn commit. Đảm bảo project build thành công trước khi push.

---
*Developed for SouFlow.*

