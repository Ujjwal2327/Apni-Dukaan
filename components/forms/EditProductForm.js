"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import Spinner from "../Spinner";
import { isSameObject, resolveUrl, sanitizeNumberInput } from "@/utils";
import Image from "next/image";
import { DropdownMenuItem } from "../ui/dropdown-menu";

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Product name must be at least 2 characters." })
    .transform((name) => name.toLowerCase()),
  image: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((image) => (image && image.length ? image : null)) // Transform empty string to null
    .refine((image) => !image || z.string().url().safeParse(image).success, {
      message: "Invalid URL format", // Apply url validation only if image is not null
    }),
  stockCount: z
    .number()
    .int()
    .nonnegative({ message: "Stock count must be a non-negative integer." }),
});

export default function EditProductForm({ shop, product }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: product.name || "",
      image: product.image || null,
      stockCount: product.stockCount || 0,
    },
  });

  async function onSubmit(formdata) {
    if (isSameObject(formdata, form.control._defaultValues))
      return toast.info("No changes detected.");

    const existingProductNames = shop.products.map((product) => product.name);
    if (
      formdata.name != product.name &&
      existingProductNames.includes(formdata.name)
    ) {
      return toast.error(
        "Product name already exists in your shop. Please choose a different name."
      );
    }

    formdata = { ...formdata, shopId: shop.id, id: product.id };
    try {
      setLoading(true);
      const response = await fetch("/api/product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();

      if (data.product) {
        router.push(`/shops/${shop.name}`);
        toast.success("Product updated successfully");
      } else if (data.error) throw new Error(data.error);
    } catch (error) {
      console.log("Error submitting form:", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`p-5 rounded-md space-y-6 bg-primary-foreground flex flex-col w-full ${
          loading ? "loading opacity-50" : ""
        }`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage className="dark:text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stockCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock *</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input
                    type="number"
                    placeholder="Stock Count"
                    {...field}
                    onChange={(e) => {
                      field.onChange(sanitizeNumberInput(e.target.value));
                    }}
                  />
                  <span className="text-sm">
                    {product.metric.toLowerCase()}
                  </span>
                </div>
              </FormControl>
              <FormMessage className="dark:text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Image URL" {...field} />
              </FormControl>
              <FormMessage />
              {resolveUrl(field.value, null) ? (
                <Image
                  src={field.value}
                  alt="Preview"
                  layout="responsive"
                  width={1}
                  height={1}
                  className="rounded-lg"
                />
              ) : (
                <></>
              )}
            </FormItem>
          )}
        />

        <DropdownMenuItem>
          <Button
            type="submit"
            disabled={loading}
            className={`w-full font-bold ${loading && "loading"}`}
            aria-label="register shop name"
          >
            {loading ? (
              <>
                Loading <Spinner className="size-4 ml-2" />
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DropdownMenuItem>
      </form>
    </Form>
  );
}
