import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const {
      name,
      price,
      categoryId,
      sizeId,
      colorId,
      images,
      isFeatured,
      isArchived,
    } = body

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!name) {
      return new NextResponse('Missing name', { status: 400 })
    }

    if (!price) {
      return new NextResponse('Missing price', { status: 400 })
    }

    if (!categoryId) {
      return new NextResponse('Missing categoryId', { status: 400 })
    }

    if (!sizeId) {
      return new NextResponse('Missing sizeId', { status: 400 })
    }

    if (!colorId) {
      return new NextResponse('Missing colorId', { status: 400 })
    }

    if (!images || !images.length) {
      return new NextResponse('Missing images', { status: 400 })
    }

    if (!params.storeId) {
      return new NextResponse('Missing storeId', { status: 400 })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,
        sizeId,
        colorId,
        isFeatured,
        isArchived,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    })

    return new NextResponse(JSON.stringify(product), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured')
    const discountId = searchParams.get('discountId') || undefined; // Add discount filter


    if (!params.storeId) {
      return new NextResponse('Missing storeId', { status: 400 })
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        discountId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        color: true,
        size: true,
        discount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return new NextResponse(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.log('[PRODUCTS_GET]', error)

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
