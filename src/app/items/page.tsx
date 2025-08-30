
import { ItemCard } from '@/components/ItemCard';
import { getFoundItems, getLostItems } from '@/app/actions';
import { ListFilter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function ItemsPage() {
  const lostItems = await getLostItems();
  const foundItems = await getFoundItems();
  const returnedItems = lostItems.filter(item => item.status === 'returned');

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="lost-items">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <TabsList>
            <TabsTrigger value="lost-items">Lost Items</TabsTrigger>
            <TabsTrigger value="found-items">Found Items</TabsTrigger>
            <TabsTrigger value="returned-items">Returned</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-9" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="wallets">Wallets</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="books">Books</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost">
              <ListFilter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <TabsContent value="lost-items">
          {lostItems.filter(item => item.status === 'open').length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lostItems.filter(item => item.status === 'open').map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">No active lost items have been reported.</p>
          )}
        </TabsContent>
        <TabsContent value="found-items">
          {foundItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foundItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">No found items have been reported yet.</p>
          )}
        </TabsContent>
        <TabsContent value="returned-items">
          {returnedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {returnedItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">No items have been marked as returned yet.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
