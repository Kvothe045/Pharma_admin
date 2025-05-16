import prismadb from "@/lib/prismadb";

import { DiscountForm } from "./components/discount-form";

const DiscountPage = async ({
  params
}: {
  params: { discountId: string, storeId: string }
}) => {
  let discount = null;
  
  // Fetch all products to be able to associate them with the discount
  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  if (params.discountId !== "new") {
    discount = await prismadb.discount.findUnique({
      where: {
        id: params.discountId,
      },
      include: {
        products: true,
      },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DiscountForm 
          initialData={discount} 
          products={products}
        />
      </div>
    </div>
  );
};

export default DiscountPage;