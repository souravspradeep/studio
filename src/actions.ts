
'use server';

import type { Item, UserCredentials } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, addDoc, doc, setDoc, updateDoc, Timestamp, query, where, orderBy, getDoc } from 'firebase/firestore';

async function getItems(itemType: 'lost' | 'found'): Promise<Item[]> {
    const itemsCollection = collection(db, 'items');
    const q = query(itemsCollection, where('type', '==', itemType), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const items: Item[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
        } as Item);
    });
    return items;
}

export async function getLostItems(): Promise<Item[]> {
    return getItems('lost');
}

export async function getFoundItems(): Promise<Item[]> {
    return getItems('found');
}

export async function addLostItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
    const newItem = {
        ...itemData,
        type: 'lost' as const,
        status: 'open' as const,
        date: new Date(),
    };
    await addDoc(collection(db, 'items'), newItem);
    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}

export async function addFoundItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
     const newItem = {
        ...itemData,
        type: 'found' as const,
        status: 'open' as const,
        date: new Date(),
    };
    await addDoc(collection(db, 'items'), newItem);
    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}

export async function markItemAsReturned(itemId: string) {
    const itemRef = doc(db, 'items', itemId);
    await updateDoc(itemRef, {
        status: 'returned',
    });
    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}

export async function signUpWithEmail(credentials: UserCredentials) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      fullName: credentials.fullName,
      email: user.email,
    });

    return { success: true, userId: user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signInWithEmail(credentials: Omit<UserCredentials, 'fullName'>) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
