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
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';


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
  try {
    const newItem: Omit<Item, 'id'> = {
      type: 'lost',
      status: 'open',
      date: new Date().toISOString(),
      imageUrl: itemData.imageDataUri || `https://picsum.photos/400/300?random=${crypto.randomUUID()}`,
      ...itemData,
    };
    
    const collectionRef = collection(db, "lost-items");
    
    await addDoc(collectionRef, newItem)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `lost-items`,
          operation: 'create',
          requestResourceData: newItem,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message, code: error.code };
  }
}

export async function addFoundItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date' | 'imageUrl'>) {
    try {
        const newItem: Omit<Item, 'id'> = {
            type: 'found',
            status: 'open',
            date: new Date().toISOString(),
            imageUrl: itemData.imageDataUri || `https://picsum.photos/400/300?random=${crypto.randomUUID()}`,
            ...itemData,
        };
        
        const collectionRef = collection(db, "found-items");
        
        await addDoc(collectionRef, newItem)
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: `found-items`,
              operation: 'create',
              requestResourceData: newItem,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
          });

        revalidatePath('/');
        revalidatePath('/items');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message, code: error.code };
    }
}

export async function markItemAsReturned(itemId: string) {
  try {
    const itemRef = doc(db, 'lost-items', itemId);
    const updateData = { status: 'returned' };
    
    await updateDoc(itemRef, updateData)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: itemRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message, code: error.code };
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
    const userData = {
      uid: user.uid,
      email: user.email,
      fullName: credentials.fullName,
    };
    
    await setDoc(doc(db, "users", user.uid), userData)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'create',
          requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
      });

    return { success: true, userId: user.uid };
  } catch (error: any) {
    return { success: false, message: error.message, code: error.code };
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
    // This ensures we always return the error code for debugging.
    return { success: false, message: error.message, code: error.code };
  }
}
