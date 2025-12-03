import { notFound } from 'next/navigation';
import { categories, genders } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function GenderPage({ params }: { params: { gender: string } }) {
  const { gender } = params;

  if (!genders.some(g => g.slug === gender)) {
    notFound();
  }

  const genderCategories = categories[gender];
  const genderHeroImage = PlaceHolderImages.find(p => p.id === `collection-${gender}`);

  return (
    <div className="space-y-12">
      <section className="relative h-[40vh] w-full -mt-8 -mx-4">
        {genderHeroImage && (
          <Image
            src={genderHeroImage.imageUrl}
            alt={`${gender}'s Collection`}
            fill
            className="object-cover"
            data-ai-hint={genderHeroImage.imageHint}
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-headline font-bold text-white capitalize">{gender}</h1>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {genderCategories.map(category => {
            const categoryImage = PlaceHolderImages.find(p => p.id === category.image);
            return (
              <Link href={`/${gender}/${category.slug}`} key={category.slug} className="group">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                      {categoryImage && (
                        <Image
                          src={categoryImage.imageUrl}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={categoryImage.imageHint}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold flex items-center justify-between">
                        {category.name}
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
