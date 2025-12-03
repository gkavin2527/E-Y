'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

export function MainNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/men', label: 'Men' },
    { href: '/women', label: 'Women' },
    { href: '/ai-stylist', label: 'AI Stylist' },
  ];

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.ModishLogo className="h-6 w-6" />
        <span className="font-bold font-headline">Modish</span>
      </Link>
      <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname.startsWith(link.href) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
