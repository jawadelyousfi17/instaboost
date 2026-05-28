// price (USD) → coins. 10 coins = 1 follower @ $0.02.
// 1000 followers @ 10 coins each = 10,000 coins = $20.
export const TOPUP_PACKAGES = {
  "1": 500,
  "5": 2500,
  "10": 5000,
  "20": 10000,
  "50": 25000,
  "100": 50000,
} as const;

export type TopupPrice = keyof typeof TOPUP_PACKAGES;
