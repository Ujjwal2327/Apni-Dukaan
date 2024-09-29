import { createProduct, updateProduct } from "@/action/product";
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

export async function PUT(request) {
  try {
    const data = await request.json();
    const product = await updateProduct(data, true);
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({
      error:
        error.message ||
        "An unexpected error occurred. Please try again later.",
    });
  }
}
