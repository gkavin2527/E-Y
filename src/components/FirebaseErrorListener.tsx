
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a placeholder component and does not need to throw errors.
// It subscribes to the error emitter to demonstrate the pattern, but
// in this simplified auth flow, direct try/catch in components is sufficient.
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: any) => {
      // In a more complex app, you might have a global toast or logging service here.
      // For now, we log it to the console. The component throwing the error
      // is responsible for showing a user-facing message.
      console.error("A global Firebase error was caught:", error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}
