/*
  Warnings:

  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `arttype` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heroImage` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "arttype" TEXT NOT NULL,
ADD COLUMN     "heroImage" TEXT NOT NULL,
ADD COLUMN     "image2" TEXT,
ADD COLUMN     "image3" TEXT,
ALTER COLUMN "artnr" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
DROP SEQUENCE "Product_artnr_seq";

-- DropTable
DROP TABLE "ProductImage";
