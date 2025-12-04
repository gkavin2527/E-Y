

'use client';

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { generateProductDescriptions } from '@/ai/flows/generate-product-descriptions';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


const ProductRating = ({ rating }: { rating: number }) => {
    // This is a placeholder for a star rating component
    return (
        <div className="flex items-center">
            <span className="ml-2 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
        </div>
    );
};

function ProductPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-2/3 mb-8" />
       <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col-reverse md:flex-row gap-4">
                <div className="flex md:flex-col gap-2">
                    <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-lg" />
                    <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-lg" />
                    <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-lg" />
                </div>
                <div className="relative aspect-[3/4] flex-1 rounded-lg overflow-hidden">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
            <div className="space-y-6">
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <div className="space-y-4 rounded-lg border bg-accent/50 p-4">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-5 w-16 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full md:w-48" />
            </div>
       </div>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.productId as string;
  const firestore = useFirestore();

  const productDocRef = useMemoFirebase(() => {
    if (!firestore || !productId) return null;
    return doc(firestore, 'products', productId);
  }, [firestore, productId]);

  const { data: product, isLoading: isProductLoading } = useDoc<Product>(productDocRef);

  const relatedProductsQuery = useMemoFirebase(() => {
    if (!firestore || !product) return null;
    return query(
      collection(firestore, 'products'),
      where('category', '==', product.category),
      where('gender', '==', product.gender),
      where('__name__', '!=', product.id),
      limit(4)
    )
  }, [firestore, product]);

  const { data: relatedProducts, isLoading: areRelatedLoading } = useCollection<Product>(relatedProductsQuery);

  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState('');

  if (isProductLoading) {
    return <ProductPageSkeleton />;
  }
  
  if (!isProductLoading && !product) {
    notFound();
  }

  if (!product) {
    return <ProductPageSkeleton />;
  }
  
  const totalStock = Object.values(product.sizes).reduce((sum, q) => sum + q, 0);
  const isOnSale = typeof product.originalPrice === 'number' && product.originalPrice > product.price;


  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    if (product.sizes[selectedSize] === 0) {
      toast({
        title: 'Out of stock',
        description: `This size is currently unavailable.`,
        variant: 'destructive'
      });
      return;
    }
    addItem(product, selectedSize, 1);
    toast({
      title: 'Added to cart',
      description: `${product.name} (${selectedSize}) has been added to your cart.`,
    });
  };

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setAiDescription('');
    try {
        const result = await generateProductDescriptions({
            productName: product.name,
            searchHistory: "casual wear, summer fashion, comfortable tops" // Placeholder search history
        });
        setAiDescription(result.productDescription);
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Failed to generate description",
            description: "There was a problem generating the AI description."
        })
    } finally {
        setIsGenerating(false);
    }
  }

  const productImages = product.images || [];

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
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/shop/${product.gender}`}>{product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/shop/${product.gender}/${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col-reverse md:flex-row gap-4">
                <div className="flex md:flex-col gap-2">
                    {productImages.map((imgUrl, index) => (
                        <button key={index} onClick={() => setSelectedImage(index)} className={`relative h-20 w-20 md:h-24 md:w-24 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}>
                             <Image src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
                <div className="relative aspect-[3/4] flex-1 rounded-lg overflow-hidden">
                    {productImages[selectedImage] ? (
                         <Image src={productImages[selectedImage]} alt={product.name} fill className="object-cover" />
                    ) : <Skeleton className="h-full w-full" />}
                </div>
            </div>

            <div className="space-y-6">
                <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
                <div className="flex items-baseline gap-4">
                    <p className={`text-2xl font-semibold ${isOnSale ? 'text-destructive' : 'text-foreground'}`}>₹{product.price.toFixed(2)}</p>
                    {isOnSale && (
                        <p className="text-xl text-muted-foreground line-through">₹{product.originalPrice?.toFixed(2)}</p>
                    )}
                </div>
                <ProductRating rating={product.rating} />
                <p className="text-muted-foreground">{product.description}</p>

                <div className="space-y-4 rounded-lg border bg-accent/50 p-4">
                    <Button onClick={handleGenerateDescription} disabled={isGenerating} variant="outline" className="w-full bg-background hover:bg-background/90">
                        {isGenerating ? 'Generating...' : 'Generate AI Description'}
                    </Button>
                    {isGenerating && <p className="text-sm text-muted-foreground animate-pulse">Our fashion AI is crafting a description for you...</p>}
                    {aiDescription && (
                        <div className="prose prose-sm max-w-none text-accent-foreground">
                            <p>{aiDescription}</p>
                        </div>
                    )}
                </div>
                
                <div>
                    <h3 className="text-sm font-medium mb-2">Size</h3>
                    <RadioGroup
                        value={selectedSize}
                        onValueChange={(value) => setSelectedSize(value as any)}
                        className="flex gap-2"
                    >
                        {Object.entries(product.sizes).map(([size, stock]) => {
                            const isAvailable = stock > 0;
                            return (
                            <div key={size}>
                                <RadioGroupItem value={size} id={size} className="peer sr-only" disabled={!isAvailable} />
                                <Label
                                    htmlFor={size}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-md border text-sm cursor-pointer",
                                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground",
                                        isAvailable 
                                            ? "hover:bg-accent hover:text-accent-foreground" 
                                            : "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {size}
                                </Label>
                            </div>
                        )})}
                    </RadioGroup>
                </div>
                
                <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto" disabled={totalStock === 0}>
                    {totalStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>

                <p className="text-sm text-muted-foreground">
                    {totalStock > 10 ? 'In Stock' : totalStock > 0 ? `Low Stock - only ${totalStock} left!` : ''}
                </p>
            </div>
        </div>
        <div className="mt-24">
            <h2 className="text-2xl font-bold font-headline text-center mb-8">Related Products</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {areRelatedLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
                {relatedProducts && relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    </div>
  );
}


    