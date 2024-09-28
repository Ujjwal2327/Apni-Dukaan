import { createShop, getShopByEmail, updateShop } from "@/action/shop";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const shop = await createShop(data, true);
    return NextResponse.json({ shop });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const shop = await getShopByEmail(email, true);
    return NextResponse.json({ shop });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const shop = await updateShop(data, true);
    return NextResponse.json({ shop });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}
