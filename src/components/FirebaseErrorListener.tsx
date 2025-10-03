'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { type SecurityRuleContext } from '@/lib/errors';
import { useAuth } from './AuthProvider';

// This is a client component that listens for Firestore permission errors
// and displays a toast notification with the detailed error context.
// It is intended for use in development environments to help debug security rules.

export function FirebaseErrorListener() {
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const handleError = (context: SecurityRuleContext) => {
      console.error(
        'Firestore Permission Error:',
        `A Firestore request was denied. See the Next.js error overlay for details.`
      );
      
      // Throw an error that will be caught by Next.js's development error overlay.
      // This provides a much better debugging experience than a simple console.log.
      const contextualError = new Error(
        `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n\n${JSON.stringify(
          {
            auth: user ? { uid: user.uid, token: { email: user.email } } : null,
            ...context,
          },
          null,
          2
        )}`
      );
      
      // We throw the error in a timeout to break out of the current call stack.
      // This ensures that it's picked up by the global error handler and displayed
      // in the Next.js overlay, rather than just crashing the local component.
      setTimeout(() => {
        throw contextualError;
      }, 0);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast, user]);

  return null; // This component does not render anything
}
