import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers"; // React Query Provider
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import '@solana/wallet-adapter-react-ui/styles.css';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });
const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Binocs | Web3 Trading Terminal",
  description: "Advanced AI-powered trading dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      waitlistUrl="/waitlist"
      appearance={{
        variables: {
          colorPrimary: '#6366f1',
          colorBackground: '#0a0a0f',
          colorText: '#ffffff',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
        <head />
        <body className={`${inter.className} bg-[#0a0a0f] text-white overflow-x-hidden`} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Providers>
              {children}
            </Providers>
          </ThemeProvider>
          <Toaster richColors closeButton position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
