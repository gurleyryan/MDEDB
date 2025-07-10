import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import "./globals.css";




const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});




const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Climate Org Directory & Scoring Dashboard",
  description:
    "A sophisticated platform to catalog, score, and assess grassroots climate organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${ibmPlex.variable} ${spaceMono.variable} font-ibm-plex antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
