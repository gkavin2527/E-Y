
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

const shippingSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  zipCode: z.string().min(5, { message: "A 5-digit ZIP code is required." }),
  country: z.string().min(2, { message: "Country is required." }),
});

const paymentSchema = z.object({
    cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.'),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format.'),
    cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits.'),
});

const checkoutSchema = shippingSchema.merge(paymentSchema);

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      address: '',
      city: '',
      zipCode: '',
      country: 'United States',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to proceed to checkout.',
        variant: 'destructive',
      });
      router.push('/login?redirect=/checkout');
    }
  }, [user, isUserLoading, router, toast]);

  
  const shippingCost = 5.00;
  const totalWithShipping = totalPrice + shippingCost;
  
  const onSubmit = async (data: CheckoutFormValues) => {
    if (!user || !firestore || items.length === 0) return;

    setIsProcessing(true);
    toast({
        title: "Processing Order...",
        description: "Please wait while we finalize your order.",
    });

    try {
        const ordersCollectionRef = collection(firestore, 'orders');
        
        await addDoc(ordersCollectionRef, {
            userId: user.uid,
            createdAt: serverTimestamp(),
            items: items,
            total: totalWithShipping,
        });

        await clearCart();

        toast({
            title: "Order Placed Successfully!",
            description: "Thank you for your purchase. A confirmation has been sent to your email.",
        });
        router.push('/account/orders');

    } catch (error) {
        console.error("Error placing order: ", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <Skeleton className="h-8 w-1/2 mb-6" />
                <Skeleton className="h-96 w-full" />
            </div>
            <div>
                <Skeleton className="h-8 w-1/3 mb-6" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
  }

  if (totalItems === 0 && !isProcessing) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">You have nothing to check out. Let's find something for you!</p>
            <Button asChild>
            <Link href="/women">Start Shopping</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem className="sm:col-span-1"><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                        <FormItem className="sm:col-span-1"><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem className="sm:col-span-1"><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>All transactions are secure and encrypted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (
                        <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="expiryDate" render={({ field }) => (
                            <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="cvc" render={({ field }) => (
                            <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Place Order - $${totalWithShipping.toFixed(2)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.map(item => {
                             const productImage = item.image;
                            return (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                        {productImage && <Image src={productImage} alt={item.name} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Size: {item.size} &times; {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            )
                        })}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>${shippingCost.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${totalWithShipping.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
