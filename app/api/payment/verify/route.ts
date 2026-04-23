import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { prisma } from '@/lib/prisma';
import { PLAN_LIMITS } from '@/lib/billing/limits';
import { USDC_MINT as USDC_MINT_STR } from '@/lib/solana/constants';

// Canonical Solana mainnet USDC mint (Circle). Sourced from lib/solana/constants
// so the client QR builder and this verifier always agree.
const USDC_MINT = new PublicKey(USDC_MINT_STR);

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { reference, planId } = body;

    if (!reference || !planId || (planId !== 'PRO' && planId !== 'WHALE')) {
      return new NextResponse('Invalid parameters', { status: 400 });
    }

    const treasuryWalletStr =
      process.env.SOLANA_TREASURY_WALLET ||
      process.env.PLATFORM_FEE_ACCOUNT_USDC;
    if (!treasuryWalletStr) {
      console.error('Treasury wallet env var not set (SOLANA_TREASURY_WALLET / PLATFORM_FEE_ACCOUNT_USDC)');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    const treasuryWallet = new PublicKey(treasuryWalletStr);
    const referenceKey = new PublicKey(reference);

    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC ||
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // 1. Find the transaction on-chain with this reference
    const signatureInfo = await findReference(connection, referenceKey, { finality: 'confirmed' });

    // 2. Validate it's exactly what we expect (correct amount of USDC sent to treasury)
    const expectedAmount = new BigNumber(PLAN_LIMITS[planId as 'PRO' | 'WHALE'].price);
    
    await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient: treasuryWallet,
        amount: expectedAmount as any,
        splToken: USDC_MINT,
        reference: referenceKey,
      },
      { commitment: 'confirmed' }
    );

    // 3. Payment verified! Update the user plan.
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.user.update({
      where: { clerkId },
      data: {
        plan: planId,
        planStartedAt: now,
        planExpiresAt: expiresAt,
      }
    });

    return NextResponse.json({ success: true, plan: planId, expiresAt });

  } catch (error: any) {
    // If findReference or validateTransfer fails, it throws an error
    // findReference throws when no matching tx is found yet (this is normal during polling)
    if (!error.message?.includes('not found')) {
       console.error('[PAYMENT_VERIFY]', error.message);
    }
    return NextResponse.json({ error: 'Payment not found or invalid' }, { status: 400 });
  }
}
