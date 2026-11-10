-- AlterTable
ALTER TABLE "products" ADD COLUMN     "gender_id" INTEGER,
ADD COLUMN     "preco_promocional" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "products_gender_id_idx" ON "products"("gender_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_gender_id_fkey" FOREIGN KEY ("gender_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
