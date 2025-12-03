
'use client';

import Link from 'next/link';
import {
  Activity,
  DollarSign,
  Users,
  Package,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Order, Product, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function StatCard({
    title,
    value,
    icon,
    isLoading
}: {
    title: string;
    value: string;
    icon: React.ElementType;
    isLoading: boolean;
}) {
    const Icon = icon;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
      </Card>
    )
}

export default function Dashboard() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'orders') : null),
    [firestore]
  );
  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );

  const { data: orders, isLoading: areOrdersLoading } = useCollection<Order>(ordersQuery);
  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);
  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalSales = orders?.length || 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <StatCard 
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            isLoading={areOrdersLoading}
        />
        <StatCard 
            title="Sales"
            value={`+${totalSales}`}
            icon={Activity}
            isLoading={areOrdersLoading}
        />
        <StatCard 
            title="Products"
            value={`${products?.length || 0}`}
            icon={Package}
            isLoading={areProductsLoading}
        />
        <StatCard 
            title="Total Users"
            value={`${users?.length || 0}`}
            icon={Users}
            isLoading={areUsersLoading}
        />
      </div>
      <div className="text-center mt-16">
        <h2 className='text-2xl font-semibold'>Welcome to your Admin Panel</h2>
        <p className='text-muted-foreground mt-2'>This is a basic dashboard. More features coming soon!</p>
      </div>
    </>
  );
}
