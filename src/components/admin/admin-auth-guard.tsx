'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

function LoadingScreen() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Verifying Access</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
}

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const adminDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );
  
  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  useEffect(() => {
    // Don't do anything until all data is loaded
    if (isUserLoading || isAdminDocLoading) {
      return;
    }

    // Redirect non-logged-in users
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    // Redirect logged-in users who are not admins
    if (!adminDoc) {
      router.replace('/');
    }
  }, [isUserLoading, isAdminDocLoading, user, adminDoc, router]);

  // While loading, show the loading screen
  if (isUserLoading || isAdminDocLoading) {
    return <LoadingScreen />;
  }

  // If the user is an admin, show the admin panel
  if (user && adminDoc) {
    return <>{children}</>;
  }

  // Otherwise, render nothing while the redirect initiated by useEffect takes place
  return null;
}
