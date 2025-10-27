
'use server';

import type { Item, UserCredentials } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
import { initializeFirebase } from '@/lib/firebase';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

initializeFirebase();

const lostItemsPath = path.join(process.cwd(), 'data/lost-items.json');
const foundItemsPath = path.join(process.cwd(), 'data/found-items.json');

async function readItems(filePath: string): Promise<Item[]> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function writeItems(filePath: string, items: Item[]) {
    await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
}


export async function getLostItems(): Promise<Item[]> {
    const items = await readItems(lostItemsPath);
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getFoundItems(): Promise<Item[]> {
    const items = await readItems(foundItemsPath);
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addLostItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
    const items = await readItems(lostItemsPath);
    const newItem: Item = {
        id: new Date().getTime().toString(),
        type: 'lost',
        status: 'open',
        date: new Date().toISOString(),
        ...itemData,
    };
    
    items.push(newItem);
    await writeItems(lostItemsPath, items);

    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}

export async function addFoundItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
    const items = await readItems(foundItemsPath);
    const newItem: Item = {
        id: new Date().getTime().toString(),
        type: 'found',
        status: 'open',
        date: new Date().toISOString(),
        ...itemData,
    };
    
    items.push(newItem);
    await writeItems(foundItemsPath, items);

    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}

export async function markItemAsReturned(itemId: string) {
    const lostItems = await readItems(lostItemsPath);
    const foundItems = await readItems(foundItemsPath);

    const itemInLost = lostItems.find(item => item.id === itemId);
    
    if (itemInLost) {
        itemInLost.status = 'returned';
        await writeItems(lostItemsPath, lostItems);
    } else {
        const itemInFound = foundItems.find(item => item.id === itemId);
        if (itemInFound) {
            itemInFound.status = 'returned';
            await writeItems(foundItemsPath, foundItems);
        }
    }

    revalidatePath('/');
    revalidatePath('/items');
    return { success: true };
}


export async function signUpWithEmail(credentials: UserCredentials) {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
    const user = userCredential.user;

    const db = getFirestore();
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
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
