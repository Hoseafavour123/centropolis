import { redirect } from "next/navigation";
import { verifyAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const admin = await verifyAdmin();

    if (!admin) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="pl-64">
                <div className="container p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
