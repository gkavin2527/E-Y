import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const productImage = PlaceHolderImages.find((p) => p.id === product.images[0]);

  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4] overflow-hidden">
            {productImage ? (
              <Image
                src={productImage.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                data-ai-hint={productImage.imageHint}
              />
            ) : (
                <div className="bg-muted w-full h-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                </div>
            )}
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-medium text-sm flex-grow">{product.name}</h3>
            <p className="font-semibold mt-2">${product.price.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
