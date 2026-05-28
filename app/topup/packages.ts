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

// Rise store. Picking a package sends the user to a Rise product page to pay;
// Rise then POSTs the purchase to /upadte-user, which credits coins by price.
export const RISE_STORE_BASE = "https://shop-lilac-delta-19.vercel.app";

// price (USD) → Rise product slug. Falls back to the default pack.
// TODO: add a dedicated Rise product slug per package as they're created.
export const RISE_PRODUCT_SLUGS: Partial<Record<TopupPrice, string>> = {};
export const RISE_DEFAULT_SLUG = "go-viral-instagram-pack-1";

/** Build the Rise product URL a buyer is sent to, carrying their email in `?u=`. */
export function riseProductUrl(price: TopupPrice, email: string): string {
  const slug = RISE_PRODUCT_SLUGS[price] ?? RISE_DEFAULT_SLUG;
  return `${RISE_STORE_BASE}/products/${slug}?u=${encodeURIComponent(email)}`;
}
