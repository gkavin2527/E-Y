
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDocs, writeBatch, serverTimestamp, runTransaction } from 'firebase/firestore';
import type { Order, OrderItem, Review, Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { ReviewDialog } from '@/components/product/review-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function OrderItemCard({ item, onReview }: { item: Order['items'][0], onReview: (item: OrderItem) => void }) {
    const productImage = item.image;
    return (
        <div className="flex items-center gap-4 py-2">
            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                {productImage && <Image src={productImage} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Size: {item.size} &times; {item.quantity}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="outline" size="sm" onClick={() => onReview(item)}>Write a Review</Button>
            </div>
        </div>
    )
}


export default function OrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<OrderItem | null>(null);

  const ordersQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'orders'), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const isLoading = isUserLoading || areOrdersLoading;

  const handleOpenReviewDialog = (item: OrderItem) => {
    setSelectedItemForReview(item);
    setIsReviewDialogOpen(true);
  }

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!firestore || !user || !selectedItemForReview) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not submit review. Please try again.' });
        return false;
    }
    try {
        const productId = selectedItemForReview.productId;
        const productRef = doc(firestore, 'products', productId);
        const reviewsCollectionRef = collection(productRef, 'reviews');
        
        await runTransaction(firestore, async (transaction) => {
            // 1. Create the new review
            const newReviewRef = doc(reviewsCollectionRef);
            const newReview: Omit<Review, 'id'> = {
                userId: user.uid,
                productId: productId,
                userName: user.displayName || user.email || 'Anonymous',
                rating,
                comment,
                createdAt: serverTimestamp() as any,
            };
            transaction.set(newReviewRef, newReview);

            // 2. Recalculate the product's average rating and review count
            const reviewsSnapshot = await getDocs(query(reviewsCollectionRef));
            const reviews = reviewsSnapshot.docs.map(d => d.data() as Review);
            reviews.push(newReview as Review); // Add the new review to the list for calculation

            const reviewCount = reviews.length;
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / reviewCount;

            // 3. Update the product document
            transaction.update(productRef, {
                rating: Number(averageRating.toFixed(2)),
                reviewCount: reviewCount,
            });
        });

        toast({ title: 'Review Submitted!', description: 'Thank you for your feedback.' });
        return true;
    } catch (error) {
        console.error("Failed to submit review:", error);
        toast({ variant: 'destructive', title: 'Submission Failed', description: 'An error occurred while submitting your review.' });
        return false;
    }
  }

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
        <CardDescription>
          View your order history and check the status of your recent orders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <h3 className="text-xl font-semibold">You have no orders yet.</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              When you place an order, it will appear here.
            </p>
            <Button asChild>
              <Link href="/shops/women">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                    <AccordionItem value={order.id} className="border-b-0">
                        <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full text-left">
                                <div className="mb-2 sm:mb-0">
                                    <p className="font-semibold">Order #{order.id.slice(0, 7)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                                    <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                             <Separator className="mb-4" />
                            <div className="space-y-2 divide-y">
                                {order.items.map((item) => (
                                    <OrderItemCard key={item.productId + item.size} item={item} onReview={handleOpenReviewDialog} />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
              </Card>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
    {selectedItemForReview && (
        <ReviewDialog 
            isOpen={isReviewDialogOpen}
            setIsOpen={setIsReviewDialogOpen}
            productName={selectedItemForReview.name}
            productImage={selectedItemForReview.image}
            onSubmit={handleReviewSubmit}
        />
    )}
    </>
  );
}
