'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { generateImage, saveImages } from '@/ai/flows/generate-image-flow';
import { Loader2, Wand2 } from 'lucide-react';

export default function ImageStudioPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImagePlaceholder[]>(PlaceHolderImages);

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please enter a description for the image you want to generate.',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const result = await generateImage(prompt);
      if (result.media) {
        setGeneratedImage(result.media);
      } else {
        throw new Error('Image generation failed to return media.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description: 'There was an error generating the image. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!generatedImage || !prompt) return;

    const newImage: ImagePlaceholder = {
      id: `gen-${Date.now()}`,
      imageUrl: generatedImage,
      description: prompt,
      imageHint: prompt.split(' ').slice(0, 2).join(' '),
      prompt: prompt,
    };
    
    try {
        await saveImages([...images, newImage]);
        setImages(prev => [...prev, newImage]);
        toast({
            title: 'Image Saved',
            description: 'The generated image has been added to your library.',
        });
        setGeneratedImage(null);
        setPrompt('');
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Failed to Save Image',
            description: 'There was an error saving the image to your library.',
        });
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>AI Image Generator</CardTitle>
          <CardDescription>
            Describe the product image you want to create. Be specific for the best results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g., A stylish men's leather jacket on a mannequin, studio lighting, white background."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>

          {isGenerating && (
            <div className="rounded-lg border bg-muted w-full aspect-square flex items-center justify-center">
                <div className='text-center text-muted-foreground'>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className='mt-2'>Generating image...</p>
                </div>
            </div>
          )}

          {generatedImage && (
            <div className="space-y-4">
                <CardTitle className='text-lg'>Generated Image</CardTitle>
              <div className="rounded-lg border bg-muted w-full aspect-square relative overflow-hidden">
                <Image src={generatedImage} alt={prompt} fill className="object-contain" />
              </div>
              <Button onClick={handleAddToLibrary} className="w-full">
                Add to Image Library
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Image Library</CardTitle>
          <CardDescription>
            These images are available when creating or editing products.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={image.imageUrl}
                    alt={image.description || 'product image'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-xs truncate">{image.prompt || image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
