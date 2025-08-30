'use server';

import { matchItems, MatchItemsInput } from '@/ai/flows/match-items';
import type { Item } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, updateDoc, doc } from 'firebase/firestore';


async function getItems(collectionName: string): Promise<Item[]> {
  const q = query(collection(db, collectionName));
  const querySnapshot = await getDocs(q);
  const items: Item[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    items.push({
        id: doc.id,
        ...data
    } as Item);
  });
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export async function getLostItems(): Promise<Item[]> {
    return getItems('lost-items');
}

export async function getFoundItems(): Promise<Item[]> {
    return getItems('found-items');
}

export async function runMatchItems(lostItemId: string, foundItemId: string) {
  const lostItems = await getLostItems();
  const foundItems = await getFoundItems();
  const lostItem = lostItems.find((item) => item.id === lostItemId);
  const foundItem = foundItems.find((item) => item.id === foundItemId);

  if (!lostItem || !foundItem) {
    throw new Error('Item not found');
  }

  const input: MatchItemsInput = {
    lostItemDescription: lostItem.description,
    lostItemPhotoDataUri: lostItem.imageDataUri,
    foundItemDescription: foundItem.description,
    foundItemPhotoDataUri: foundItem.imageDataUri,
  };

  try {
    const result = await matchItems(input);
    return result;
  } catch (error) {
    console.error('Error running matchItems flow:', error);
    return {
      matchProbability: 0,
      reasoning: 'An error occurred while trying to match the items. Please try again.',
    };
  }
}

export async function addLostItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date' | 'imageUrl'>) {
    const newItem: Omit<Item, 'id'> = {
        type: 'lost',
        status: 'open',
        date: new Date().toISOString(),
        imageUrl: itemData.imageDataUri || `https://picsum.photos/400/300?random=${crypto.randomUUID()}`,
        ...itemData,
    };
    const docRef = await addDoc(collection(db, "lost-items"), newItem);

    revalidatePath('/');
    revalidatePath('/items');
    revalidatePath('/lost-item');
    return { success: true, item: { id: docRef.id, ...newItem } };
}

export async function addFoundItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date' | 'imageUrl'>) {
    const newItem: Omit<Item, 'id'> = {
        type: 'found',
        status: 'open',
        date: new Date().toISOString(),
        imageUrl: itemData.imageDataUri || `https://picsum.photos/400/300?random=${crypto.randomUUID()}`,
        ...itemData,
    };
    const docRef = await addDoc(collection(db, "found-items"), newItem);
    
    revalidatePath('/');
    revalidatePath('/items');
    revalidatePath('/found-item');
    return { success: true, item: { id: docRef.id, ...newItem } };
}

export async function markItemAsReturned(itemId: string) {
    const itemRef = doc(db, 'lost-items', itemId);
    
    try {
        await updateDoc(itemRef, {
            status: 'returned'
        });

        revalidatePath('/');
        revalidatePath('/items');

        return { success: true };
    } catch(error) {
        console.error("Error updating document: ", error);
        return { success: false, message: 'Failed to update item status.' };
    }
}
