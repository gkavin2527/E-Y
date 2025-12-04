
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

function OrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Details</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function UserOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          )
        : null,
    [firestore, user]
  );

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (!isLoading && (!orders || orders.length === 0)) {
    return (
      <div className="text-center border-2 border-dashed rounded-lg p-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">You have no orders yet.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          When you place an order, it will appear here.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
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
        <div className="space-y-6">
          {orders?.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/50 p-4">
                <div className="grid gap-0.5">
                  <p className="font-semibold">
                    Order ID: <span className="font-mono text-muted-foreground text-sm">{order.id}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {order.createdAt ? format(new Date(order.createdAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">₹{order.total.toFixed(2)}</p>
                    <Badge variant="outline" className='mt-1'>Fulfilled</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                 {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} &times; {item.quantity}</p>
                        </div>
                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
