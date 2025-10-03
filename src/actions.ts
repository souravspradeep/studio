
'use server';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import type { Item, UserCredentials } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import lostItemsData from '../data/lost-items.json';
import foundItemsData from '../data/found-items.json';


export async function getLostItems(): Promise<Item[]> {
    // This now reads from the local JSON file
    const items: Item[] = lostItemsData as Item[];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getFoundItems(): Promise<Item[]> {
    // This now reads from the local JSON file
    const items: Item[] = foundItemsData as Item[];
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addLostItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
  const collectionRef = collection(db, "lost-items");
  const newItem: Omit<Item, 'id'> = {
    type: 'lost',
    status: 'open',
    date: new Date().toISOString(),
    ...itemData,
  };
  
  return addDoc(collectionRef, newItem)
    .then(() => {
        revalidatePath('/');
        revalidatePath('/items');
        return { success: true };
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `lost-items`,
        operation: 'create',
        requestResourceData: newItem,
      });
      errorEmitter.emit('permission-error', permissionError);
      return { success: false, message: 'Permission denied', code: serverError.code };
    });
}

export async function addFoundItem(itemData: Omit<Item, 'id' | 'type' | 'status' | 'date'>) {
  const collectionRef = collection(db, "found-items");
  const newItem: Omit<Item, 'id'> = {
    type: 'found',
    status: 'open',
    date: new Date().toISOString(),
    ...itemData,
  };
  
  return addDoc(collectionRef, newItem)
    .then(() => {
        revalidatePath('/');
        revalidatePath('/items');
        return { success: true };
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `found-items`,
        operation: 'create',
        requestResourceData: newItem,
      });
      errorEmitter.emit('permission-error', permissionError);
      return { success: false, message: 'Permission denied', code: serverError.code };
    });
}

export async function markItemAsReturned(itemId: string) {
  const itemRef = doc(db, 'lost-items', itemId);
  const updateData = { status: 'returned' };

  return updateDoc(itemRef, updateData)
    .then(() => {
        revalidatePath('/');
        revalidatePath('/items');
        return { success: true };
    }).catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: itemRef.path,
        operation: 'update',
        requestResourceData: updateData,
      });
      errorEmitter.emit('permission-error', permissionError);
      return { success: false, message: 'Permission denied', code: serverError.code };
    });
}

export async function signUpWithEmail(credentials: UserCredentials) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const user = userCredential.user;
    
    // Update the Firebase Auth user profile
    await updateProfile(user, { displayName: credentials.fullName });

    // Create a document in the 'users' collection
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
    if (error instanceof FirestorePermissionError) {
      // It's already been emitted, just return failure
      return { success: false, message: error.message, code: 'permission-denied' };
    }
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
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, message: error.message, code: error.code };
  }
}
