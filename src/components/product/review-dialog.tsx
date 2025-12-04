
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productName: string;
  productImage: string;
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
}

export function ReviewDialog({ isOpen, setIsOpen, productName, productImage, onSubmit }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    const success = await onSubmit(rating, comment);
    setIsSubmitting(false);
    if (success) {
      setIsOpen(false);
      // Reset state for next time
      setRating(0);
      setComment('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your thoughts on the product you purchased.</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 my-4">
            <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                <Image src={productImage} alt={productName} fill className="object-cover" />
            </div>
            <p className="font-medium">{productName}</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Your Rating</label>
                <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <Star
                                key={starValue}
                                className={cn(
                                    'h-8 w-8 cursor-pointer',
                                    (hoverRating || rating) >= starValue ? 'text-primary fill-primary' : 'text-muted-foreground/50'
                                )}
                                onMouseEnter={() => setHoverRating(starValue)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setRating(starValue)}
                            />
                        )
                    })}
                </div>
            </div>

             <div>
                <label htmlFor="comment" className="text-sm font-medium">Your Review</label>
                <Textarea
                    id="comment"
                    placeholder="What did you like or dislike?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-2"
                />
            </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
