'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

type AuthStatus = 'loading' | 'allowed' | 'denied';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('loading');

  const adminDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
    [firestore, user]
  );
  
  const { data: adminDoc, isLoading: isAdminDocLoading } = useDoc(adminDocRef);

  useEffect(() => {
    // We will only make a decision once all data is loaded.
    if (isUserLoading || isAdminDocLoading) {
      setStatus('loading');
      return;
    }

    // Decision time.
    if (user && adminDoc) {
      setStatus('allowed');
    } else {
      setStatus('denied');
      if (!user) {
        // If not logged in at all, go to login.
        router.replace('/login?redirect=/admin');
      } else {
        // If logged in but not an admin, go to home.
        router.replace('/');
      }
    }
  }, [user, isUserLoading, adminDoc, isAdminDocLoading, router]);


  if (status === 'loading') {
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

  if (status === 'allowed') {
    return <>{children}</>;
  }

  // If status is 'denied', we are redirecting, so render nothing.
  return null;
}
