import { getShopByEmail } from "@/action/shop";
import { auth } from "@/auth";
import AddProjectForm from "@/components/forms/AddProductForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { permanentRedirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import ShopStock from "@/components/shop/ShopStock";

export default async function Shop({ params }) {
  params.shopName = decodeURIComponent(params.shopName);

  const session = await auth();
  const userShop = await getShopByEmail(session?.user?.email);
  if (!userShop?.name) permanentRedirect("/sign-in");
  if (params.shopName !== userShop?.name)
    permanentRedirect(`/shops/${userShop.name}`);

  userShop?.products?.sort((a, b) => {
    if (a.name < b.name) return -1; // a comes before b
    if (a.name > b.name) return 1; // a comes after b
    return 0; // a and b are equal
  });

  return (
    <Tabs defaultValue="stock" className="flex flex-col items-center">
      <TabsList>
        <TabsTrigger value="stock" className="w-32">
          Stock
        </TabsTrigger>
        <TabsTrigger value="add_new" className="w-32">
          Add New
        </TabsTrigger>
      </TabsList>
      <TabsContent value="stock" className="w-full max-w-96">
        <ScrollArea className="h-[calc(100vh-7rem)] rounded-lg px-2">
          <ShopStock shop={userShop} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="add_new" className="w-full max-w-[25rem]">
        <ScrollArea className="h-[calc(100vh-10rem)] rounded-lg px-2">
          <AddProjectForm shop={userShop} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
