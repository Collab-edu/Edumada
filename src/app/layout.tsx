import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import Aoscompo from "@/lib/aos";
import Providers from "@/components/Providers";
const font = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
    title: {
        default: "Edumada — Trouvez votre formation à Madagascar",
        template: "%s | Edumada",
    },
    description:
        "Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet professionnel à Madagascar.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={`${font.className}`}>
                <style>{`:root{--newsletter-url: url('${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/newsletter/hands.svg');}`}</style>
                <Providers>
                    <Aoscompo>
                        <Header />
                        {children}
                        <Footer />
                    </Aoscompo>
                    <ScrollToTop />
                </Providers>
            </body>
        </html>
    );
}
