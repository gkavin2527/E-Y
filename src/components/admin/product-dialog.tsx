'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0.01, 'Price must be positive.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  gender: z.enum(['men', 'women']),
  category: z.string().min(2, 'Category is required.'),
  sizes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one size.',
  }),
  images: z.array(z.string().url({ message: 'Please enter a valid URL.' })).min(1, 'Please add at least one image URL.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product?: Product;
}

const allSizes = ['S', 'M', 'L', 'XL'];

export function ProductDialog({ isOpen, setIsOpen, product }: ProductDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      gender: 'women',
      category: '',
      sizes: [],
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        gender: product.gender,
        category: product.category,
        sizes: product.sizes,
        images: product.images,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        gender: 'women',
        category: '',
        sizes: [],
        images: [],
      });
    }
  }, [product, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore) return;
    setIsSaving(true);
    try {
      if (product) {
        // Update existing product
        const productRef = doc(firestore, 'products', product.id);
        await setDoc(productRef, { ...data, rating: product.rating || 5 }, { merge: true });
        toast({ title: 'Success', description: 'Product updated successfully.' });
      } else {
        // Create new product
        const productsCollection = collection(firestore, 'products');
        await addDoc(productsCollection, { ...data, rating: 5 }); // Add default rating
        toast({ title: 'Success', description: 'Product created successfully.' });
      }
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!firestore || !product) return;
    setIsDeleting(true);
    try {
        const productRef = doc(firestore, 'products', product.id);
        await deleteDoc(productRef);
        toast({ title: 'Success', description: 'Product deleted successfully.' });
        setIsOpen(false);
    } catch (error: any) {
        console.error('Error deleting product:', error);
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsDeleting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Edit the details of your product.' : 'Fill in the details to create a new product.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="stock" render={({ field }) => (
                        <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                        </SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="men">Men</SelectItem><SelectItem value="women">Women</SelectItem></SelectContent>
                        </Select><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} placeholder="e.g. topwear" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="sizes" render={() => (
                    <FormItem>
                        <FormLabel>Sizes</FormLabel>
                        <div className="flex gap-4">
                        {allSizes.map((size) => (
                            <FormField key={size} control={form.control} name="sizes" render={({ field }) => (
                                <FormItem key={size} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(size)}
                                        onCheckedChange={(checked) => {
                                            return checked ? field.onChange([...field.value, size]) : field.onChange(field.value?.filter((value) => value !== size));
                                        }}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">{size}</FormLabel>
                                </FormItem>
                            )} />
                        ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              <div>
                <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormDescription>
                        Add links to your product images. You can host them on services like Imgur or a cloud provider.
                    </FormDescription>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <FormField
                                    control={form.control}
                                    name={`images.${index}`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input {...field} placeholder="https://example.com/image.png" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                            </div>
                        ))}
                         <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append("")}
                        >
                            Add Image URL
                        </Button>
                    </div>
                </FormItem>
              </div>
            </div>
            <DialogFooter className="pt-4">
              {product && <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>}
              <Button type="submit" disabled={isSaving} className="ml-auto">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
