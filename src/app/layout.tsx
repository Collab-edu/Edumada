import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import SchoolCta from "@/features/marketing/components/SchoolCta";
import NavigationProgress from "@/components/layout/NavigationProgress";
import { Suspense } from "react";
import Providers from "@/components/Providers";
import { HtmlLang } from "@/i18n/LanguageSwitcher";
/**
 * Polices d'Edumada : Plus Jakarta Sans pour les titres et accroches, Inter pour les textes,
 * formulaires et filtres. Alternatives retenues (non chargées) : DM Sans, Nunito Sans.
 */
const heading = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], display: "swap", variable: "--font-jakarta" });
const body = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
    title: {
        default: "Edumada : universités, écoles et formations à Madagascar",
        template: "%s | Edumada",
    },
    description:
        "Universités, écoles privées, centres de formation professionnelle et crèches à Madagascar : filières, frais de scolarité, conditions d'admission et dates d'inscription de chaque établissement.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
            <body>
                <Suspense fallback={null}>
                    <NavigationProgress />
                </Suspense>
                <HtmlLang />
                <Providers>
                    <Header />
                    {/* Place de la barre supérieure de l'en-tête (affichée sur grand écran). */}
                    <div className="lg:pt-10">{children}</div>
                    <SchoolCta />
                    <Footer />
                    <WhatsAppButton />
                </Providers>
            </body>
        </html>
    );
}
