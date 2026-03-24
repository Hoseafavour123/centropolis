import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if the user already exists in the database
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: user.id },
        });

        // If the user doesn't exist, create them
        if (!dbUser) {
            const primaryEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress;

            if (!primaryEmail) {
                return NextResponse.json({ error: "No email address found" }, { status: 400 });
            }

            dbUser = await prisma.user.create({
                data: {
                    clerkId: user.id,
                    email: primaryEmail,
                    name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
                    image: user.imageUrl,
                },
            });
        }

        return NextResponse.json(dbUser);
    } catch (error) {
        console.error("Error syncing user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
