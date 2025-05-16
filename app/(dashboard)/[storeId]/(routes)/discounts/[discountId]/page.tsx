// app/(dashboard)/[storeId]/(routes)/discounts/[discountId]/page.tsx
import prismadb from "@/lib/prismadb";

import { DiscountForm } from "./components/discount-form";

export const dynamic = "force-dynamic"; // if you need SSR

const DiscountPage = async ({
  params,
}: {
  params: { discountId: string; storeId: string };
}) => {
  // 1) load raw products for the dropdown
  const rawProducts = await prismadb.product.findMany({
    where: { storeId: params.storeId, isArchived: false },
    orderBy: { createdAt: "desc" },
  });

  // 2) map them into your form's expected shape
  const formProducts = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toString(),        // <=== string
    discountId: p.discountId ?? undefined,
    storeId: p.storeId,
  }));

  let initialData = null;

  if (params.discountId !== "new") {
    const db = await prismadb.discount.findUnique({
      where: { id: params.discountId },
      include: { products: true },
    });

    if (db) {
      initialData = {
        id: db.id,
        name: db.name,
        description: db.description ?? undefined,
        percentage: db.percentage.toNumber(),  // <=== number
        isActive: db.isActive,
        // createdAt: db.createdAt,
        // updatedAt: db.updatedAt,
        // if your FormDiscount needs a products list:
        products: db.products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price.toString(),
          discountId: p.discountId ?? undefined,
          storeId: p.storeId,
        })),
      };
    }
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DiscountForm
          initialData={initialData}
          products={formProducts}
        />
      </div>
    </div>
  );
};

export default DiscountPage;
