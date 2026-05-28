This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Rise purchase webhook

The Rise store delivers paid purchases to this app via a signed POST to `/upadte-user` (handler: `app/upadte-user/route.ts`; delivery logic: `lib/rise/`). Set `RISE_WEBHOOK_SECRET` in the environment to a long random string (`openssl rand -hex 32`) and paste the **same** value into Rise — it is the shared HMAC-SHA256 secret used to verify each request; never commit or log it. On a verified event the webhook resolves the buyer by email (Supabase auth → `Profile`), records an idempotent `rise_orders` ledger row keyed on `orderId`, and credits coins (`priceCents * 5`, matching the topup ratio; override per-product in `RISE_PRODUCT_MAP`). Unknown emails return `404` (no auto-create, since a `Profile` requires a unique `instagramUsername`). Run `npx prisma db push` after pulling to create the `rise_orders` table.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
