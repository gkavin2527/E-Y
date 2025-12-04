
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { UserProfile, Address } from '@/lib/types';
import { useDoc } from '@/firebase/firestore/use-doc';
import { AddressDialog } from '@/components/account/address-dialog';
import { Edit, Home, Plus, Trash2 } from 'lucide-react';


function AddressCard({ address, isDefault, onSetDefault, onEdit, onDelete }: { address: Address; isDefault: boolean; onSetDefault: () => void; onEdit: () => void; onDelete: () => void; }) {
    return (
        <Card className={isDefault ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="font-semibold">{address.fullName}</div>
                {isDefault && <div className="flex items-center gap-1 text-xs text-primary font-medium"><Home className="h-3 w-3" /> Default</div>}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    {address.address}, {address.city}, {address.zipCode}, {address.country}
                </p>
            </CardContent>
            <CardContent className="flex items-center gap-2 pt-0">
                 {!isDefault && (
                    <Button variant="outline" size="sm" onClick={onSetDefault}>Set as Default</Button>
                 )}
                 <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</Button>
                 <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
            </CardContent>
        </Card>
    )
}

function ProfileSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Partial<UserProfile>>({ firstName: '', lastName: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(undefined);

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const addressesCollectionRef = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'users', user.uid, 'addresses') : null),
    [firestore, user]
  );

  const { data: addresses, isLoading: areAddressesLoading } = useCollection<Address>(addressesCollectionRef);

  
  useEffect(() => {
    if (userProfile) {
      setProfile({ firstName: userProfile.firstName || '', lastName: userProfile.lastName || '' });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prevState => ({ ...prevState, [id]: value }));
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDocRef) return;
    
    setIsSaving(true);
    try {
        await updateDoc(userDocRef, { firstName: profile.firstName, lastName: profile.lastName });
        toast({ title: "Profile Updated", description: "Your name has been successfully updated." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update failed", description: "Could not update your profile." })
    } finally {
        setIsSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
      if (!userDocRef) return;
      try {
        await updateDoc(userDocRef, { defaultAddressId: addressId });
        toast({ title: "Default Address Set", description: "This address will be pre-selected at checkout." });
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not set default address." });
      }
  }

  const handleAddNewAddress = () => {
    setSelectedAddress(undefined);
    setIsAddressDialogOpen(true);
  }

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(true);
  }

  const isLoading = isUserLoading || isProfileLoading || areAddressesLoading;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const hasProfileChanges = userProfile && (profile.firstName !== userProfile.firstName || profile.lastName !== userProfile.lastName);

  return (
    <>
    <div className="space-y-8">
      <Card as="form" onSubmit={handleUpdateProfile}>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>
            Update your personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={profile.firstName} onChange={handleInputChange} disabled={isSaving} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={profile.lastName} onChange={handleInputChange} disabled={isSaving} />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={userProfile?.email || ''} disabled />
            </div>
            <Button type="submit" disabled={isSaving || !hasProfileChanges}>
                {isSaving ? 'Saving...' : 'Save Personal Info'}
            </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle>Shipping Addresses</CardTitle>
                <CardDescription>Manage your saved shipping addresses.</CardDescription>
            </div>
            <Button onClick={handleAddNewAddress}><Plus className="h-4 w-4 mr-2" /> Add New</Button>
        </CardHeader>
        <CardContent className="space-y-4">
            {addresses && addresses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map(address => (
                        <AddressCard 
                            key={address.id}
                            address={address}
                            isDefault={userProfile?.defaultAddressId === address.id}
                            onSetDefault={() => handleSetDefaultAddress(address.id)}
                            onEdit={() => handleEditAddress(address)}
                            onDelete={() => { /* Implement delete logic */}}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You have no saved addresses.</p>
                    <Button variant="link" onClick={handleAddNewAddress}>Add your first address</Button>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
    <AddressDialog 
        isOpen={isAddressDialogOpen}
        setIsOpen={setIsAddressDialogOpen}
        address={selectedAddress}
        userId={user?.uid}
    />
    </>
  );
}
