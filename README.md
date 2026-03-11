# Finance Tracker

Ứng dụng quản lý tài chính cá nhân được xây dựng bằng **Next.js**, **Supabase** và triển khai trên **Vercel**.

---

## Vấn đề mà dự án này giải quyết

Nhiều người không có thói quen theo dõi thu chi hàng ngày, dẫn đến mất kiểm soát tài chính cá nhân. Finance Tracker giúp:

- **Ghi chép thu nhập và chi tiêu** một cách nhanh chóng, có phân loại rõ ràng
- **Phân tích tài chính trực quan** qua biểu đồ theo tháng — biết ngay tiền đi đâu về đâu
- **Quản lý danh mục** tùy chỉnh theo nhu cầu cá nhân (ăn uống, nhà ở, giải trí, lương, đầu tư...)
- **Bảo mật dữ liệu cá nhân** — mỗi người dùng chỉ thấy dữ liệu của chính mình nhờ Row Level Security (RLS) của Supabase
- **Truy cập mọi lúc mọi nơi** — ứng dụng web chạy trên trình duyệt, không cần cài đặt

---

## Tính năng chính

- Đăng ký / Đăng nhập bằng email
- Thêm, sửa, xóa giao dịch thu/chi
- Phân loại giao dịch theo danh mục
- Dashboard tổng quan: tổng thu, tổng chi, số dư
- Biểu đồ thu chi theo tháng
- Danh sách giao dịch gần đây
- Quản lý danh mục tùy chỉnh

---

## Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| Next.js 15 | Framework frontend & backend (App Router) |
| Supabase | Database (PostgreSQL), Authentication, RLS |
| Tailwind CSS | Giao diện |
| Recharts | Biểu đồ |
| Vercel | Triển khai & hosting |

---

## Sự cộng tác của Claude AI trong dự án

Dự án này được phát triển với sự hỗ trợ trực tiếp của **Claude** (claude-sonnet-4-6) — AI assistant của Anthropic — thông qua **Claude Code**, công cụ lập trình AI chạy ngay trong terminal và IDE.

### Claude đã đóng góp vào những phần nào?

- **Thiết kế kiến trúc** — đề xuất cấu trúc thư mục, luồng xác thực, và cách tổ chức components theo App Router của Next.js
- **Viết và chỉnh sửa code** — các components như `TransactionModal`, `DashboardCharts`, `CategoriesClient`, `TransactionsClient`, và các server utilities của Supabase
- **Sửa lỗi TypeScript** — khắc phục lỗi `Parameter 'cookiesToSet' implicitly has an 'any' type` trong middleware Supabase
- **Cấu hình Supabase RLS** — viết SQL để tạo bảng, bật Row Level Security, tạo policies bảo vệ dữ liệu từng người dùng
- **Tạo Postgres Trigger** — tự động seed danh mục mặc định khi người dùng đăng ký, tránh lỗi RLS khi insert từ client chưa có session
- **Debug lỗi Vercel** — phân tích và sửa các lỗi build như `Cannot find module 'autoprefixer'`, lỗi TypeScript, lỗi RLS
- **Việt hóa giao diện** — chuyển toàn bộ UI sang tiếng Việt
- **Quản lý Git** — commit và push code lên GitHub đúng repository

### Quy trình làm việc

Người dùng mô tả yêu cầu hoặc dán thông báo lỗi → Claude phân tích, đề xuất giải pháp, và thực thi trực tiếp trên codebase thông qua Claude Code — không cần copy-paste thủ công.

---

## Cài đặt & chạy local

```bash
# Clone repo
git clone https://github.com/luckyadmin-android/finance-tracker.git
cd finance-tracker

# Cài dependencies
npm install

# Tạo file .env.local và điền thông tin Supabase
cp .env.local.example .env.local

# Chạy development server
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000)

---

## Biến môi trường

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

*Được xây dựng với sự hỗ trợ của [Claude Code](https://claude.ai/code) — Anthropic*
