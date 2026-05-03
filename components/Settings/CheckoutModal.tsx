'use client';

import React, { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createQR, encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PLAN_LIMITS } from '@/lib/billing/limits';
import { USDC_MINT as USDC_MINT_STR } from '@/lib/solana/constants';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: 'PRO' | 'WHALE';
  onSuccess: () => void;
}

// Canonical Solana mainnet USDC mint (Circle). Sourced from lib/solana/constants
// so every code path agrees on the same address.
const USDC_MINT = new PublicKey(USDC_MINT_STR);

export function CheckoutModal({ isOpen, onClose, planId, onSuccess }: CheckoutModalProps) {
  const [reference, setReference] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<URL | null>(null);
  const [status, setStatus] = useState<'initializing' | 'pending' | 'success' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    async function initPayment() {
      setStatus('initializing');
      setErrorMessage(null);
      try {
        const res = await fetch('/api/payment/reference');
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to fetch payment reference');
        }
        if (!data?.reference || !data?.recipient) {
          throw new Error('Payment reference response is missing fields');
        }

        const refKey = new PublicKey(data.reference);
        setReference(data.reference);

        const recipient = new PublicKey(data.recipient);
        const amount = new BigNumber(PLAN_LIMITS[planId].price);
        const label = 'Binocs Upgrade';
        const message = `Upgrade to ${planId} Plan`;

        const url = encodeURL({
          recipient,
          amount: amount as any,
          splToken: USDC_MINT,
          reference: refKey,
          label,
          message,
        });

        setPaymentUrl(url);
        setStatus('pending');
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error?.message || 'Failed to initialize payment');
        setStatus('error');
      }
    }

    initPayment();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, planId]);

  // Start polling when reference is set and status is pending
  useEffect(() => {
    if (status !== 'pending' || !reference) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, planId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStatus('success');
            onSuccess();
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setTimeout(() => {
              onClose();
            }, 3000);
          }
        }
      } catch (error) {
        // Silently ignore poll errors
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [status, reference, planId, onSuccess, onClose]);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!paymentUrl) return;
    try {
      await navigator.clipboard.writeText(paymentUrl.toString());
      setCopied(true);
      toast.success('Payment link copied — paste into your wallet app');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Scan the QR code with your Solana wallet to upgrade to {planId}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {status === 'initializing' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating secure payment link...</p>
            </div>
          )}

          {status === 'pending' && paymentUrl && (
            <>
              <div className="bg-white p-4 rounded-xl shadow-inner border border-border">
                <QRCodeSVG
                  value={paymentUrl.toString()}
                  size={256}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div className="space-y-2 text-center w-full">
                <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Amount Due</p>
                  <p className="text-2xl font-mono font-bold">{PLAN_LIMITS[planId].price} USDC</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href={paymentUrl.toString()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Pay with Wallet App
                  </a>
                  <Button
                    type="button"
                    onClick={handleCopy}
                    variant="outline"
                    className="px-3"
                    title="Copy payment link"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Opens your default Solana wallet. On desktop, scanning the QR with your phone is the most reliable path.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Waiting for transaction confirmation...</span>
                </div>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Your account has been upgraded to {planId}.<br/>Redirecting...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-red-400">Failed to initialize payment.</p>
              {errorMessage && (
                <p className="text-xs text-muted-foreground max-w-xs">{errorMessage}</p>
              )}
              <Button onClick={() => onClose()} variant="outline">Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
