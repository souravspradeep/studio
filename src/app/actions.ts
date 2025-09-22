
'use server';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import type { Item, UserCredentials } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { matchItems, MatchItemsInput } from '@/ai/flows/match-items';

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

export async function addLostItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date' | 'imageUrl'> & { ownerId: string }) {
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
    const docRef = await addDoc(collection(db, "found-items"
), newItem);
    
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

export async function runMatchItems(lostItemId: string, foundItemId: string) {
    try {
        const lostItemRef = doc(db, 'lost-items', lostItemId);
        const foundItemRef = doc(db, 'found-items', foundItemId);

        const lostItemSnap = await getDoc(lostItemRef);
        const foundItemSnap = await getDoc(foundItemRef);

        if (!lostItemSnap.exists() || !foundItemSnap.exists()) {
            throw new Error('One or both items not found');
        }

        const lostItem = lostItemSnap.data() as Item;
        const foundItem = foundItemSnap.data() as Item;

        const input: MatchItemsInput = {
            lostItemDescription: lostItem.description,
            lostItemPhotoDataUri: lostItem.imageDataUri,
            foundItemDescription: foundItem.description,
            foundItemPhotoDataUri: foundItem.imageDataUri,
        };

        const result = await matchItems(input);
        return result;

    } catch (error: any) {
        console.error('Error in runMatchItems:', error);
        return {
            matchProbability: 0,
            reasoning: `An error occurred: ${error.message}`
        };
    }
}


export async function signUpWithEmail(credentials: UserCredentials) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;

    // Now, store the user's full name and email in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      fullName: credentials.fullName,
    });

    return { success: true, userId: user.uid };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function signInWithEmail(credentials: UserCredentials) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );
    return { success: true, userId: userCredential.user.uid, code: 'success' };
  } catch (error: any) {
    return { success: false, message: error.message, code: error.code };
  }
}
