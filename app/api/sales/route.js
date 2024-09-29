import { getSalesMap } from "@/action/sales";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const { salesFilter, productIds } = data;
    const salesMap = await getSalesMap(salesFilter, productIds, true);
    return NextResponse.json({ salesMap });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}
