
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const adminDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );
  
  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  const isLoading = isUserLoading || isAdminDocLoading;

  useEffect(() => {
    // Wait until all loading is complete before running any redirection logic
    if (isLoading) {
      return;
    }

    // If loading is done and there's no user, redirect to login.
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    
    // If loading is done, we have a user, but they are not in the admins collection.
    if (!adminDoc) {
      router.replace('/'); // Redirect to home page if not an admin
    }
  }, [user, adminDoc, isLoading, router]);

  // While loading, or if the checks haven't completed, show a loading state.
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="p-8 space-y-4">
                <h2 className="text-2xl font-semibold">Verifying Admin Access...</h2>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
  }

  // If loading is complete and the user is a verified admin (adminDoc exists), render the children.
  // The useEffect above handles the redirection for non-admins.
  if (adminDoc) {
    return <>{children}</>;
  }

  // Fallback loading state for any edge cases before redirection happens.
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="p-8 space-y-4">
        <h2 className="text-2xl font-semibold">Verifying Admin Access...</h2>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
