import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import SchoolCta from "@/features/marketing/components/SchoolCta";
import Aoscompo from "@/lib/aos";
import Providers from "@/components/Providers";
/**
 * Polices d'Edumada : Plus Jakarta Sans pour les titres et accroches, Inter pour les textes,
 * formulaires et filtres. Alternatives retenues (non chargées) : DM Sans, Nunito Sans.
 */
const heading = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-jakarta" });
const body = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

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
        <html lang="fr" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
            <body>
                <Providers>
                    <Aoscompo>
                        <Header />
                        {/* Place de la barre supérieure de l'en-tête (affichée sur grand écran). */}
                        <div className="lg:pt-10">{children}</div>
                        <SchoolCta />
                        <Footer />
                    </Aoscompo>
                    <ScrollToTop />
                </Providers>
            </body>
        </html>
    );
}
