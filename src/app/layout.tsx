import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Aoscompo from "@/lib/aos";
const font = Inter({ subsets: ["latin"] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${font.className}`}>
                <style>{`:root{--banner-url: url('${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/banner/background.png'); --newsletter-url: url('${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/newsletter/hands.svg');}`}</style>
                <Aoscompo>
                    <Header />
                    {children}
                    <Footer />
                </Aoscompo>
                <ScrollToTop />
            </body>
        </html>
    );
}
