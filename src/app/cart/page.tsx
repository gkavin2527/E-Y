

'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const shippingCost = 5.00;
  const totalWithShipping = totalPrice + shippingCost;

  if (totalItems === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/shop/women">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Shopping Cart</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold font-headline mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <div className="space-y-4">
                    {items.map((item) => {
                        const productImage = item.image;
                        return (
                        <Card key={item.id}>
                            <CardContent className="flex items-center p-4">
                                <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-md">
                                {productImage && (
                                    <Image src={productImage} alt={item.name} fill className="object-cover" />
                                )}
                                </div>
                                <div className="ml-4 flex-1 flex flex-col sm:flex-row justify-between">
                                    <div className='mb-4 sm:mb-0'>
                                        <h3 className="font-medium">
                                            <Link href={`/products/${item.productId}`} className="hover:underline">{item.name}</Link>
                                        </h3>
                                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                                        <p className="text-lg font-semibold mt-2">₹{item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                                        <div className="flex items-center border rounded-md">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><Minus className="h-3 w-3" /></Button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        );
                    })}
                </div>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Shipping</span>
                            <span>₹{shippingCost.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{totalWithShipping.toFixed(2)}</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/checkout">Proceed to Checkout</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
