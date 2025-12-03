'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Users, LineChart, Image as ImageIcon } from 'lucide-react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
import { Button } from '../ui/button';
import { PanelLeft } from 'lucide-react';

const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/image-studio', label: 'AI Image Studio', icon: ImageIcon },
];

export function MainNav() {
  const pathname = usePathname();

  const renderLink = (link: typeof navLinks[0]) => {
    const Icon = link.icon;
    return (
        <Link
            key={link.href}
            href={link.href}
            className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === link.href && 'bg-muted text-primary'
            )}
        >
            <Icon className="h-4 w-4" />
            {link.label}
        </Link>
    )
  }

  return (
    <div className="flex items-center gap-4">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
                <Link
                    href="/"
                    className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                    <Icons.ModishLogo className="h-5 w-5 transition-all group-hover:scale-110" />
                    <span className="sr-only">Modish</span>
                </Link>
                {navLinks.map(renderLink)}
            </nav>
            </SheetContent>
        </Sheet>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Icons.ModishLogo className="h-6 w-6" />
                <span>Modish Admin</span>
            </Link>
            {navLinks.map(renderLink)}
        </nav>
    </div>
  );
}
