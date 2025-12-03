import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  prompt?: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
