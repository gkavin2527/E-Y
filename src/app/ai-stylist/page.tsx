'use client';

import { useState } from 'react';
import { generateStyleRecommendations, StyleRecommendationsInput } from '@/ai/flows/generate-style-recommendations';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIStylistPage() {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      // Mock user data
      const mockUserInput: StyleRecommendationsInput = {
        browsingHistory: ['1', '5', '10'], // IDs of some products
        pastPurchases: ['2', '15'], // IDs of other products
        preferredStyles: 'Minimal, Casual',
      };

      const result = await generateStyleRecommendations(mockUserInput);
      
      if (result.recommendations && result.recommendations.length > 0) {
        const recommendedProducts = products.filter(p => result.recommendations.includes(p.id));
        setRecommendations(recommendedProducts);
      } else {
        // Fallback: show some random products if no recommendations
        const fallbackProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);
        setRecommendations(fallbackProducts);
      }
    } catch (e) {
      console.error(e);
      setError('Sorry, we couldn\'t generate recommendations at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold font-headline">Your Personal AI Stylist</h1>
        <p className="text-muted-foreground mt-4">
          Discover your next favorite outfit. Our AI analyzes your style to provide personalized recommendations.
          Tell us what you like, and we'll find pieces you'll love.
        </p>
      </div>

      <div className="text-center mt-8">
        <Button size="lg" onClick={getRecommendations} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Get My Style Recommendations'
          )}
        </Button>
      </div>

      {error && (
        <div className="text-center mt-8 text-destructive">
          <p>{error}</p>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-headline text-center mb-8">Just For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {recommendations.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {!isLoading && recommendations.length === 0 && !error && (
        <div className="mt-16">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>How it works</CardTitle>
                    <CardDescription>Our AI stylist gets smarter as you shop.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                        <h3 className="font-semibold">1. Browse & Shop</h3>
                        <p className="text-sm text-muted-foreground">Your activity helps us understand your taste.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">2. Get Recommendations</h3>
                        <p className="text-sm text-muted-foreground">Click the button to generate your unique style board.</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">3. Discover New Styles</h3>
                        <p className="text-sm text-muted-foreground">Find new items that perfectly match your wardrobe.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
