'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { planTrip, type TripPlannerOutput } from '@/ai/flows/trip-planner';
import { Loader2, Plane, Shirt, Footprints, Watch } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const tripPlannerSchema = z.object({
    destination: z.string().min(3, 'Please enter a valid destination.'),
    duration: z.coerce.number().int().min(1, 'Trip must be at least 1 day.').max(10, 'Trips longer than 10 days are not supported yet.'),
    style: z.enum(['casual', 'business', 'beach', 'adventurous'], {
        required_error: "You need to select a travel style.",
    }),
});

type TripPlannerFormValues = z.infer<typeof tripPlannerSchema>;

function ResultSkeleton() {
    return (
        <div className="mt-12 space-y-8 animate-pulse">
            <div className="text-center space-y-2">
                <div className="h-8 bg-muted rounded-md w-1/2 mx-auto"></div>
                <div className="h-4 bg-muted rounded-md w-3/4 mx-auto"></div>
            </div>
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="h-6 bg-muted rounded-md w-1/3"></div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-5 bg-muted rounded-md w-1/2"></div>
                            <div className="h-5 bg-muted rounded-md w-1/2"></div>
                            <div className="h-5 bg-muted rounded-md w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function TripResultDisplay({ result }: { result: TripPlannerOutput }) {
    return (
        <div className="mt-12 space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">{result.title}</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{result.introduction}</p>
            </div>

            <div className="space-y-6">
                {result.packingList.map((dayPlan) => (
                    <Card key={dayPlan.day} className="bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-xl">{dayPlan.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-muted-foreground">
                           <div className="flex items-center gap-4">
                                <Shirt className="h-5 w-5 text-primary" />
                                <span><span className="font-semibold text-foreground">Top:</span> {dayPlan.outfit.top}</span>
                           </div>
                           <div className="flex items-center gap-4">
                                <Footprints className="h-5 w-5 text-primary transform -rotate-90" />
                                <span><span className="font-semibold text-foreground">Bottom:</span> {dayPlan.outfit.bottom}</span>
                           </div>
                           <div className="flex items-center gap-4">
                                <Footprints className="h-5 w-5 text-primary" />
                                <span><span className="font-semibold text-foreground">Footwear:</span> {dayPlan.outfit.footwear}</span>
                           </div>
                           {dayPlan.outfit.accessory && (
                                <div className="flex items-center gap-4">
                                    <Watch className="h-5 w-5 text-primary" />
                                    <span><span className="font-semibold text-foreground">Accessory:</span> {dayPlan.outfit.accessory}</span>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}


export default function TripPlannerPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TripPlannerOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<TripPlannerFormValues>({
        resolver: zodResolver(tripPlannerSchema),
        defaultValues: {
            destination: '',
            duration: 5,
        },
    });

    const onSubmit = async (data: TripPlannerFormValues) => {
        setIsLoading(true);
        setResult(null);
        try {
            const response = await planTrip(data);
            setResult(response);
        } catch (error) {
            console.error('Trip planner error:', error);
            toast({
                variant: 'destructive',
                title: 'Something went wrong',
                description: 'We couldn\'t generate your trip plan. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center">
                <Plane className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-4xl font-bold font-headline mt-4">AI Trip Planner</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Tell us about your next trip, and we'll pack your bags for you (virtually).
                </p>
            </div>
            
            <Card className="mt-8">
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6 items-end">
                            <FormField
                                control={form.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Paris, France" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (days)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="style"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Travel Style</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your style" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="casual">Casual</SelectItem>
                                                <SelectItem value="business">Business</SelectItem>
                                                <SelectItem value="beach">Beach</SelectItem>
                                                <SelectItem value="adventurous">Adventurous</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="md:col-span-3 text-center">
                                <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</> : 'Create My Packing List'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {isLoading && <ResultSkeleton />}
            {result && <TripResultDisplay result={result} />}
        </div>
    );
}
