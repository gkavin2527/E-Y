
'use client';

import { useState } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy, doc, runTransaction } from 'firebase/firestore';
import type { Order, Review, Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewDialog } from '@/components/product/review-dialog';
import { StyleDialog } from '@/components/product/style-dialog';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/lib/types';

function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function OrdersPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);

    const ordersQuery = useMemoFirebase(
        () => (firestore && user ? query(collection(firestore, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null),
        [firestore, user]
    );

    const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

    const handleWriteReviewClick = (item: OrderItem) => {
        setSelectedItem(item);
        setIsReviewDialogOpen(true);
    };

    const handleStyleItemClick = (item: OrderItem) => {
        setSelectedItem(item);
        setIsStyleDialogOpen(true);
    }

    const handleReviewSubmit = async (rating: number, comment: string): Promise<boolean> => {
        if (!firestore || !user || !selectedItem) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit a review.' });
            return false;
        }

        const productRef = doc(firestore, 'products', selectedItem.productId);
        const reviewRef = doc(collection(productRef, 'reviews'));

        try {
            await runTransaction(firestore, async (transaction) => {
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists()) {
                    throw new Error("Product not found!");
                }

                const productData = productDoc.data() as Product;
                const oldRating = productData.rating || 0;
                const oldReviewCount = productData.reviewCount || 0;

                const newReviewCount = oldReviewCount + 1;
                const newRating = (oldRating * oldReviewCount + rating) / newReviewCount;
                
                const newReview: Omit<Review, 'id'> = {
                    userId: user.uid,
                    productId: selectedItem.productId,
                    userName: user.displayName || user.email || 'Anonymous',
                    rating,
                    comment,
                    createdAt: new Date() as any, // Firestore will convert this to a Timestamp
                };

                transaction.set(reviewRef, newReview);
                transaction.update(productRef, { rating: newRating, reviewCount: newReviewCount });
            });

            toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
            return true;
        } catch (e: any) {
            console.error("Failed to submit review: ", e);
            toast({ variant: 'destructive', title: 'Submission Failed', description: e.message });
            return false;
        }
    };


    const isLoading = isUserLoading || areOrdersLoading;

    if (isLoading) {
        return <OrdersSkeleton />;
    }
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>View your order history and get styling advice.</CardDescription>
                </CardHeader>
                <CardContent>
                    {orders && orders.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                            {orders.map(order => (
                                <AccordionItem value={order.id} key={order.id}>
                                    <AccordionTrigger>
                                        <div className="flex justify-between w-full pr-4">
                                            <div>
                                                <p className="font-semibold">Order #{order.id.substring(0, 7)}</p>
                                                <p className="text-sm text-muted-foreground">{format(new Date(order.createdAt.seconds * 1000), 'MMMM d, yyyy')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                                                <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            {order.items.map((item, index) => (
                                                <div key={index}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Link href={`/shops/products/${item.productId}`} className="font-medium hover:underline">{item.name}</Link>
                                                            <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                            <p className="text-sm font-semibold">₹{item.price.toFixed(2)}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => handleWriteReviewClick(item)}>Write a Review</Button>
                                                            <Button variant="secondary" size="sm" onClick={() => handleStyleItemClick(item)}>Style this Item</Button>
                                                        </div>
                                                    </div>
                                                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">You haven't placed any orders yet.</h3>
                            <p className="text-muted-foreground mt-1">When you do, your orders will appear here.</p>
                            <Button asChild variant="link">
                                <Link href="/">Start Shopping</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            {selectedItem && (
                 <ReviewDialog
                    isOpen={isReviewDialogOpen}
                    setIsOpen={setIsReviewDialogOpen}
                    productName={selectedItem.name}
                    productImage={selectedItem.image}
                    onSubmit={handleReviewSubmit}
                 />
            )}
            {selectedItem && (
                <StyleDialog
                    isOpen={isStyleDialogOpen}
                    setIsOpen={setIsStyleDialogOpen}
                    productName={selectedItem.name}
                    productImage={selectedItem.image}
                />
            )}
        </>
    );
}
