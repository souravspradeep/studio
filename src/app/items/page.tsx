
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
import { useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ItemsPageContent() {
  const firestore = useFirestore();
  const { isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'lost-items';

  const handleTabChange = (value: string) => {
    router.push(`/items?tab=${value}`, { scroll: false });
  };


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
  const { data: allFoundItems, isLoading: isLoadingFound, error: foundError } = useCollection<Item>(allFoundItemsQuery);

  const filteredItems = useMemo(() => {
    const applyFilters = (items: Item[] | null | undefined) => {
      if (!items) return [];
      return items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = searchTerm === '' ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    };

    return {
      openLost: applyFilters(allLostItems?.filter(item => item.status === 'open')),
      returned: applyFilters(allLostItems?.filter(item => item.status === 'returned')),
      found: applyFilters(allFoundItems?.filter(item => item.status === 'open')),
      resolved: applyFilters(allFoundItems?.filter(item => item.status === 'resolved')),
    };
  }, [allLostItems, allFoundItems, searchTerm, selectedCategory]);

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
  
  const allReturnedItems = useMemo(() => {
    return [...(filteredItems.returned || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },[filteredItems.returned]);

  const allResolvedItems = useMemo(() => {
    return [...(filteredItems.resolved || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },[filteredItems.resolved]);


  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <TabsList>
            <TabsTrigger value="lost-items">Lost Items</TabsTrigger>
            <TabsTrigger value="found-items">Found Items</TabsTrigger>
            <TabsTrigger value="returned-items">Returned Items</TabsTrigger>
            <TabsTrigger value="resolved-items">Resolved Items</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="wallets">Wallets</SelectItem>
                <SelectItem value="keys">Keys</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="lost-items">
          {renderItems(filteredItems.openLost, 'lost', isLoadingLost, lostError, 'No active lost items match your filters.')}
        </TabsContent>
        <TabsContent value="found-items">
          {renderItems(filteredItems.found, 'found', isLoadingFound, foundError, 'No open found items match your filters.')}
        </TabsContent>
        <TabsContent value="returned-items">
          {renderItems(allReturnedItems, 'lost', isLoadingLost, lostError, 'No returned items match your filters.')}
        </TabsContent>
         <TabsContent value="resolved-items">
          {renderItems(allResolvedItems, 'found', isLoadingFound, foundError, 'No resolved items match your filters.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}


export default function ItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ItemsPageContent />
    </Suspense>
  )
}
