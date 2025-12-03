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
    // This effect handles redirecting non-logged-in users.
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/admin');
    }
  }, [isUserLoading, user, router]);

  // Primary Loading State: If we are waiting for the user object itself.
  if (isUserLoading || !user) {
    return <LoadingScreen />;
  }

  // Secondary Loading State: If we have the user, but are waiting for the admin check.
  if (isAdminDocLoading) {
    return <LoadingScreen />;
  }
  
  // Final Decision: Once all data is loaded.
  if (adminDoc) {
    // If adminDoc exists, user is an admin. Show the panel.
    return <>{children}</>;
  } else {
    // If adminDoc does not exist, user is not an admin. Redirect.
    router.replace('/');
    return null; // Render nothing while redirecting.
  }
}
