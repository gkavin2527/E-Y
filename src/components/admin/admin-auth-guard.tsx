
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
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );

  const { data: adminDoc, isLoading: isAdminDocLoading, error: adminDocError } = useDoc(adminDocRef);

  // LOGGING STEP 1: Log initial hook values
  console.log('[AdminGuard] State update:', {
    isUserLoading,
    user: user ? { uid: user.uid, email: user.email } : null,
    isAdminDocLoading,
    adminDocExists: adminDoc ? true : false,
    adminDocError: adminDocError ? adminDocError.message : null,
  });

  useEffect(() => {
    // This effect handles the redirection logic
    const isDataLoading = isUserLoading || isAdminDocLoading;
    if (isDataLoading) {
      // LOGGING STEP 2: Log that we are waiting for data
      console.log('[AdminGuard] Waiting for data to load...');
      return; // Do nothing while loading
    }
    
    // Once loading is complete, decide what to do
    const isAllowed = user && adminDoc;
    
    // LOGGING STEP 3: Log the final decision
    console.log(`[AdminGuard] Decision: isAllowed = ${isAllowed}. Redirecting? ${!isAllowed}`);

    if (!isAllowed) {
        if (!user) {
            router.replace('/login?redirect=/admin');
        } else {
            router.replace('/');
        }
    }
  }, [user, adminDoc, isUserLoading, isAdminDocLoading, router]);

  const isDataLoading = isUserLoading || isAdminDocLoading;
  const isAllowed = user && adminDoc;
  
  if (isDataLoading) {
    return <LoadingScreen />;
  }
  
  if (isAllowed) {
    return <>{children}</>;
  }

  // Render the loading screen during the brief moment of redirection
  return <LoadingScreen />;
}
