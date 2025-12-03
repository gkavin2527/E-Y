
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Order, Product, UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';

export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const ordersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'orders') : null, [firestore]);
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);

    const { data: products } = useCollection<Product>(productsQuery);
    const { data: orders } = useCollection<Order>(ordersQuery);
    const { data: users } = useCollection<UserProfile>(usersQuery);

    const totalRevenue = useMemo(() => {
        return orders?.reduce((sum, order) => sum + order.total, 0) || 0;
    }, [orders]);
    
    const salesData = useMemo(() => {
        if (!orders) return [];
        const monthlySales: {[key: string]: number} = {};
        orders.forEach(order => {
            const month = new Date(order.createdAt.seconds * 1000).toLocaleString('default', { month: 'short' });
            monthlySales[month] = (monthlySales[month] || 0) + order.total;
        });
        return Object.entries(monthlySales).map(([month, total]) => ({ month, total }));
    }, [orders]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{orders?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{users?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">+19% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">+2 since last hour</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer
                            config={{
                                total: {
                                    label: 'Sales',
                                    color: 'hsl(var(--chart-1))',
                                },
                            }}
                            className="h-[300px] w-full"
                        >
                            <BarChart data={salesData}>
                                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
