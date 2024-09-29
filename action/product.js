import prisma from "@/lib/db";
import { updateShopCache } from "@/lib/redis";
import { handleActionError, handleCaughtActionError } from "@/utils";

export async function createProduct(data, throwable = false) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        name_shopId: {
          name: data.name,
          shopId: data.shopId,
        },
      },
    });

    if (existingProduct) {
      return handleActionError(
        "Product name already exists in your shop. Please choose a different name or edit the existing product.",
        throwable,
        null
      );
    }

    const newProduct = await prisma.product.create({
      data,
    });

    const shop = await prisma.shop.findUnique({
      where: {
        id: data.shopId,
      },
      include: {
        products: true,
      },
    });

    await updateShopCache(shop);

    return newProduct;
  } catch (error) {
    return handleCaughtActionError(
      "Error in creating product",
      error.message,
      throwable,
      null
    );
  }
}

export async function updateProduct(data, throwable = false) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: data.id,
      },
    });

    if (!product)
      return handleActionError("Product not found.", throwable, null);

    const additionalSoldCount = Math.max(
      0,
      product.stockCount - data.stockCount
    );

    data.soldCount = product.soldCount + additionalSoldCount;
    const updatedProduct = await prisma.product.update({
      where: { id: data.id },
      data,
    });

    if (additionalSoldCount) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const nextDayStart = new Date(todayStart);
      nextDayStart.setDate(todayStart.getDate() + 1);

      await prisma.dailySales.upsert({
        where: {
          productId_date: {
            productId: updatedProduct.id,
            date: todayStart,
          },
        },
        update: {
          soldCount: updatedProduct.soldCount,
        },
        create: {
          productId: updatedProduct.id,
          date: todayStart,
          soldCount: updatedProduct.soldCount,
        },
      });
    }

    const shop = await prisma.shop.findUnique({
      where: {
        id: data.shopId,
      },
      include: {
        products: true,
      },
    });

    await updateShopCache(shop);

    return updatedProduct;
  } catch (error) {
    return handleCaughtActionError(
      "Error in updating product",
      error.message,
      throwable,
      null
    );
  }
}
