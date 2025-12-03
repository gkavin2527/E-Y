
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (isLoading) return; // Wait for user and profile to load

    if (!user) {
      router.replace('/login'); // Not logged in, redirect to login
      return;
    }

    if (userProfile?.role !== 'admin') {
      router.replace('/'); // Not an admin, redirect to home
    }
  }, [user, userProfile, isLoading, router]);

  if (isLoading || userProfile?.role !== 'admin') {
    // Show a loading state or a blank screen while checking auth
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
