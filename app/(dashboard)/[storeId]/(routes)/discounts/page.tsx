import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { DiscountClient } from "./components/client";
import { DiscountColumn } from "./components/columns";

const DiscountsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  // 1) Fetch your discounts
  const discounts = await prismadb.discount.findMany({
    where: { storeId: params.storeId },
    include: { products: true },
    orderBy: { createdAt: "desc" },
  });

  // 2) Infer the type of a single element:
  type DiscountWithProducts = Awaited<
    ReturnType<typeof prismadb.discount.findMany>
  >[number];

  // 3) Now `item` is fully typed:
  const formattedDiscounts: DiscountColumn[] = (discounts as DiscountWithProducts[]).map(
    (item) => ({
      id: item.id,
      name: item.name,
      percentage: item.percentage.toString(),
      isActive: item.isActive,
      productsCount: item.products.length,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DiscountClient data={formattedDiscounts} />
      </div>
    </div>
  );
};

export default DiscountsPage;
