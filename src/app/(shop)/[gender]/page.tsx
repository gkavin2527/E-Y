import { notFound } from 'next/navigation';
import { categories, genders } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                  {categoryImage && (
                    <Image
                      src={categoryImage.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={categoryImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-headline text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/80 mt-1">{category.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
