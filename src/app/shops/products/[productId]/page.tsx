
'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import type { Product, Review } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function StarRating({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) {
    const starSize = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size];
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`${starSize} ${i < Math.round(rating) ? 'text-primary fill-primary' : 'text-muted-foreground/50'}`} />
            ))}
        </div>
    );
}


function ProductPageSkeleton() {
    return (
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-5 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                ))}
            </div>
        </div>
        <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-16" />
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-10 w-12" />
                    <Skeleton className="h-10 w-12" />
                </div>
            </div>
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
}

export default function ProductPage() {
    const params = useParams();
    const productId = params.productId as string;
    const firestore = useFirestore();
    const { toast } = useToast();
    const { addItem } = useCart();
  
    const productDocRef = useMemoFirebase(
      () => (firestore && productId ? doc(firestore, 'products', productId) : null),
      [firestore, productId]
    );

    const reviewsQuery = useMemoFirebase(
        () => (productDocRef ? query(collection(productDocRef, 'reviews'), orderBy('createdAt', 'desc')) : null),
        [productDocRef]
    );
  
    const { data: product, isLoading: isProductLoading } = useDoc<Product>(productDocRef);
    const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsQuery);
  
    const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | null>(null);
    const [mainImage, setMainImage] = useState<string | null>(null);
  
    useMemo(() => {
      if (product && product.images.length > 0) {
        setMainImage(product.images[0]);
      }
    }, [product]);
  
    const handleAddToCart = () => {
      if (!product) return;
      if (!selectedSize) {
        toast({
          variant: 'destructive',
          title: 'Please select a size',
          description: 'You must select a size before adding to the cart.',
        });
        return;
      }
      addItem(product, selectedSize, 1);
      toast({
        title: 'Added to Cart',
        description: `${product.name} (${selectedSize}) has been added to your cart.`,
      });
    };

    const isLoading = isProductLoading || areReviewsLoading;

    if (isLoading) {
      return <ProductPageSkeleton />;
    }
  
    if (!product) {
      return (
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground mt-2">Sorry, we couldn't find the product you're looking for.</p>
          <Button asChild className="mt-6">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      );
    }
  
    const availableSizes = Object.entries(product.sizes || {})
      .filter(([, stock]) => stock > 0)
      .map(([size]) => size as 'S' | 'M' | 'L' | 'XL');

    const firstImage = mainImage ?? (product.images.length > 0 ? product.images[0] : "https://placehold.co/600x800");
    const breadcrumbCategory = product.category || 'products';
    const breadcrumbGender = product.gender || 'women';

    return (
      <div className="container mx-auto px-4 py-8">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem><Link href="/">Home</Link></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><Link href={`/shops/${breadcrumbGender}`}>{product.gender}</Link></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><Link href={`/shops/${breadcrumbGender}/${breadcrumbCategory}`}>{product.category}</Link></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-lg mb-4 border bg-muted">
                {firstImage && (
                    <Image
                        src={firstImage}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="object-cover w-full h-full"
                    />
                )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((imgSrc, index) => {
                return (
                    <button
                        key={index}
                        onClick={() => setMainImage(imgSrc)}
                        className={`aspect-square overflow-hidden rounded-md border-2 ${mainImage === imgSrc ? 'border-primary' : 'border-transparent'}`}
                    >
                         <Image
                            src={imgSrc}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full"
                        />
                    </button>
                )
              })}
            </div>
          </div>
  
          {/* Product Details */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
                <StarRating rating={product.rating} />
                <span className="text-muted-foreground text-sm">({product.rating.toFixed(1)} from {product.reviewCount || 0} reviews)</span>
            </div>
            <p className="text-3xl font-semibold my-4">
              ₹{product.price.toFixed(2)}
              {product.originalPrice && (
                  <span className="ml-2 text-xl text-muted-foreground line-through">
                      ₹{product.originalPrice.toFixed(2)}
                  </span>
              )}
            </p>
  
            <Separator className="my-4" />
  
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
  
            <div className="mt-auto pt-8">
              <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Size</h3>
                  <RadioGroup
                    value={selectedSize ?? ''}
                    onValueChange={(value) => setSelectedSize(value as 'S' | 'M' | 'L' | 'XL')}
                    className="flex gap-2"
                  >
                    {['S', 'M', 'L', 'XL'].map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                           <RadioGroupItem
                                value={size}
                                id={`size-${size}`}
                                disabled={!availableSizes.includes(size as 'S' | 'M' | 'L' | 'XL')}
                           />
                           <Label 
                                htmlFor={`size-${size}`}
                                className={`border rounded-md px-4 py-2 cursor-pointer ${selectedSize === size ? 'border-primary bg-primary/10' : ''} ${!availableSizes.includes(size as 'S' | 'M' | 'L' | 'XL') ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {size}
                            </Label>
                        </div>
                    ))}
                  </RadioGroup>
              </div>
  
              <Button onClick={handleAddToCart} size="lg" className="w-full mt-6">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
            <h2 className="text-2xl font-bold font-headline mb-6">Customer Reviews</h2>
            {reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="flex gap-4 border-b pb-6">
                            <Avatar>
                                <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{review.userName}</h3>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <StarRating rating={review.rating} size="sm" />
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-semibold">No reviews yet</h3>
                    <p className="text-muted-foreground mt-1">Be the first to review this product!</p>
                </div>
            )}
        </div>

      </div>
    );
}
