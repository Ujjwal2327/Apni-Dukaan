import { ProductActionType } from "@/constants";
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

    await prisma.productHistory.create({
      data: {
        productId: newProduct.id,
        stockCount: newProduct.stockCount,
        soldCount: newProduct.soldCount,
        actionType: ProductActionType.RESTOCK,
      },
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
