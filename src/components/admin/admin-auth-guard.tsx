
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2, ShieldAlert } from 'lucide-react';

function StatusScreen({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-10">
                    {icon}
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

  // If the user's auth status is loading, or if we have a user but are still checking their admin status, show loading.
  if (isUserLoading || (user && isAdminDocLoading)) {
    return (
        <StatusScreen 
            title="Verifying Access" 
            description="Please wait while we check your permissions." 
            icon={<Loader2 className="h-12 w-12 animate-spin text-primary" />} 
        />
    );
  }

  // If there is no user logged in after checking, redirect to login.
  if (!user) {
    // useEffect is necessary to prevent "cannot update a component while rendering a different component" error.
    useEffect(() => {
        router.replace('/login?redirect=/admin');
    }, [router]);
    return null; // Render nothing while redirecting
  }

  // If we have a user, have checked for the admin doc, and it doesn't exist, show permission denied.
  if (!adminDoc) {
    return (
        <StatusScreen 
            title="Access Denied" 
            description="You do not have permission to view this page." 
            icon={<ShieldAlert className="h-12 w-12 text-destructive" />} 
        />
    );
  }

  // If all checks pass, render the children.
  return <>{children}</>;
}
