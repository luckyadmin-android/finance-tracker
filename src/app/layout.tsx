import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CurrencyProvider } from "@/components/CurrencyProvider";

export const metadata: Metadata = {
  title: "Quản Lý Tài Chính",
  description: "Theo dõi thu nhập và chi tiêu của bạn",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body className="min-h-screen bg-mesh-light font-body transition-colors duration-300">
        <ThemeProvider><CurrencyProvider>{children}</CurrencyProvider></ThemeProvider>
      </body>
    </html>
  );
}
