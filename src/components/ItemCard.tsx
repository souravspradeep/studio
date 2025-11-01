
'use client';

import type { Item } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Clock, MapPin, CheckSquare, Info, Award, Mail, Phone, User, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/lib/firebase-actions';
import { findSimilarItems } from '@/ai/flows/find-similar-items-flow';

function SmallItemCard({ item }: { item: Item }) {
  const imageUrl = item.imageDataUri || item.imageUrl;
  return (
    <Card className="flex items-center gap-4 p-3">
       {imageUrl && (
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint={item.aiHint}
              />
            </div>
          )}
      <div className='overflow-hidden'>
        <h4 className="font-semibold truncate">{item.name}</h4>
        <p className="text-sm text-muted-foreground truncate">{item.location}</p>
      </div>
    </Card>
  )
}

export function ItemCard({ item }: { item: Item }) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isFindingSimilar, setIsFindingSimilar] = useState(false);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);

  const allFoundItemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'foundItems'),
      orderBy('date', 'desc')
    );
  }, [firestore]);

  const { data: foundItems } = useCollection<Item>(allFoundItemsQuery);

  const handleMarkAsReturned = async () => {
    if (!firestore || !item.id) return;
    setIsSubmitting(true);
    try {
      const itemRef = doc(firestore, 'lostItems', item.id);
      await updateDocumentNonBlocking(itemRef, { status: 'returned' });
      toast({
        title: 'Item Marked as Returned',
        description: 'Thank you for updating the status.',
      });
      setIsDialogOpen(false); // Close the main dialog
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFindSimilar = async () => {
    if (!foundItems || foundItems.length === 0) {
      toast({ title: 'No found items to search.' });
      return;
    }
    setIsFindingSimilar(true);
    setSimilarItems([]);
    try {
      const result = await findSimilarItems({
        sourceItem: {
          name: item.name,
          description: item.description,
          category: item.category,
        },
        searchItems: foundItems.map(i => ({ id: i.id, name: i.name, description: i.description, category: i.category })),
      });
      
      const matchedItems = foundItems.filter(i => result.similarItemIds.includes(i.id));
      setSimilarItems(matchedItems);

      if (matchedItems.length === 0) {
        toast({ title: "No similar items found." });
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Error finding similar items.", variant: "destructive" });
    } finally {
      setIsFindingSimilar(false);
    }
  }
  
  const isOwner = user && user.uid === item.ownerId;
  const imageUrl = item.imageDataUri || item.imageUrl;
  
  // Convert Firestore Timestamp to Date if necessary
  const date = item.date instanceof Date 
    ? item.date 
    : (item.date as any)?.toDate ? (item.date as any).toDate() : new Date();
    
  const showContactEmail = item.userName !== item.userContact;

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) {
        setSimilarItems([]);
        setIsFindingSimilar(false);
      }
    }}>
      <DialogTrigger asChild>
        <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl cursor-pointer">
          {imageUrl && (
            <div className="relative w-full h-40">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint={item.aiHint}
              />
              <Badge
                className="absolute top-2 right-2"
                variant={
                  item.status === 'returned'
                    ? 'default'
                    : item.type === 'lost'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {item.status === 'returned'
                  ? 'Returned'
                  : item.type === 'lost'
                  ? 'Lost'
                  : 'Found'}
              </Badge>
            </div>
          )}
          <CardContent className="p-4 flex flex-col flex-grow">
            {!imageUrl && (
              <Badge
                className="self-end"
                variant={
                  item.status === 'returned'
                    ? 'default'
                    : item.type === 'lost'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {item.status === 'returned'
                  ? 'Returned'
                  : item.type === 'lost'
                  ? 'Lost'
                  : 'Found'}
              </Badge>
            )}
            <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
              {item.description}
            </p>
            <div className="flex items-center text-xs text-muted-foreground mt-3">
              <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>
                {item.type === 'lost' ? 'Lost on' : 'Found on'}{' '}
                {date.toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <div className="pt-2">
            <Badge
              variant={
                item.status === 'returned'
                  ? 'default'
                  : item.type === 'lost'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {item.status === 'returned'
                ? 'Returned'
                : item.type === 'lost'
                ? 'Lost'
                : 'Found'}
            </Badge>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          {imageUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image src={imageUrl} alt={item.name} fill className="object-cover" />
            </div>
          )}
          <p>{item.description}</p>
          <div>
            <h4 className="font-semibold">
              {item.type === 'lost' ? 'Last Known Location' : 'Location Found'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-muted-foreground">{item.location}</p>
            </div>
          </div>

          {item.type === 'found' && (
            <div>
              <h4 className="font-semibold">Status</h4>
              <div className="flex items-center gap-2 mt-1">
                {item.submittedToOffice ? (
                  <>
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    <p className="text-muted-foreground">Submitted to Student Welfare Office</p>
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <p className="text-muted-foreground">With finder</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold">Contact {item.type === 'lost' ? 'Owner' : 'Finder'}</h4>
             <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground">{item.userName}</p>
             </div>
            {showContactEmail && (
              <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${item.userContact}`} className="underline">
                      {item.userContact}
                  </a>
              </div>
            )}
             {item.mobileNumber && (
                <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${item.mobileNumber}`} className="underline">
                        {item.mobileNumber}
                    </a>
                </div>
             )}
          </div>
          
          {item.type === 'lost' && item.status === 'open' && (
             <div className="pt-4">
              <Button onClick={handleFindSimilar} disabled={isFindingSimilar} className="w-full">
                {isFindingSimilar ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                {isFindingSimilar ? "Searching..." : "Find Similar Found Items"}
              </Button>
            </div>
          )}

          {isFindingSimilar && (
            <div className="text-center">
              <Loader2 className="animate-spin inline-block" />
              <p className="text-muted-foreground">Searching for matches...</p>
            </div>
          )}
          
          {similarItems.length > 0 && (
            <div className="space-y-2 pt-4">
              <h4 className="font-semibold">Potential Matches Found by AI</h4>
              <div className="space-y-2">
                {similarItems.map(similarItem => (
                  <ItemCard key={similarItem.id} item={{...similarItem, type: 'found'}} />
                ))}
              </div>
            </div>
          )}

        </div>
        <DialogFooter>
          {item.type === 'lost' && item.status === 'open' && isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">
                  <Award className="mr-2" /> Mark as Returned
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Item Return</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you have received this item? This action cannot be undone and will
                    mark the item as returned.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleMarkAsReturned} disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Yes, I have it!'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
