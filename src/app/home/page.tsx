
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle, FileText, FileQuestion, FilePlus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { ItemCard } from '@/components/ItemCard';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function Home() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const lostItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'lostItems'), 
        orderBy('date', 'desc')
    );
  }, [firestore]);

  const returnedItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'lostItems'), 
        where('status', '==', 'returned')
    );
  }, [firestore]);

  const { data: allLostItems, isLoading: isLoadingLostItems } = useCollection<Item>(lostItemsQuery);
  const { data: returnedItems, isLoading: isLoadingReturned } = useCollection<Item>(returnedItemsQuery);

  const isLoading = isUserLoading || isLoadingLostItems || isLoadingReturned;

  const activeLostItems = allLostItems?.filter(item => item.status === 'open') || [];
  const itemsReturned = returnedItems?.length || 0;
  const activePosts = activeLostItems.length;
  
  const recentLostItems = activeLostItems.slice(0, 4);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="relative w-full max-w-5xl bg-gradient-to-r from-blue-500 to-yellow-400 rounded-2xl p-8 md:p-12 text-white overflow-hidden mb-12">
        <div className="absolute inset-0 bg-black/20 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Lost Something? Found Something?
          </h1>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">We'll Help You!</h2>
          <p className="text-lg md:text-xl text-blue-100 max-w-lg mb-8">
            Connect, share, and help each other find what matters on campus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-white/90 text-primary hover:bg-white">
              <Link href="/lost-item">
                <FileQuestion className="mr-2" /> I lost something
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/found-item">
                <FilePlus className="mr-2" /> I found something
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-16">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground">Active Posts</p>
              <p className="text-4xl font-bold">{isLoading ? '...' : activePosts}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="text-primary" size={28}/>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-muted-foreground">Items Returned</p>
              <p className="text-4xl font-bold">{isLoading ? '...' : itemsReturned}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="text-green-600" size={28}/>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Recently Lost Items</h2>
        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Card key={i} className="h-[250px] animate-pulse bg-muted"></Card>)}
            </div>
        ) : recentLostItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentLostItems.map((item) => (
              <ItemCard key={item.id} item={{...item, type: 'lost'}} />
            ))}
          </div>
        ) : (
          !isUserLoading && !allLostItems && (
            <Alert variant="destructive" className="mb-8">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>Could not fetch items</AlertTitle>
                <AlertDescription>
                  There was a problem fetching items. This is likely due to Firestore security rules.
                </AlertDescription>
            </Alert>
          )
        )}
         { !isLoading && recentLostItems.length === 0 && (
          <p className="text-center text-muted-foreground py-16">No lost items have been reported yet.</p>
        )}
      </div>

    </div>
  );
}
