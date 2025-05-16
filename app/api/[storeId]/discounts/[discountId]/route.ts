import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { discountId: string } }
) {
  try {
    if (!params.discountId) {
      return new NextResponse("Discount ID is required", { status: 400 });
    }

    const discount = await prismadb.discount.findUnique({
      where: {
        id: params.discountId,
      },
      include: {
        products: {
          include: {
            images: true,
            category: true,
            color: true,
            size: true,
          },
        },
      },
    });

    return NextResponse.json(discount);
  } catch (error) {
    console.log("[DISCOUNT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; discountId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, percentage, description, isActive, productIds } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!percentage) {
      return new NextResponse("Percentage is required", { status: 400 });
    }

    if (!params.discountId) {
      return new NextResponse("Discount ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // First, disconnect all products from this discount
    await prismadb.product.updateMany({
      where: {
        discountId: params.discountId,
      },
      data: {
        discountId: null,
      },
    });

    // Update the discount
    const updatedDiscount = await prismadb.discount.update({
      where: {
        id: params.discountId,
      },
      data: {
        name,
        percentage,
        description,
        isActive,
      },
    });

    // If productIds are provided, connect them to the discount
    if (productIds && productIds.length > 0) {
      await Promise.all(
        productIds.map((productId: string) =>
          prismadb.product.update({
            where: {
              id: productId,
            },
            data: {
              discountId: params.discountId,
            },
          })
        )
      );
    }

    return NextResponse.json(updatedDiscount);
  } catch (error) {
    console.log("[DISCOUNT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; discountId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.discountId) {
      return new NextResponse("Discount ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // First, remove the discount from all related products
    await prismadb.product.updateMany({
      where: {
        discountId: params.discountId,
      },
      data: {
        discountId: null,
      },
    });

    // Then delete the discount
    const discount = await prismadb.discount.delete({
      where: {
        id: params.discountId,
      },
    });

    return NextResponse.json(discount);
  } catch (error) {
    console.log("[DISCOUNT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}