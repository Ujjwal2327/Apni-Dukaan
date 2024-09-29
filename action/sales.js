import prisma from "@/lib/db";
import { handleActionError, handleCaughtActionError } from "@/utils";

export async function getSalesMap(salesFilter, productIds, throwable = false) {
  try {
    const today = new Date();
    let startDate;

    switch (salesFilter) {
      case "daily":
        startDate = new Date(today);
        break;
      case "weekly":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        break;
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return handleActionError("Invalid sales filter.", throwable, null);
    }

    // Set the time to the start of the day
    startDate.setHours(0, 0, 0, 0);

    // Fetch sales data from the database
    const salesData = await prisma.dailySales.findMany({
      where: {
        productId: { in: productIds },
        date: {
          gte: startDate,
        },
      },
      select: {
        productId: true,
        soldCount: true,
      },
    });

    // Create a map with productId as the key and soldCount as the value
    const salesMap = salesData.reduce((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.soldCount;
      return acc;
    }, {});

    return salesMap;
  } catch (error) {
    return handleCaughtActionError(
      "Error in fetching sales data",
      error.message,
      throwable,
      null
    );
  }
}
