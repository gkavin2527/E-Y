
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
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );

  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  useEffect(() => {
    // Wait until both user and admin status are fully loaded
    if (isUserLoading || isAdminDocLoading) {
      return; // Do nothing while loading
    }

    // If there's no user, redirect to login
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    // If there is a user but they are not in the admin document, redirect to home
    if (!adminDoc) {
      router.replace('/');
      return;
    }

  }, [user, adminDoc, isUserLoading, isAdminDocLoading, router]);

  // Determine if the user is allowed
  const isAllowed = user && adminDoc;
  
  // Show loading screen while we wait for any data
  if (isUserLoading || isAdminDocLoading) {
    return <LoadingScreen />;
  }
  
  // If allowed, show the content
  if (isAllowed) {
    return <>{children}</>;
  }

  // Otherwise, show loading screen during the brief moment of redirection
  return <LoadingScreen />;
}
