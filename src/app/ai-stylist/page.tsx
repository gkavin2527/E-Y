'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateStyledImage } from '@/ai/flows/generate-styled-image';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AiStylistPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'products'), limit(50)) : null),
    [firestore]
  );

  const { data: products, isLoading: areProductsLoading } = useCollection<Product>(productsQuery);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProduct) {
      toast({
        variant: 'destructive',
        title: 'Please select a product first.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const result = await generateStyledImage({ product: selectedProduct });
      setGeneratedImage(result.media);
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: 'Sorry, something went wrong while creating the image. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">AI Virtual Stylist</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Select a product and let our AI generate a unique, styled image of a model wearing it.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mt-12">
        {/* Left Side: Controls */}
        <div className="flex flex-col items-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">1. Select a Product</h3>
                <Select
                  onValueChange={(value) => setSelectedProductId(value)}
                  disabled={areProductsLoading || isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={areProductsLoading ? 'Loading products...' : 'Choose a product'} />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                        <Image src={selectedProduct.images[0]} alt={selectedProduct.name} fill className="object-cover" />
                    </div>
                    <div>
                        <h4 className="font-semibold">{selectedProduct.name}</h4>
                        <p className="text-sm text-muted-foreground">{selectedProduct.category} for {selectedProduct.gender}</p>
                    </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">2. Generate Image</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will create a scene with a model wearing your selected item.
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedProductId || isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? <Loader2 className="animate-spin mr-2" /> : null}
                  {isGenerating ? 'Styling...' : 'Generate Virtual Model'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Image Display */}
        <div className="flex items-center justify-center">
            <Card className="aspect-[3/4] w-full max-w-md overflow-hidden bg-muted">
                <div className="relative w-full h-full flex items-center justify-center">
                    {isGenerating && (
                        <div className="flex flex-col items-center gap-4 text-primary">
                            <Loader2 className="h-12 w-12 animate-spin" />
                            <p className="font-medium">Our AI is creating your image...</p>
                        </div>
                    )}
                    {!isGenerating && generatedImage && (
                        <Image
                            src={generatedImage}
                            alt="AI generated model"
                            fill
                            className="object-cover"
                        />
                    )}
                     {!isGenerating && !generatedImage && (
                        <div className="text-center text-muted-foreground p-8">
                            <p>Your generated image will appear here.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
