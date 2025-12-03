'use client';

import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function SearchGridSkeleton() {
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQuery);

  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !debouncedSearchTerm) return null;
    const productsRef = collection(firestore, 'products');
    // Firestore doesn't support case-insensitive full-text search natively.
    // This query is a basic approximation. For real search, use a dedicated service like Algolia or Typesense.
    return query(productsRef, 
      where('name', '>=', debouncedSearchTerm),
      where('name', '<=', debouncedSearchTerm + '\uf8ff')
    );
  }, [firestore, debouncedSearchTerm]);

  const { data: filteredProducts, isLoading } = useCollection<Product>(productsQuery);

  useEffect(() => {
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <form action="/search" method="GET" className="w-full max-w-xl relative">
          <Input
            type="search"
            name="q"
            placeholder="Search for products..."
            className="h-12 pl-12 pr-4 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </form>
      </div>

      <div>
        {debouncedSearchTerm ? (
          <h1 className="text-2xl font-bold mb-6">
            Search results for &quot;{debouncedSearchTerm}&quot;
            {!isLoading && filteredProducts && (
              <span className="text-muted-foreground font-normal text-lg ml-2">({filteredProducts.length} results)</span>
            )}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold mb-6">Search for products</h1>
        )}

        {isLoading && <SearchGridSkeleton />}

        {!isLoading && filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        {!isLoading && debouncedSearchTerm && (!filteredProducts || filteredProducts.length === 0) && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">
                We couldn&apos;t find any products matching your search.
              </p>
            </div>
        )}
         {!debouncedSearchTerm && !isLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Enter a search term above to find products.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
