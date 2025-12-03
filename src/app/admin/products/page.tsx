'use client';
import * as React from 'react';
import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProductDialog } from '@/components/admin/product-dialog';

export default function AdminProductsPage() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  
  const { data: products, isLoading } = useCollection<Product>(productsQuery);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined);

  const handleAddNew = () => {
    setSelectedProduct(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Products</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" className="h-8 gap-1" onClick={handleAddNew}>
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Product</span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
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
                <TableHead className="hidden md:table-cell">Gender</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && products?.map((product) => {
                  const firstImage = product.images?.[0];
                  return (
                    <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                        {firstImage && (
                            <Image
                                alt={product.name}
                                className="aspect-square rounded-md object-cover"
                                height="64"
                                src={firstImage}
                                width="64"
                            />
                        )}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                        <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                    </TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{product.gender}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{product.category}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                    </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ProductDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        product={selectedProduct} 
      />
    </>
  );
}
