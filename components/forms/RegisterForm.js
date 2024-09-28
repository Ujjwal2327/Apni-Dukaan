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

const FormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Shop name must be at least 2 characters." })
    .max(15, { message: "Shop name must be at most 15 characters." })
    .transform((name) => name.toLowerCase()),
});

export default function RegisterForm({ session }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(formdata) {
    const { email } = session.user;
    formdata = { ...formdata, email };

    try {
      setLoading(true);
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });
      const data = await response.json();

      if (data.shop) {
        router.push("/");
        toast.success("Shop created successfully");
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
        className={`w-2/3 p-5 rounded-md space-y-6 bg-primary-foreground flex flex-col max-w-96 ${
          loading && "loading opacity-50"
        }`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="my-store" {...field} />
              </FormControl>
              <FormMessage className="dark:text-red-400" />
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
            "Register"
          )}
        </Button>
      </form>
    </Form>
  );
}
