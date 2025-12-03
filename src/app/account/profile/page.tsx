
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  useEffect(() => {
    if (userDocRef) {
      setIsLoading(true);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfile(data);
          setFirstName(data.firstName);
          setLastName(data.lastName);
        } else {
            setProfile(null);
            console.log("No such document!");
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching user profile:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch profile. You may not have permission."
        })
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (!isUserLoading) {
        setIsLoading(false);
    }
  }, [userDocRef, isUserLoading, toast]);


  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef || !profile) return;
    
    setIsSaving(true);
    
    const updatedData = {
        firstName: firstName,
        lastName: lastName,
    };

    try {
        await updateDoc(userDocRef, updatedData);
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        });
    } catch (error: any) {
        console.error("Profile update error:", error);
        toast({
            variant: "destructive",
            title: "Update failed",
            description: "Could not update your profile. Please try again."
        })
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  if (!profile) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Not Found</CardTitle>
                <CardDescription>We couldn't find your profile data. If you just signed up, it might be being created.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  const hasChanges = profile.firstName !== firstName || profile.lastName !== lastName;

  return (
    <form onSubmit={handleUpdateProfile}>
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Update your personal information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.email} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving || !hasChanges}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
