import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Verifies if the current authenticated user has the ADMIN role.
 * Returns the user object if they are an admin, otherwise throws an error or returns null.
 */
export async function verifyAdmin() {
    const { userId: clerkId } = auth();

    if (!clerkId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { clerkId },
    });

    if (!user || user.role !== "ADMIN") {
        return null;
    }

    return user;
}

/**
 * Server Component / API Route helper to ensure admin access.
 * Throws an error if not an admin.
 */
export async function requireAdmin() {
    const user = await verifyAdmin();
    if (!user) {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}
