
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

function OrderItemCard({ item }: { item: Order['items'][0] }) {
    const productImage = PlaceHolderImages.find((p) => p.id === item.image);
    return (
        <div className="flex items-center gap-4 py-2">
            <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                {productImage && <Image src={productImage.imageUrl} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Size: {item.size} &times; {item.quantity}</p>
            </div>
            <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    )
}


export default function OrdersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (firestore && user ? query(collection(firestore, 'orders'), where('userId', '==', user.uid)) : null),
    [firestore, user]
  );

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);

  const isLoading = isUserLoading || areOrdersLoading;

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
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">You have no orders yet.</h3>
            <p className="text-muted-foreground mt-2 mb-6">
              When you place an order, it will appear here.
            </p>
            <Button asChild>
              <Link href="/women">Start Shopping</Link>
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
                                    <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                             <Separator className="mb-4" />
                            <div className="space-y-2">
                                {order.items.map((item) => (
                                    <OrderItemCard key={item.productId + item.size} item={item} />
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
  );
}
