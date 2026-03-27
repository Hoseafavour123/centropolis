import { useState, useCallback, useRef } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { TradeQuoteResponse } from '@/types/token';
import { toast } from 'sonner';

export type TradeState = 'idle' | 'quoting' | 'quoted' | 'swapping' | 'success' | 'failed';

export function useTrade() {
    const [tradeState, setTradeState] = useState<TradeState>('idle');
    const [quote, setQuote] = useState<TradeQuoteResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { connection } = useConnection();
    const { publicKey, signTransaction, sendTransaction } = useWallet();

    // Debounce ref for quote fetching
    const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchQuote = useCallback(async (
        inputMint: string,
        outputMint: string,
        amount: string,
        slippageBps: number = 50
    ) => {
        if (!amount || parseFloat(amount) <= 0) {
            setTradeState('idle');
            setQuote(null);
            return;
        }

        if (quoteTimeoutRef.current) {
            clearTimeout(quoteTimeoutRef.current);
        }

        setTradeState('quoting');
        setError(null);

        // Provide immediate visual feedback, then fetch
        return new Promise<void>((resolve) => {
            quoteTimeoutRef.current = setTimeout(async () => {
                try {
                    const params = new URLSearchParams({
                        inputMint,
                        outputMint,
                        amount,
                        slippageBps: slippageBps.toString()
                    });

                    const res = await fetch(`/api/trade/quote?${params.toString()}`);
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || 'Failed to fetch quote');
                    }

                    setQuote(data);
                    setTradeState('quoted');
                } catch (err: any) {
                    console.error('Quote error:', err);
                    setError(err.message || 'Error fetching quote');
                    setTradeState('failed');
                    setQuote(null);
                } finally {
                    resolve();
                }
            }, 500); // 500ms debounce
        });
    }, []);

    const executeSwap = useCallback(async (directParams?: { inputMint: string, outputMint: string, amount: string }) => {
        if (!publicKey || !signTransaction) {
            toast.error('Please connect your wallet first.');
            return;
        }

        setTradeState('swapping');
        setError(null);

        let currentQuote = quote;

        try {
            console.log('\n========================================');
            console.log('[useTrade] 🔄 Starting Swap Execution');
            console.log('User PublicKey:', publicKey.toBase58());
            console.log('Direct Params Provided:', directParams ? 'Yes' : 'No', directParams);

            // If directParams are provided, we skip checking the pre-fetched quote
            // and fetch it immediately before swapping (for QuickTrade)
            if (directParams) {
                toast.loading('Finding best route...', { id: 'swap-toast' });
                const params = new URLSearchParams({
                    inputMint: directParams.inputMint,
                    outputMint: directParams.outputMint,
                    amount: directParams.amount,
                    slippageBps: '50'
                });
                const res = await fetch(`/api/trade/quote?${params.toString()}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch quote');
                console.log('[useTrade] 📊 Fetched direct quote:', data);
                currentQuote = data;
                setQuote(data);
            } else {
                console.log('[useTrade] 📊 Using pre-fetched quote:', currentQuote);
            }

            if (!currentQuote) {
                setTradeState('idle');
                toast.error('No active quote found.', { id: 'swap-toast' });
                return;
            }
            console.log('[useTrade] 🚀 Sending swap request to /api/trade/swap with body:', {
                userPublicKey: publicKey.toBase58(),
                slippageBps: currentQuote.route.slippageBps ?? 50,
                feeMint: currentQuote.feeMint,
                feeStrategy: currentQuote.feeStrategy,
                manualFeeAtoms: currentQuote.manualFeeAtoms,
                // Omitting raw route dump for clarity in logs, just showing fee targets
            });

            // 1. Get Serialized Transaction from our API
            const swapRes = await fetch('/api/trade/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Pass the full Jupiter quoteResponse directly — the swap API
                    // uses it as-is to build the transaction, avoiding a redundant
                    // re-quote and any price drift between quote and swap.
                    quoteResponse: currentQuote.route,
                    userPublicKey: publicKey.toBase58(),
                    slippageBps: currentQuote.route.slippageBps ?? 50,
                    // Forward the fee strategy so the swap API can attach the
                    // correct Jupiter referral account (input or output side).
                    feeMint: currentQuote.feeMint,
                    feeStrategy: currentQuote.feeStrategy,
                    manualFeeAtoms: currentQuote.manualFeeAtoms,
                })
            });

            const swapData = await swapRes.json();
            if (!swapRes.ok) {
                console.error('[useTrade] ❌ Swap API Error:', swapData);
                throw new Error(swapData.error || 'Failed to prepare swap transaction');
            }

            console.log('[useTrade] ✅ Received swapTransaction (base64) from API. Length:', swapData.swapTransaction.length);

            // 2. Deserialize Transaction
            const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            // 3. Sign and Send Transaction
            toast.loading('Please sign the transaction in your wallet...', { id: 'swap-toast' });

            const latestBlockhash = await connection.getLatestBlockhash();

            const signature = await sendTransaction(transaction, connection);

            toast.loading('Confirming transaction...', { id: 'swap-toast' });

            // 4. Confirm Transaction
            const confirmation = await connection.confirmTransaction({
                signature,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
            }, 'confirmed');

            if (confirmation.value.err) {
                console.error('[useTrade] ❌ Transaction failed on-chain. Signature:', signature, 'Error:', confirmation.value.err);
                throw new Error('Transaction failed on-chain');
            }

            console.log('[useTrade] 🎉 Swap successful! Signature:', signature);
            console.log('========================================\n');

            toast.success('Swap successful!', { id: 'swap-toast' });
            setTradeState('success');

            // Reset after success
            setTimeout(() => {
                setTradeState('idle');
                setQuote(null);
            }, 3000);

        } catch (err: any) {
            console.error('Swap error:', err);
            const errMsg = err.message || 'Transaction failed or was rejected';
            setError(errMsg);
            setTradeState('failed');
            toast.error(`Swap failed: ${errMsg}`, { id: 'swap-toast' });
        }
    }, [quote, publicKey, signTransaction, sendTransaction, connection]);

    const resetTrade = useCallback(() => {
        setTradeState('idle');
        setQuote(null);
        setError(null);
    }, []);

    return {
        tradeState,
        quote,
        error,
        fetchQuote,
        executeSwap,
        resetTrade
    };
}
