
'use client';

import type { Item } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Clock, MapPin, CheckSquare, Info, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { markItemAsReturned } from '@/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

export function ItemCard({ item }: { item: Item }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMarkAsReturned = async () => {
    setIsSubmitting(true);
    try {
      const result = await markItemAsReturned(item.id);
      if (result.success) {
        toast({
          title: 'Item Marked as Returned',
          description: 'Thank you for updating the status.',
        });
        setIsDialogOpen(false); // Close the main dialog
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update item status.',
          variant: 'destructive',
        });
      }
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
  
  const isOwner = user && user.uid === item.ownerId;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Card className="flex flex-col overflow-hidden h-full shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl cursor-pointer">
          <div className="relative w-full h-40">
            <Image
              src={item.imageUrl}
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
          <CardContent className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-lg mb-1 truncate">{item.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
              {item.description}
            </p>
            <div className="flex items-center text-xs text-muted-foreground mt-3">
              <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>
                {item.type === 'lost' ? 'Lost on' : 'Found on'}{' '}
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
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
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          </div>
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
            <h4 className="font-semibold">Contact</h4>
            <p className="text-muted-foreground">
              Contact <span className="font-medium text-primary">{item.userName}</span> at{' '}
              <a href={`mailto:${item.userContact}`} className="underline">
                {item.userContact}
              </a>
              .
            </p>
          </div>
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
