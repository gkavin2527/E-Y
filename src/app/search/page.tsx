'use client';

import { useSearchParams } from 'next/navigation';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

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
        {query ? (
          <h1 className="text-2xl font-bold mb-6">
            Search results for &quot;{query}&quot;
            <span className="text-muted-foreground font-normal text-lg ml-2">({filteredProducts.length} results)</span>
          </h1>
        ) : (
          <h1 className="text-2xl font-bold mb-6">Search for products</h1>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          query && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold">No products found</h2>
              <p className="text-muted-foreground mt-2">
                We couldn&apos;t find any products matching your search.
              </p>
            </div>
          )
        )}
         {!query && (
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
