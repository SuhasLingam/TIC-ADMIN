import "~/styles/globals.css";

import { type Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Admin | The Incite Crew",
  description: "Internal Dashboard for The Incite Crew",
  icons: [
    { rel: "icon", url: "/logo/ticlogo.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/logo/ticlogo.svg", sizes: "any" },
    { rel: "apple-touch-icon", url: "/logo/ticlogo.svg" },
  ],
};

const neueMontreal = localFont({
  src: "../../public/fonts/NeueMontreal-Medium.otf",
  variable: "--font-heading",
  weight: "500",
});

const nord = localFont({
  src: "../../public/fonts/Nord-Regular.woff2",
  variable: "--font-sans",
  weight: "400",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${neueMontreal.variable} ${nord.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans transition-colors duration-500 ease-in-out min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
