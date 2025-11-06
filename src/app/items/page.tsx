
'use client';

import { ItemCard } from '@/components/ItemCard';
import { ListFilter, Search, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useMemo } from 'react';

export default function ItemsPage() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const allLostItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'lostItems'),
      orderBy('date', 'desc')
    );
  }, [firestore]);

  const allFoundItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'foundItems'),
      orderBy('date', 'desc')
    );
  }, [firestore]);

  const { data: allLostItems, isLoading: isLoadingLost, error: lostError } = useCollection<Item>(allLostItemsQuery);
  const { data: foundItems, isLoading: isLoadingFound, error: foundError } = useCollection<Item>(allFoundItemsQuery);

  const openLostItems = useMemo(() => {
    return allLostItems?.filter(item => item.status === 'open');
  }, [allLostItems]);

  const returnedItems = useMemo(() => {
    return allLostItems?.filter(item => item.status === 'returned');
  }, [allLostItems]);

  const renderItems = (items: Item[] | null | undefined, itemType: 'lost' | 'found', isLoadingData: boolean, error: Error | null, emptyMessage: string) => {
    const isLoading = isUserLoading || isLoadingData;
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <Card key={i} className="h-[250px] animate-pulse bg-muted"></Card>)}
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="mb-8">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Could not fetch items</AlertTitle>
            <AlertDescription>
                There was a problem fetching items. This is likely due to Firestore security rules.
            </AlertDescription>
        </Alert>
      )
    }
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground py-16">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <ItemCard key={item.id} item={{...item, type: itemType}} />
        ))}
      </div>
    );
  };

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
          </div>
        </div>
        <TabsContent value="lost-items">
          {renderItems(openLostItems, 'lost', isLoadingLost, lostError, 'No active lost items have been reported.')}
        </TabsContent>
        <TabsContent value="found-items">
          {renderItems(foundItems, 'found', isLoadingFound, foundError, 'No found items have been reported yet.')}
        </TabsContent>
        <TabsContent value="returned-items">
          {renderItems(returnedItems, 'lost', isLoadingLost, lostError, 'No items have been marked as returned yet.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
