
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Home, Plus, TicketPercent, CreditCard, Banknote } from 'lucide-react';
import type { UserProfile, Address, Order } from '@/lib/types';
import { AddressDialog } from '@/components/account/address-dialog';

const paymentSchema = z.object({
    cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits.').optional().or(z.literal('')),
    expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry date must be in MM/YY format.').optional().or(z.literal('')),
    cvc: z.string().regex(/^\d{3,4}$/, 'CVC must be 3 or 4 digits.').optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

// Mock coupon data
const validCoupons: Record<string, { description: string, type: 'percentage' | 'flat'; value: number }> = {
    'SALE20': { description: "Get 20% off on your order", type: 'percentage', value: 20 },
    'GET100': { description: "Get flat ₹100 off", type: 'flat', value: 100 },
    'SAVE10': { description: "Get 10% off on your order", type: 'percentage', value: 10 },
    'FLAT50': { description: "Get flat ₹50 off", type: 'flat', value: 50 },
};




function CheckoutSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-8">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
      </div>
    );
}

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');


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


  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: '', expiryDate: '', cvc: '' },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      toast({ title: 'Authentication Required', description: 'Please log in to proceed to checkout.', variant: 'destructive' });
      router.push('/login?redirect=/checkout');
    }
  }, [user, isUserLoading, router, toast]);

  useEffect(() => {
    if (userProfile?.defaultAddressId) {
      setSelectedAddressId(userProfile.defaultAddressId);
    } else if (addresses && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [userProfile, addresses]);
  
  const shippingCost = 5.00;
  const subtotalWithShipping = totalPrice + shippingCost;
  const totalWithDiscount = subtotalWithShipping - discount;
  
  const applyCoupon = (code: string) => {
    const coupon = validCoupons[code.toUpperCase()];
    if (coupon) {
      let discountValue = 0;
      if (coupon.type === 'percentage') {
        discountValue = (totalPrice * coupon.value) / 100;
      } else {
        discountValue = coupon.value;
      }
      setDiscount(discountValue);
      setAppliedCoupon(code.toUpperCase());
      toast({ title: "Coupon Applied!", description: `You've received a discount of ₹${discountValue.toFixed(2)}.` });
    } else {
      setDiscount(0);
      setAppliedCoupon('');
      toast({ variant: 'destructive', title: 'Invalid Coupon', description: 'The coupon code you entered is not valid.' });
    }
  }

  const handleSelectCoupon = (code: string) => {
    setCouponCode(code);
    applyCoupon(code);
  }

  const saveOrderToFirestore = async () => {
    if (!user || !firestore) throw new Error("User or Firestore not available");

    const selectedAddress = addresses?.find(a => a.id === selectedAddressId);
    if (!selectedAddress) throw new Error("No address selected");

    const orderData: Omit<Order, 'id'> = {
        userId: user.uid,
        createdAt: serverTimestamp() as any,
        items: items,
        total: totalWithDiscount,
        shippingAddress: selectedAddress,
    }

    const orderRef = await addDoc(collection(firestore, 'orders'), orderData);
    return orderRef.id;
  }

  const handlePlaceOrder = async (data: PaymentFormValues) => {
    if (!user || !firestore || items.length === 0 || !selectedAddressId) {
        if (!selectedAddressId) {
            toast({ variant: 'destructive', title: "No Address Selected", description: "Please select or add a shipping address." });
        }
        return;
    }
    
    setIsProcessing(true);
    toast({ title: "Processing Order...", description: "Please wait while we finalize your order." });

    if (paymentMethod === 'card') {
        if (!paymentForm.formState.isValid) {
            toast({ variant: 'destructive', title: "Invalid Card Details", description: "Please check your card information and try again." });
            setIsProcessing(false);
            return;
        }
    }

    try {
        await saveOrderToFirestore();
        await clearCart();
        toast({ title: "Order Placed Successfully!", description: "Thank you for your purchase." });
        router.push('/account/orders');

    } catch (error) {
        toast({ variant: "destructive", title: "Order Failed", description: "There was a problem placing your order." });
    } finally {
        setIsProcessing(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading || areAddressesLoading;

  if (isLoading || !user) {
    return <CheckoutSkeleton />;
  }

  if (totalItems === 0 && !isProcessing) {
    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6">Let's find something for you!</p>
            <Button asChild><Link href="/shops/women">Start Shopping</Link></Button>
        </div>
    )
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
            <Card>
                 <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Shipping Address</CardTitle>
                        <CardDescription>Select where to ship your order.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsAddressDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Address</Button>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {addresses && addresses.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {addresses.map(address => (
                                <div key={address.id} onClick={() => setSelectedAddressId(address.id)} className={cn("p-4 rounded-lg border cursor-pointer relative", selectedAddressId === address.id ? "border-primary ring-2 ring-primary" : "hover:bg-muted/50")}>
                                    {selectedAddressId === address.id && (
                                        <CheckCircle className="h-5 w-5 text-primary absolute top-2 right-2" />
                                    )}
                                     <div className="font-semibold">{address.fullName}</div>
                                     <p className="text-sm text-muted-foreground mt-1">
                                        {address.address}, {address.city}, {address.zipCode}
                                     </p>
                                     {userProfile?.defaultAddressId === address.id && <div className="text-xs font-medium text-muted-foreground mt-2 flex items-center gap-1"><Home className="h-3 w-3" /> Default</div>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">You have no saved addresses.</p>
                            <Button variant="link" onClick={() => setIsAddressDialogOpen(true)}>Add a shipping address</Button>
                        </div>
                    )}
                 </CardContent>
            </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>All transactions are secure and encrypted.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Tabs defaultValue="card" className="w-full" onValueChange={setPaymentMethod}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="card"><CreditCard className="h-4 w-4 mr-2" />Card</TabsTrigger>
                            <TabsTrigger value="cod"><Banknote className="h-4 w-4 mr-2" />COD</TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="pt-6">
                            <Form {...paymentForm}>
                                <form id="payment-form" onSubmit={paymentForm.handleSubmit(handlePlaceOrder)} className="space-y-4">
                                     <FormField control={paymentForm.control} name="cardNumber" render={({ field }) => (
                                        <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={paymentForm.control} name="expiryDate" render={({ field }) => (
                                            <FormItem><FormLabel>Expiry Date</FormLabel><FormControl><Input placeholder="MM/YY" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={paymentForm.control} name="cvc" render={({ field }) => (
                                            <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>
                         <TabsContent value="cod" className="pt-6 text-center">
                             <p className="text-muted-foreground">You will pay upon delivery.</p>
                        </TabsContent>
                    </Tabs>
                 </CardContent>
              </Card>

              <Button 
                onClick={paymentMethod === 'card' ? paymentForm.handleSubmit(handlePlaceOrder) : () => handlePlaceOrder({} as PaymentFormValues)} 
                className="w-full" 
                size="lg" 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Place Order - ₹${totalWithDiscount.toFixed(2)}`}
              </Button>
        </div>

        <div className='space-y-8'>
            <Card>
                 <CardHeader>
                    <CardTitle>Available Offers</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    {Object.entries(validCoupons).map(([code, { description }]) => (
                        <div key={code} className="flex items-center justify-between p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5">
                            <div className="flex items-center gap-3">
                                <TicketPercent className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold text-primary">{code}</p>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                            <Button 
                                variant={appliedCoupon === code ? "secondary" : "ghost"} 
                                size="sm" 
                                onClick={() => handleSelectCoupon(code)}
                            >
                                {appliedCoupon === code ? "Applied" : "Apply"}
                            </Button>
                        </div>
                    ))}
                 </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {items.map(item => {
                            return (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                                        {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Size: {item.size} &times; {item.quantity}</p>
                                    </div>
                                    <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            )
                        })}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>₹{shippingCost.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span className="font-medium">Discount ({appliedCoupon})</span>
                                <span>- ₹{discount.toFixed(2)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{totalWithDiscount.toFixed(2)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
     <AddressDialog 
        isOpen={isAddressDialogOpen}
        setIsOpen={setIsAddressDialogOpen}
        userId={user?.uid}
    />
    </>
  );
}

    