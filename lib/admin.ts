import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Verifies if the current authenticated user has the ADMIN role.
 * Returns the user object if they are an admin, otherwise throws an error or returns null.
 */
export async function verifyAdmin() {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { clerkId },
    });

    if (!user) {
        return null;
    }

    // Auto-grant ADMIN role if email matches web3manuel@gmail.com
    if (user.email === "web3manuel@gmail.com" && user.role !== "ADMIN") {
        const updatedUser = await prisma.user.update({
            where: { clerkId },
            data: { role: "ADMIN" }
        });
        return updatedUser;
    }

    if (user.role !== "ADMIN") {
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
