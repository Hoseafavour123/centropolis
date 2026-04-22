import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getDbUser(clerkId: string | null) {
  if (!clerkId) return null;
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function GET() {
  const { userId: clerkId } = await auth();
  const user = await getDbUser(clerkId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const chats = await prisma.sentinelChat.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      lastTokenAddress: true,
      lastTokenChain: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ chats });
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  const user = await getDbUser(clerkId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" && body.title.trim()
    ? body.title.trim().slice(0, 120)
    : "New chat";

  const chat = await prisma.sentinelChat.create({
    data: { userId: user.id, title },
  });

  return NextResponse.json({ chat });
}
