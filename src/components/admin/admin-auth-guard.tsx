
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  // If either the user authentication or the admin document check is loading, show a loading screen.
  // This is the most important part: we do not proceed or attempt any redirects until we have all the information.
  if (isUserLoading || isAdminDocLoading) {
    return <LoadingScreen />;
  }

  // After all loading is complete, we can safely check the conditions.
  // If there's no user, or if there's a user but no admin document, they are not allowed.
  const isAllowed = user && adminDoc;

  if (!isAllowed) {
    // If not allowed, redirect them. We use a useEffect to handle this side-effect
    // after the initial render, which is a safe React pattern.
    useEffect(() => {
      if (!user) {
        // If the reason is "no user", redirect to login.
        router.replace('/login?redirect=/admin');
      } else {
        // Otherwise, they are a user but not an admin, so redirect to home.
        router.replace('/');
      }
    }, [user, router]);

    // Render nothing while the redirect is being processed.
    return null;
  }
  
  // If all checks pass and the user is allowed, render the admin panel.
  return <>{children}</>;
}
