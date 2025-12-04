
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


function NewArrivalsSkeleton() {
  return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4]" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
              </div>
          ))}
      </div>
  )
}

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-1');
  const menCollectionImage = PlaceHolderImages.find(p => p.id === 'collection-men');
  const womenCollectionImage = PlaceHolderImages.find(p => p.id === 'collection-women');
  
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), limit(8));
  }, [firestore]);
  
  const { data: newArrivals, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="space-y-12 -mt-8">
      <section className="relative h-[60vh] w-full -mx-4">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Fashionable model"
            fill
            className="object-cover"
            data-ai-hint={heroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold">Effortless Style, Delivered</h1>
          <p className="mt-4 max-w-2xl text-lg">
            Discover curated collections of modern essentials. Quality craftsmanship for your everyday wardrobe.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/shop/women">Shop Now</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold text-center">Shop Collections</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/shop/men" className="group">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-96">
                  {menCollectionImage && (
                    <Image
                      src={menCollectionImage.imageUrl}
                      alt="Men's Collection"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={menCollectionImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-4xl font-headline text-white font-semibold">Men</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/shop/women" className="group">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-96">
                   {womenCollectionImage && (
                    <Image
                      src={womenCollectionImage.imageUrl}
                      alt="Women's Collection"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={womenCollectionImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-4xl font-headline text-white font-semibold">Women</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-bold text-center">New Arrivals</h2>
        <div className="mt-8">
          {isLoading && <NewArrivalsSkeleton />}
          {!isLoading && newArrivals && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/shop/women">View All</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
