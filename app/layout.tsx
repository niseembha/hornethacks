import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hornet Hacks | A Hackathon for High-School Builders",
    template: "%s | Hornet Hacks"
  },
  description:
    "Hornet Hacks is a beginner-friendly hackathon where high-school students team up, learn new skills, and build ideas worth sharing.",
  keywords: [
    "hackathon",
    "high school",
    "students",
    "coding",
    "design",
    "STEM",
    "Hornet Hacks"
  ],
  icons: {
    icon: "/assets/hornet-mascot.png",
    shortcut: "/assets/hornet-mascot.png",
    apple: "/assets/hornet-mascot.png"
  },
  openGraph: {
    title: "Hornet Hacks",
    description: "Build something worth buzzing about.",
    type: "website",
    siteName: "Hornet Hacks"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10291f"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
