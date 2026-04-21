-- CreateTable
CREATE TABLE "Orders" (
    "orderId" INTEGER NOT NULL,
    "customerDetails" JSONB NOT NULL,
    "products" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("orderId")
);
