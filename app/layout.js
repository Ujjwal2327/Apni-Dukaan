import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";
import { ThemeProvider } from "next-themes";
import DynamicHeight from "@/components/ui/DynamicHeight";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Apni Dukaan",
  description:
    "Manage your shop's sales and stock effortlessly with Apni Dukaan. Store product info and analyze trends to boost your business!",
  keywords:
    "Apni Dukaan, sales management, stock management, product information, shop management, sales analysis, business performance, inventory tracking, small business tools, retail management, sales trends",
  url: "https://apni--dukaan.vercel.app/",
  canonical: "https://apni--dukaan.vercel.app/",
  robots: "index, follow",
  author: "Ujjwal",
  publisher: "Ujjwal",
  lang: "en",
};

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang={metadata.lang}>
      <body className={inter.className}>
        <DynamicHeight />
        <ThemeProvider
          defaultTheme="dark"
          enableSystem={false}
          attribute="class"
          forcedTheme="dark"
        >
          <Navbar session={session} />
          <div className="px-10">{children}</div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
