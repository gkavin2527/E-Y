import { notFound } from 'next/navigation';
import { products, categories, genders } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: { gender: string; category: string } }) {
  const { gender: genderSlug, category: categorySlug } = params;

  const gender = genders.find(g => g.slug === genderSlug);
  const category = categories[genderSlug]?.find(c => c.slug === categorySlug);

  if (!gender || !category) {
    notFound();
  }

  const categoryProducts = products.filter(
    p => p.gender === genderSlug && p.category === categorySlug
  );

  return (
    <div>
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={`/${gender.slug}`}>{gender.name}</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{category.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      
      <h1 className="text-3xl font-bold font-headline mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">{`Browse our collection of ${category.name.toLowerCase()} for ${gender.name.toLowerCase()}.`}</p>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No products found</h2>
            <p className="text-muted-foreground mt-2">Check back later or browse other categories.</p>
        </div>
      )}
    </div>
  );
}
