
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, FileText } from 'lucide-react';

const accountNavLinks = [
  { href: '/account/profile', label: 'Profile', icon: User },
  { href: '/account/orders', label: 'Orders', icon: FileText },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            {accountNavLinks.map((link) => {
                const Icon = link.icon;
                return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  pathname === link.href && 'bg-accent text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
                )
            })}
          </nav>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}
