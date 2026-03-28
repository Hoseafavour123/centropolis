import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { role, plan } = body;

        if (!role && !plan) {
            return new NextResponse("Invalid request", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                ...(role ? { role } : {}),
                ...(plan ? { plan } : {}),
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("[ADMIN_USER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
