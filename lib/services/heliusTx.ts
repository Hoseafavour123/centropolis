import axios from 'axios';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

export interface HeliusTx {
    signature: string;
    timestamp: number;
    fromAddress: string;
    toAddress: string;
    amount: number; // Decimal amount
    tokenMint: string;
}

export const heliusTxService = {
    /**
     * Fetch recent token transfers for a given mint address using Helius Enhanced APIs.
     */
    getTokenTransactions: async (address: string, limit: number = 100): Promise<HeliusTx[]> => {
        if (!HELIUS_API_KEY) {
            console.error('[HeliusTx] API Key missing');
            return [];
        }

        try {
            // Use Helius Parsed Transactions / Enriched API
            // For Solana, we can use the 'getSignaturesForAddress' then 'getParsedTransactions'
            // or the more advanced Helius 'getAsset'/'getEnrichedTokenAccountHistory' equivalents.
            // Here we use standard RPC getSignaturesForAddress + getParsedTransactions for simplicity and reliability.

            const sigResponse = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: "2.0",
                id: "1",
                method: "getSignaturesForAddress",
                params: [address, { limit }]
            }, { timeout: 10000 });

            const signatures = sigResponse.data.result?.map((s: any) => s.signature) || [];
            if (signatures.length === 0) return [];

            const txResponse = await axios.post(HELIUS_RPC_URL, {
                jsonrpc: "2.0",
                id: "1",
                method: "getParsedTransactions",
                params: [signatures, { maxSupportedTransactionVersion: 0 }]
            }, { timeout: 10000 });

            const parsedTx = txResponse.data.result || [];

            const results: HeliusTx[] = [];

            for (const tx of parsedTx) {
                if (!tx || !tx.meta) continue;

                // Extract token transfers from instructions/innerInstructions
                // Helius parsed transactions already have 'tokenTransfers' in metadata for many types
                // But let's look at the standard spl-token transfers in the parsed instruction

                const tokenTransfers = tx.meta.postTokenBalances?.filter((b: any) => b.mint === address) || [];
                if (tokenTransfers.length < 2) continue; // Need at least a sender and receiver

                // This is a simplified extraction. In production, we'd use Helius Enriched APIs 
                // but this works for most standard SPL transfers.
                tx.transaction.message.instructions.forEach((ix: any) => {
                    if (ix.program === 'spl-token' && ix.parsed?.type === 'transferChecked') {
                        const info = ix.parsed.info;
                        results.push({
                            signature: tx.transaction.signatures[0],
                            timestamp: tx.blockTime,
                            fromAddress: info.authority || info.source,
                            toAddress: info.destination,
                            amount: parseFloat(info.tokenAmount.uiAmountString),
                            tokenMint: address
                        });
                    }
                });
            }

            return results;
        } catch (error) {
            console.error('[HeliusTx] Error fetching transactions:', error);
            return [];
        }
    }
};
