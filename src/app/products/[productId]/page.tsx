
'use client';

import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Star, StarHalf, Sparkles } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { generateProductDescriptions } from '@/ai/flows/generate-product-descriptions';

const ProductRating = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="h-5 w-5 fill-primary text-primary" />
            ))}
            {halfStar && <StarHalf className="h-5 w-5 fill-primary text-primary" />}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground/50" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">({rating.toFixed(1)})</span>
        </div>
    );
};


export default function ProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  const product = products.find((p) => p.id === productId);

  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | undefined>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiDescription, setAiDescription] = useState('');


  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
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

  const productImages = product.images.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean);
  const relatedProducts = products.filter(p => p.category === product.category && p.gender === product.gender && p.id !== product.id).slice(0, 4);

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
                        <Link href={`/${product.gender}`}>{product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/${product.gender}/${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{product.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3 flex flex-col-reverse md:flex-row gap-4">
                <div className="flex md:flex-col gap-2">
                    {productImages.map((img, index) => img && (
                        <button key={img.id} onClick={() => setSelectedImage(index)} className={`relative h-20 w-20 md:h-24 md:w-24 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}>
                             <Image src={img.imageUrl} alt={`${product.name} thumbnail ${index + 1}`} fill className="object-cover" data-ai-hint={img.imageHint} />
                        </button>
                    ))}
                </div>
                <div className="relative aspect-[3/4] flex-1 rounded-lg overflow-hidden">
                    {productImages[selectedImage] && (
                         <Image src={productImages[selectedImage]!.imageUrl} alt={product.name} fill className="object-cover" data-ai-hint={productImages[selectedImage]!.imageHint} />
                    )}
                </div>
            </div>

            <div className="md:col-span-2 space-y-6">
                <h1 className="text-3xl font-bold font-headline">{product.name}</h1>
                <p className="text-2xl font-semibold">${product.price.toFixed(2)}</p>
                <ProductRating rating={product.rating} />
                <p className="text-muted-foreground">{product.description}</p>

                <div className="space-y-4 rounded-lg border bg-accent/50 p-4">
                    <Button onClick={handleGenerateDescription} disabled={isGenerating} variant="outline" className="w-full bg-background hover:bg-background/90">
                        <Sparkles className="mr-2 h-4 w-4" />
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
                        {product.sizes.map(size => (
                            <div key={size}>
                                <RadioGroupItem value={size} id={size} className="peer sr-only" />
                                <Label
                                    htmlFor={size}
                                    className="flex h-10 w-10 items-center justify-center rounded-md border text-sm cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                                >
                                    {size}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                
                <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto">Add to Cart</Button>

                <p className="text-sm text-muted-foreground">
                    {product.stock > 10 ? 'In Stock' : `Low Stock - only ${product.stock} left!`}
                </p>
            </div>
        </div>
        <div className="mt-24">
            <h2 className="text-2xl font-bold font-headline text-center mb-8">Related Products</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    </div>
  );
}
