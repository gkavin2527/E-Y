'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

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
    // Wait until both user and admin status are fully loaded
    if (isUserLoading || isAdminDocLoading) {
      return;
    }

    // If loading is finished and there's no user, redirect to login
    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    // If loading is finished, there IS a user, but they are not an admin, redirect to homepage
    if (!adminDoc) {
      router.replace('/');
    }
  }, [user, isUserLoading, adminDoc, isAdminDocLoading, router]);

  const isChecking = isUserLoading || isAdminDocLoading;
  const isAllowed = user && adminDoc;

  if (isChecking) {
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

  if (isAllowed) {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}
