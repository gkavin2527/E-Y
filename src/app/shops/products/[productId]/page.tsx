'use client';

import { useParams } from 'next/navigation';

export default function Test() { 
    const params = useParams();
    const productId = params.productId as string;
    
    return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center p-8 border rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-primary">Dynamic Product Route Works!</h1>
                <p className="mt-4 text-lg">The product ID from the URL is:</p>
                <p className="mt-2 text-xl font-mono bg-muted text-foreground p-2 rounded">{productId}</p>
            </div>
        </div>
    ); 
}
