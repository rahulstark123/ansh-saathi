import type { Metadata } from "next";
import "./globals.css";
import RoleSwitcher from "@/components/role-switcher";
import AuthSync from "@/components/auth-sync";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ANSH Saathi - Partner Portal",
  description: "Become an ANSH Saathi, join a global partner network, help growing businesses thrive with custom software, and earn recurring commissions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <meta name="theme-color" content="#060608" />
      </head>
      <body className="min-h-full bg-bg-dark text-text-main flex flex-col font-sans antialiased overflow-y-auto">
        <ThemeProvider>
          <AuthSync />
          {children}
          <RoleSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
