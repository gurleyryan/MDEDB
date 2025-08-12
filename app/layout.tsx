import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans, Space_Mono, Karla } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next';
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

const karla = Karla({
  variable: "--mde-font",
  subsets: ["latin"],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AMPLIFY: Climate Org Directory",
  description:
    "AMPLIFY empowers artists with easy-to-use tools to move their fans to take meaningful climate actions through high-impact, vetted partners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* App Title */}
        <title>AMPLIFY: Climate Org Directory</title>
        {/* Meta Description */}
        <meta name="description" content="AMPLIFY empowers artists with easy-to-use tools to move their fans to take meaningful climate actions through high-impact, vetted partners." />
        {/* Open Graph / Facebook */}
        <meta property="og:title" content="AMPLIFY: Climate Org Directory" />
        <meta property="og:description" content="AMPLIFY empowers artists with easy-to-use tools to move their fans to take meaningful climate actions through high-impact, vetted partners." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AMPLIFY: Climate Org Directory" />
        <meta name="twitter:description" content="AMPLIFY empowers artists with easy-to-use tools to move their fans to take meaningful climate actions through high-impact, vetted partners." />
        <meta name="twitter:image" content="/logo.png" />
        {/* Theme color */}
        <meta name="theme-color" content="#f6ec6b" />
      </head>
      <body
        className={`${outfit.variable} ${ibmPlex.variable} ${spaceMono.variable} ${karla.variable} font-mde antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
