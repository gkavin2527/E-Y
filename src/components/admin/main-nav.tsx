
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { Button } from '../ui/button';

const navLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
];

export function MainNav() {
  const pathname = usePathname();

  const renderLink = (link: typeof navLinks[0]) => {
    return (
        <Link
            key={link.href}
            href={link.href}
            className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === link.href && 'bg-muted text-primary'
            )}
        >
            {link.label}
        </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
                Menu
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                    href="/"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                    T
                    <span className="sr-only">Threads</span>
                </Link>
                {navLinks.map(renderLink)}
            </nav>
            </SheetContent>
        </Sheet>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <span>Threads Admin</span>
            </Link>
            {navLinks.map(renderLink)}
        </nav>
    </div>
  );
}
