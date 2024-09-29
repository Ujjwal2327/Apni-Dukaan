import { appName } from "@/constants";
import prisma from "@/lib/db";
import { handleRedisOperation, updateShopCache } from "@/lib/redis";
import { handleActionError, handleCaughtActionError } from "@/utils";

export async function getShopByEmail(email, throwable = false) {
  if (!email || !email.trim()) return null;

  try {
    const cacheShop = await handleRedisOperation(
      "get",
      `${appName}-email:${email}`
    );
    if (cacheShop) return JSON.parse(cacheShop);

    const shop = await prisma.shop.findUnique({
      where: {
        email,
      },
      include: {
        products: true,
      },
    });

    if (!shop) return null;

    await updateShopCache(shop);

    return shop;
  } catch (error) {
    return handleCaughtActionError(
      "Error in fetching shop",
      error.message,
      throwable,
      null
    );
  }
}

export async function getShopByName(shopName, throwable = false) {
  if (!shopName || !shopName.trim()) return null;

  try {
    const cacheEmail = await handleRedisOperation(
      "get",
      `${appName}-name:${shopName}`
    );

    const cacheShop = cacheEmail
      ? await handleRedisOperation("get", `${appName}-email:${cacheEmail}`)
      : null;

    if (cacheShop) return JSON.parse(cacheShop);

    const shop = await prisma.shop.findUnique({
      where: {
        name: shopName,
      },
      include: {
        products: true,
      },
    });

    if (!shop) return null;

    await updateShopCache(shop);

    return shop;
  } catch (error) {
    return handleCaughtActionError(
      "Error in fetching shop",
      error.message,
      throwable,
      null
    );
  }
}

export async function createShop(data, throwable = false) {
  try {
    const cacheEmail = await handleRedisOperation(
      "get",
      `${appName}-name:${data.name}`
    );

    const shopExists = cacheEmail
      ? true
      : await prisma.shop.findUnique({
          where: {
            name: data.name,
          },
        });

    if (shopExists) {
      if (!cacheEmail) await updateShopCache(shopExists);
      return handleActionError(
        "Shop name already exists. Please choose a different shop name.",
        throwable,
        null
      );
    }

    const newShop = await prisma.shop.create({
      data,
    });

    if (!newShop)
      return handleActionError(
        "Failed to create shop. Please try again later.",
        throwable,
        null
      );

    await updateShopCache(newShop);

    return newShop;
  } catch (error) {
    return handleCaughtActionError(
      "Error in creating shop",
      error.message,
      throwable,
      null
    );
  }
}

export async function updateShop(data, throwable = false) {
  try {
    const cacheShop = await handleRedisOperation(
      "get",
      `${appName}-email:${data.email}`
    );

    const shop = cacheShop
      ? JSON.parse(cacheShop)
      : await prisma.shop.findUnique({
          where: {
            email: data.email,
          },
          include: {
            products: true,
          },
        });

    if (!shop) return handleActionError("Shop not found.", throwable, null);

    if (shop.name !== data.name) {
      const cacheOtherEmail = await handleRedisOperation(
        "get",
        `${appName}-name:${data.name}`
      );

      const sameShopNameExists =
        cacheOtherEmail ||
        (await prisma.shop.findUnique({
          where: {
            name: data.name,
          },
        }));

      if (sameShopNameExists) {
        if (!cacheOtherEmail) await updateShopCache(sameShopNameExists);
        return handleActionError("Shop name already exists.", throwable, null);
      }
    }

    // Perform the update within a single transaction
    const updatedShop = await prisma.$transaction(
      async (tx) => {
        // Prepare set
        const newProductsSet = new Set(data.products.map((prod) => prod.name));

        // Handle product updates or creates
        const productsToDelete = shop.products.filter(
          (product) => !newProductsSet.has(product.name)
        );
        if (productsToDelete.length > 0) {
          await tx.product.deleteMany({
            where: {
              id: { in: productsToDelete.map((product) => product.id) },
            },
          });
        }

        const upsertProductPromises = data.products.map((product) =>
          tx.product.upsert({
            where: { shopId_name: { shopId: shop.id, name: product.name } },
            update: product,
            create: { ...product, shopId: shop.id },
          })
        );

        // Perform all upserts in parallel
        await Promise.all(upsertProductPromises);

        // Update the shop record
        return tx.shop.update({
          where: { email: data.email },
          data: {
            name: data.name,
          },
          include: { products: true },
        });
      },
      {
        maxWait: 5000, // Wait up to 5 seconds for a connection
        timeout: 20000, // Abort the transaction if it takes more than 20 seconds
      }
    );

    if (!updatedShop)
      return handleActionError("Failed to update shop.", throwable, null);

    await updateShopCache(updatedShop, shop.name);

    return updatedShop;
  } catch (error) {
    return handleCaughtActionError(
      "Error in updating shop",
      error.message,
      throwable,
      null
    );
  }
}
