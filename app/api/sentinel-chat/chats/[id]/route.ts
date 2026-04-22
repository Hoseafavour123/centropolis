import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function loadOwnedChat(clerkId: string | null, chatId: string) {
  if (!clerkId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;
  const chat = await prisma.sentinelChat.findFirst({
    where: { id: chatId, userId: user.id, deletedAt: null },
  });
  if (!chat) return null;
  return { user, chat };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  const ctx = await loadOwnedChat(clerkId, id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 120) : "";
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const chat = await prisma.sentinelChat.update({
    where: { id },
    data: { title },
  });
  return NextResponse.json({ chat });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  const ctx = await loadOwnedChat(clerkId, id);
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.sentinelChat.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
