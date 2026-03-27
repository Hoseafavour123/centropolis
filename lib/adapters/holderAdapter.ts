import { HeliusLargestAccount, TokenSupply } from "../services/helius";
import { Holder } from "../../types/token";

/**
 * ============================================================================
 * HOLDER ADAPTER
 * ============================================================================
 * Description: Transforms Helius RPC response into a normalized Holder model.
 * ============================================================================
 */

const KNOWN_EXCHANGES = [
    '5tzqcK7neayRyuMBv9m9Kk99LUPwUf68V38BfQduL764', // Binance
    'AC57p9nSJzUDmrT6687WfM7CixfDqMbsX2NpsqyzpGeF', // Coinbase
    'dR7e9uL7q6r5e4w3q2w1e2r3t4y5u6i7o8p9a0s1d2f3', // Kraken (Placeholder)
];

const SMART_MONEY_WALLETS = [
    '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2', // Known Smart Alpha
];

export const holderAdapter = {
    /**
     * Map largest accounts to Holder types
     */
    mapAccountsToHolders(accounts: HeliusLargestAccount[], supply: TokenSupply): Holder[] {
        const totalSupply = supply.uiAmount;
        const WHALE_THRESHOLD = totalSupply * 0.005; // 0.5%

        return accounts.map(account => {
            const amount = account.uiAmount;
            const percentage = (amount / totalSupply) * 100;

            return {
                address: account.address,
                label: this.labelWallet(account.address, amount, WHALE_THRESHOLD),
                percentage,
                amount: account.uiAmountString,
                firstSeen: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(), // Mock for now
                lastSeen: new Date().toISOString()
            };
        });
    },

    /**
     * Basic labeling logic for Phase 1
     */
    labelWallet(address: string, amount: number, whaleThreshold: number): Holder['label'] {
        if (KNOWN_EXCHANGES.includes(address)) return 'exchange';
        if (SMART_MONEY_WALLETS.includes(address)) return 'smart_money';
        if (amount > whaleThreshold) return 'whale';
        return 'unknown';
    }
};
