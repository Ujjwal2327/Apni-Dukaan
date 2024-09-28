import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Shop({ params }) {
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
      <TabsContent value="stock">Stock Content Here</TabsContent>
      <TabsContent value="add_new">Add New Content Here</TabsContent>
    </Tabs>
  );
}
