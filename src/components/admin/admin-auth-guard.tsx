'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  const [authStatus, setAuthStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');

  useEffect(() => {
    const isChecking = isUserLoading || isAdminDocLoading;

    if (isChecking) {
      setAuthStatus('loading');
      return;
    }

    if (!user) {
      // Not logged in at all, deny and redirect
      setAuthStatus('denied');
      router.replace('/login?redirect=/admin');
      return;
    }

    if (adminDoc) {
      // User is logged in and their UID exists in the 'admins' collection
      setAuthStatus('allowed');
    } else {
      // Logged in, but not an admin
      setAuthStatus('denied');
      router.replace('/'); // Redirect non-admins to the homepage
    }
  }, [user, isUserLoading, adminDoc, isAdminDocLoading, router]);

  if (authStatus === 'loading') {
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

  if (authStatus === 'allowed') {
    return <>{children}</>;
  }

  // Render nothing while redirecting
  return null;
}
