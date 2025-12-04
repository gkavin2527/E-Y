
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const firstImage = product.images?.[0];
  const isOnSale = typeof product.originalPrice === 'number' && product.originalPrice > product.price;
  const totalStock = Object.values(product.sizes || {}).reduce((sum, stock) => sum + stock, 0);
  const isSoldOut = totalStock === 0;

  return (
    <div className="group relative">
      <Link href={`/shops/products/${product.id}`}>
        <div className="overflow-hidden rounded-lg">
          <div className="relative aspect-[3/4] bg-muted">
            {!isSoldOut && isOnSale && (
              <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                Sale
              </Badge>
            )}
            {firstImage ? (
              <Image
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No image</span>
              </div>
            )}
             {isSoldOut && (
                <div className="absolute inset-0 bg-background/70 z-10 flex items-center justify-center">
                    <span className="text-destructive-foreground font-bold text-xl tracking-widest">SOLD OUT</span>
                </div>
            )}
          </div>
        </div>
      </Link>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="font-medium text-sm text-foreground truncate">
             <Link href={`/shops/products/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`font-semibold ${isOnSale ? 'text-destructive' : 'text-foreground'}`}>
              ₹{product.price.toFixed(2)}
            </p>
            {isOnSale && product.originalPrice && (
              <p className="font-semibold text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="icon" className="shrink-0" disabled={isSoldOut}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}
