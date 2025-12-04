
'use client';

import { notFound, useParams } from 'next/navigation';
import { categories, genders } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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

export default function CategoryPage() {
  const params = useParams();
  const genderSlug = params.gender as string;
  const categorySlug = params.category as string;

  const firestore = useFirestore();

  const gender = genders.find(g => g.slug === genderSlug);
  const category = categories[genderSlug]?.find(c => c.slug === categorySlug);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !genderSlug || !categorySlug) return null;
    return query(
        collection(firestore, 'products'), 
        where('gender', '==', genderSlug), 
        where('category', '==', categorySlug)
    );
  }, [firestore, genderSlug, categorySlug]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  if (!gender || !category) {
    notFound();
  }

  return (
    <div>
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
                        <Link href={`/shop/${gender.slug}`}>{gender.name}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{category.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      
      <h1 className="text-3xl font-bold font-headline mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">{`Browse our collection of ${category.name.toLowerCase()} for ${gender.name.toLowerCase()}.`}</p>

      {isLoading && <ProductGridSkeleton />}

      {!isLoading && products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : null}

      {!isLoading && (!products || products.length === 0) && (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="text-muted-foreground mt-2">Check back later or browse other categories.</p>
        </div>
      )}
    </div>
  );
}
