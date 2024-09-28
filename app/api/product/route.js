import { createProduct } from "@/action/product";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const product = await createProduct(data, true);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}
