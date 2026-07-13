import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURAWATT",
  description: "Your Power Partner",
  icons: {
    icon: "/aurawatt_logo.webp",
    apple: "/aurawatt_logo.webp",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
