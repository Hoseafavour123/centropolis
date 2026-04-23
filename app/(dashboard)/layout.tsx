import { Navbar } from "@/components/Shared/Navbar";
import { Sidebar } from "@/components/Shared/Sidebar";
import { RightPanelWrapper } from "@/components/Shared/RightPanelWrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
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
                        <div className="xl:col-span-3" data-right-panel>
                            <div className="sticky top-24">
                                <RightPanelWrapper />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}