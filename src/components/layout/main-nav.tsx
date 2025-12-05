
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/shops/men', label: 'Men' },
    { href: '/shops/women', label: 'Women' },
    { href: '/ai-stylist', label: 'AI Stylist' },
  ];

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
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
