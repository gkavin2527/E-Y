
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { UserProfile } from '@/lib/types';


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formState, setFormState] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
  });

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
          setFormState({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            address: data.address || '',
            city: data.city || '',
            zipCode: data.zipCode || '',
            country: data.country || '',
          });
        } else {
            setProfile(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({ ...prevState, [id]: value }));
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef || !profile) return;
    
    setIsSaving(true);
    
    try {
        await updateDoc(userDocRef, formState);
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

  const hasChanges = JSON.stringify(formState) !== JSON.stringify({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    address: profile.address || '',
    city: profile.city || '',
    zipCode: profile.zipCode || '',
    country: profile.country || '',
  });

  return (
    <form onSubmit={handleUpdateProfile}>
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Update your personal information and default shipping address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                        id="firstName"
                        value={formState.firstName}
                        onChange={handleInputChange}
                        disabled={isSaving}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                        id="lastName"
                        value={formState.lastName}
                        onChange={handleInputChange}
                        disabled={isSaving}
                    />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={profile.email} disabled />
                </div>
            </div>
            <Separator />
            <div className="space-y-4">
                 <h3 className="font-semibold text-lg">Default Shipping Address</h3>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formState.address} onChange={handleInputChange} disabled={isSaving} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={formState.city} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input id="zipCode" value={formState.zipCode} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={formState.country} onChange={handleInputChange} disabled={isSaving} />
                    </div>
                </div>
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
