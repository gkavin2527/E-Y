
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
    if (isLoading) return; // Wait for user and admin doc to load

    if (!user) {
      router.replace('/login'); // Not logged in, redirect to login
      return;
    }
    
    // If the admin document doesn't exist, they are not an admin.
    if (!adminDoc) {
      router.replace('/'); // Not an admin, redirect to home
    }
  }, [user, adminDoc, isLoading, router]);

  // While loading, or if the user is not a verified admin, show a loading state.
  if (isLoading || !adminDoc) {
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

  // If loading is complete and user is an admin, render the children.
  return <>{children}</>;
}
