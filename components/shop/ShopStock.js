"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ellipsis, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProductForm from "@/components/forms/EditProductForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useCallback } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function ShopStock({ shop }) {
  const [loading, setLoading] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(shop.products);
  const [query, setQuery] = useState("");
  const [salesFilter, setSalesFilter] = useState("total");
  const [salesMap, setSalesMap] = useState(null);

  useEffect(() => {
    const fetchSalesMap = async (salesFilter) => {
      console.log("salesFilter", salesFilter);
      if (salesFilter === "total") {
        const totalSalesMap = shop.products.reduce((acc, product) => {
          acc[product.id] = product.soldCount;
          return acc;
        }, {});
        setSalesMap(totalSalesMap);
        return;
      }

      try {
        setLoading(true);
        const productIds = shop.products.map((product) => product.id);
        const response = await fetch("/api/sales", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salesFilter,
            productIds,
          }),
        });
        const data = await response.json();

        if (data.salesMap) {
          console.log("SALESMAP", data.salesMap);
          setSalesMap(data.salesMap);
          toast.success("Filter added successfully");
        } else if (data.error) throw new Error(data.error);
      } catch (error) {
        console.log("Error submitting form:", error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (shop?.products?.length && salesFilter) fetchSalesMap(salesFilter);
  }, [salesFilter, shop]);

  function handleQueryChange(e) {
    const val = e.target.value.toLowerCase();

    if (!val || !val.length) setFilteredProducts(shop.products);
    else
      setFilteredProducts(
        shop.products.filter((prod) => prod.name.toLowerCase().includes(val))
      );
    setQuery(e.target.value);
  }

  function handleQueryReset() {
    setFilteredProducts(shop.products);
    setQuery("");
  }

  return (
    <div className="flex flex-col gap-4 mt-2">
      {shop?.products?.length ? (
        <>
          <Select value={salesFilter} onValueChange={setSalesFilter}>
            <SelectTrigger className="w-[180px] mx-auto">
              <SelectValue placeholder="Select Sales Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Select Sales Filter</SelectLabel>
                <SelectItem value="total">Total Sales</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex justify-between items-center w-full">
            <Input
              name="query"
              value={query}
              onChange={handleQueryChange}
              className="w-[90%] ml-1"
            />
            {query.length ? (
              <X
                className="cursor-pointer m-0 p-0"
                onClick={handleQueryReset}
              />
            ) : (
              <></>
            )}
          </div>
        </>
      ) : (
        <></>
      )}
      <div>
        {filteredProducts?.length ? (
          filteredProducts.map((product) => (
            <div
              key={product.name}
              className="flex justify-between p-2 hover:bg-secondary hover:cursor-pointer"
            >
              <div>{product.name}</div>
              <div className="flex gap-5 items-center text-xs">
                <div>
                  {salesMap?.[product.id] || 0} | {product.stockCount}{" "}
                  {product.metric.toLowerCase()}
                </div>
                <DropdownMenu className="text-xs w-20">
                  <DropdownMenuTrigger>
                    <Ellipsis size={15} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="text-xs w-14 h-6">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit product</DialogTitle>
                          <DialogDescription>
                            Make changes to your product here. Click save when
                            you are done.
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[calc(100vh-15rem)] rounded-lg px-2 py-0">
                          <EditProductForm shop={shop} product={product} />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">No Product Found</div>
        )}
      </div>
    </div>
  );
}
