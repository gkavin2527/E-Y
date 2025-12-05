
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { styleItem, type StyleItemOutput } from '@/ai/flows/style-item';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface StyleDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productName: string;
  productImage: string;
}

function StyleResultSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="h-5 bg-muted rounded w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function StyleDialog({ isOpen, setIsOpen, productName, productImage }: StyleDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<StyleItemOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const getStyleSuggestions = async () => {
        setIsLoading(true);
        setResult(null);
        try {
          const response = await styleItem({ productName });
          setResult(response);
        } catch (error) {
          console.error("Styling error:", error);
          toast({
            variant: "destructive",
            title: "Styling Failed",
            description: "Could not generate style suggestions. Please try again.",
          });
          // Close the dialog on error
          setIsOpen(false);
        } finally {
          setIsLoading(false);
        }
      };
      getStyleSuggestions();
    }
  }, [isOpen, productName, setIsOpen, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Styling for: {productName}
          </DialogTitle>
          <DialogDescription>
            Here are a few ideas on how to style your {productName}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 my-4">
            <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <p className="font-medium">This is your core item. Let's build outfits around it.</p>
        </div>

        <div>
            {isLoading && <StyleResultSkeleton />}
            {result && (
                 <div className="space-y-4">
                    {result.outfits.map((outfit, index) => (
                        <Card key={index}>
                             <CardHeader>
                                <CardTitle className="text-lg">{outfit.name}</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-2">
                                <p className="text-sm text-muted-foreground">{outfit.description}</p>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {outfit.items.map((item, itemIndex) => (
                                        <Badge key={itemIndex} variant="secondary">{item}</Badge>
                                    ))}
                                </div>
                             </CardContent>
                        </Card>
                    ))}
                 </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
