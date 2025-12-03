
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminProductsPage() {
    const firestore = useFirestore();
    const productsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'products') : null, [firestore]);
    const { data: products, isLoading } = useCollection<Product>(productsQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Products</CardTitle>
                <CardDescription>Manage your products here.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">Total Sales</TableHead>
                        <TableHead className="hidden md:table-cell">Created at</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map(product => {
                             const productImage = PlaceHolderImages.find(p => p.id === product.images[0]);
                            return (
                                <TableRow key={product.id}>
                                <TableCell className="hidden sm:table-cell">
                                {productImage && <Image
                                    alt="Product image"
                                    className="aspect-square rounded-md object-cover"
                                    height="64"
                                    src={productImage.imageUrl}
                                    width="64"
                                />}
                                </TableCell>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                <Badge variant="outline">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Badge>
                                </TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell className="hidden md:table-cell">25</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    2023-07-12 10:42 AM
                                </TableCell>
                                <TableCell>
                                    <Button size="sm">Edit</Button>
                                </TableCell>
                            </TableRow>
                            )
                        })}
                    </TableBody>
                    </Table>
            </CardContent>
        </Card>
    )
}
