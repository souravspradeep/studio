
'use server';

import type { Item, UserCredentials } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';

// Define paths to the JSON files
const lostItemsPath = path.join(process.cwd(), 'data/lost-items.json');
const foundItemsPath = path.join(process.cwd(), 'data/found-items.json');

async function readItems(filePath: string): Promise<Item[]> {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
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
        id: new Date().getTime().toString(), // Simple unique ID
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
        id: new Date().getTime().toString(), // Simple unique ID
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
        // Although the UI flow makes this unlikely, we check found items too.
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

// Mock auth functions
export async function signUpWithEmail(credentials: UserCredentials) {
  console.log('Mock sign up with:', credentials.email);
  return { success: true, userId: 'mock-user-id' };
}

export async function signInWithEmail(credentials: UserCredentials) {
  console.log('Mock sign in with:', credentials.email);
  return { success: true, userId: 'mock-user-id' };
}
