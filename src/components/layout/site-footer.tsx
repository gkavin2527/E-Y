import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';

export function SiteFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
                <Icons.ModishLogo className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl font-headline">Modish</span>
            </Link>
            <p className="text-sm text-muted-foreground">Effortless style for the modern individual.</p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="YouTube"><Youtube className="h-5 w-5 hover:text-primary transition-colors" /></Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/men" className="text-muted-foreground hover:text-primary">Men</Link></li>
              <li><Link href="/women" className="text-muted-foreground hover:text-primary">Women</Link></li>
              <li><Link href="/men/accessories" className="text-muted-foreground hover:text-primary">Accessories</Link></li>
              <li><Link href="/ai-stylist" className="text-muted-foreground hover:text-primary">AI Stylist</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Our Story</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Sustainability</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Join Our Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">Get 10% off your first order.</p>
            <form className="flex space-x-2">
              <Input type="email" placeholder="Enter your email" className="bg-background" />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Modish. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
