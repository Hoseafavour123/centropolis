import { NextResponse } from 'next/server';
import { Keypair, PublicKey } from '@solana/web3.js';
import { auth } from '@clerk/nextjs/server';

function getTreasuryWallet(): string | null {
  return (
    process.env.SOLANA_TREASURY_WALLET ||
    process.env.PLATFORM_FEE_ACCOUNT_USDC ||
    null
  );
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const recipient = getTreasuryWallet();
  if (!recipient) {
    console.error('[PAYMENT_REFERENCE] Treasury wallet not configured');
    return NextResponse.json(
      { error: 'Server payment configuration missing' },
      { status: 500 }
    );
  }

  // Validate the recipient is a real public key before returning it
  try {
    new PublicKey(recipient);
  } catch {
    console.error('[PAYMENT_REFERENCE] Invalid treasury wallet address:', recipient);
    return NextResponse.json(
      { error: 'Server payment configuration invalid' },
      { status: 500 }
    );
  }

  const reference = Keypair.generate().publicKey.toBase58();
  return NextResponse.json({ reference, recipient });
}
