-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('FOLLOW', 'LIKE', 'VIEW');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('EARN', 'SPEND', 'TOPUP', 'REFUND');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "instagramUsername" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "target" TEXT NOT NULL,
    "quantityRequested" INTEGER NOT NULL,
    "quantityDelivered" INTEGER NOT NULL DEFAULT 0,
    "costPerAction" INTEGER NOT NULL DEFAULT 10,
    "rewardPerAction" INTEGER NOT NULL DEFAULT 5,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "rewardEarned" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "orderId" TEXT,
    "actionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rise_orders" (
    "order_id" TEXT NOT NULL,
    "profile_id" TEXT,
    "email" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "coins_granted" INTEGER NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rise_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_instagramUsername_key" ON "Profile"("instagramUsername");

-- CreateIndex
CREATE INDEX "Order_status_type_idx" ON "Order"("status", "type");

-- CreateIndex
CREATE INDEX "Order_profileId_idx" ON "Order"("profileId");

-- CreateIndex
CREATE INDEX "Action_actorId_idx" ON "Action"("actorId");

-- CreateIndex
CREATE UNIQUE INDEX "Action_orderId_actorId_key" ON "Action"("orderId", "actorId");

-- CreateIndex
CREATE INDEX "Transaction_profileId_createdAt_idx" ON "Transaction"("profileId", "createdAt");

-- CreateIndex
CREATE INDEX "rise_orders_email_idx" ON "rise_orders"("email");

-- CreateIndex
CREATE INDEX "rise_orders_profile_id_idx" ON "rise_orders"("profile_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rise_orders" ADD CONSTRAINT "rise_orders_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
