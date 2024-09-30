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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import Spinner from "../Spinner";
import { ProductMetric } from "@/constants";
import { resolveUrl, sanitizeNumberInput } from "@/utils";
import Image from "next/image";
import Link from "next/link";

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Product name must be at least 2 characters." }),
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
  metric: z.enum([ProductMetric.KG, ProductMetric.PIECE, ProductMetric.DOZEN]),
});

export default function AddProductForm({ shop }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      image: null,
      stockCount: 0,
      metric: ProductMetric.KG,
    },
  });

  async function onSubmit(formdata) {
    const existingProductNames = shop.products?.map((product) => product.name);
    if (existingProductNames?.includes(formdata.name)) {
      return toast.error(
        "Product name already exists in your shop. Please choose a different name or edit the existing product."
      );
    }

    formdata = { ...formdata, shopId: shop.id };
    try {
      setLoading(true);
      const response = await fetch("/api/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();

      if (data.product) {
        window.location.reload();
        formdata = { ...form.control._defaultValues };
        toast.success("Product created successfully");
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
                <Input
                  type="number"
                  placeholder="Stock Count"
                  {...field}
                  onChange={(e) => {
                    field.onChange(sanitizeNumberInput(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage className="dark:text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metric"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metric *</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductMetric.DOZEN}>dozen</SelectItem>
                    <SelectItem value={ProductMetric.KG}>kg</SelectItem>
                    <SelectItem value={ProductMetric.PIECE}>piece</SelectItem>
                  </SelectContent>
                </Select>
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
              <FormLabel>
                Image URL{" "}
                <Link
                  href="https://postimages.org/"
                  target="_blank"
                  className="text-blue-300 text-xs"
                >
                  (Upload & Use Direct link)
                </Link>
              </FormLabel>
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
            "Add Product"
          )}
        </Button>
      </form>
    </Form>
  );
}
