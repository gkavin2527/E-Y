
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Order } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const ordersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc')) : null, [firestore]);
    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View and manage customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.map(order => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">User ID</div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                        {order.userId}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">Fulfilled</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
