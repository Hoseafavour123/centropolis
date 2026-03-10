import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar"
import { Providers } from "@/components/providers/Providers"; // React Query Provider
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Centropolis | Web3 Trading Terminal",
  description: "Advanced AI-powered trading dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="min-h-screen bg-background text-foreground">
              <Navbar />
              <Sidebar />
              <main className="lg:pl-64 pt-16">
                <div className="container p-4 lg:p-8">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Main Content Area (Left + Center) */}
                    <div className="xl:col-span-9 space-y-6">
                      {children}
                    </div>
                    {/* Right Action Panel */}
                    <div className="xl:col-span-3">
                      <div className="sticky top-24">
                        {/* Import RightPanel dynamically if it gets heavy, but for now static import is fine */}
                        <RightPanelImport />
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Helper to avoid import issues in the single file representation
// In a real app, this would be a direct import in layout.tsx
import { RightPanel } from "@/components/layout/RightPanel";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });


function RightPanelImport() {
  return <RightPanel />;
}
