import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

// Add products to a discount
export async function POST(
  req: Request,
  { params }: { params: { storeId: string; discountId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { productIds } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.discountId) {
      return new NextResponse("Discount ID is required", { status: 400 });
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 });
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

    // Verify discount exists
    const discount = await prismadb.discount.findUnique({
      where: {
        id: params.discountId,
      },
    });

    if (!discount) {
      return new NextResponse("Discount not found", { status: 404 });
    }

    // Update each product to connect it with this discount
    const updatePromises = productIds.map((productId: string) =>
      prismadb.product.update({
        where: {
          id: productId,
          storeId: params.storeId, // Ensure the product belongs to this store
        },
        data: {
          discountId: params.discountId,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[DISCOUNT_PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Remove products from a discount
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; discountId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { productIds } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.discountId) {
      return new NextResponse("Discount ID is required", { status: 400 });
    }

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 });
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

    // Update each product to disconnect it from this discount
    const updatePromises = productIds.map((productId: string) =>
      prismadb.product.update({
        where: {
          id: productId,
          discountId: params.discountId, // Ensure the product is currently in this discount
        },
        data: {
          discountId: null,
        },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[DISCOUNT_PRODUCTS_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}