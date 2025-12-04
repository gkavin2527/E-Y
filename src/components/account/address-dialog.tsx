
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  address: z.string().min(5, 'Address is required.'),
  city: z.string().min(2, 'City is required.'),
  zipCode: z.string().min(5, 'A 5-digit ZIP code is required.'),
  country: z.string().min(2, 'Country is required.'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  address?: Address;
  userId?: string | null;
}

export function AddressDialog({ isOpen, setIsOpen, address, userId }: AddressDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (address) {
        form.reset(address);
      } else {
        form.reset({ fullName: '', address: '', city: '', zipCode: '', country: '' });
      }
    }
  }, [address, form, isOpen]);

  const onSubmit = async (data: AddressFormValues) => {
    if (!firestore || !userId) return;
    setIsSaving(true);
    
    try {
      if (address) {
        // Update existing address
        const addressRef = doc(firestore, 'users', userId, 'addresses', address.id);
        await setDoc(addressRef, data, { merge: true });
        toast({ title: 'Success', description: 'Address updated successfully.' });
      } else {
        // Create new address
        const addressesCollection = collection(firestore, 'users', userId, 'addresses');
        await addDoc(addressesCollection, data);
        toast({ title: 'Success', description: 'Address added successfully.' });
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !userId || !address) return;
    setIsDeleting(true);
    try {
        const addressRef = doc(firestore, 'users', userId, 'addresses', address.id);
        await deleteDoc(addressRef);
        toast({ title: 'Success', description: 'Address deleted successfully.' });
        setIsDeleteDialogOpen(false);
        setIsOpen(false);
    } catch (error: any) {
        console.error('Error deleting address:', error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {address ? 'Edit the details of your shipping address.' : 'Fill in the details to add a new address.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="zipCode" render={({ field }) => (
                    <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <DialogFooter className="pt-4 border-t gap-2 sm:justify-between">
                <div>
                {address && (
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button type="button" variant="destructive" disabled={isDeleting}>Delete</Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this address.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                </div>

                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Address'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
