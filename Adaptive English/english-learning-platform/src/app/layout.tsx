import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProvider } from "@/lib/store";
import { RoleSwitcher } from "@/components/ui/RoleSwitcher";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { StudyChatbot } from "@/components/ui/StudyChatbot";

import { DevAgentAnnotator } from "@/components/dev/DevAgentAnnotator";

export const metadata: Metadata = {
  title: "Adaptive study — Nền tảng học tiếng Anh thích ứng",
  description: "Small steps. Real progress. Học tiếng Anh theo lộ trình thích ứng thông minh và tự chủ.",
  icons: {
    icon: "/assets/mascot/avatar.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
        <AppProvider>
          <RoleSwitcher />
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <StudyChatbot />
          {/* Dev-only Component Annotator cho Agent/Dev. Khi deploy production chỉ cần gỡ dòng này */}
          {process.env.NODE_ENV !== 'production' && <DevAgentAnnotator />}
        </AppProvider>
      </body>
    </html>
  );
}
