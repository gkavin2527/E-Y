'use client';

import { MainNav } from './main-nav';
import { Button } from '../ui/button';
import { useCart } from '@/hooks/use-cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CartSheet } from '../cart-sheet';
import Link from 'next/link';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User as UserIcon, LogOut, Package, UserCircle, Shield } from 'lucide-react';


const SearchDialog = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
      setQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search" className="relative group">
          <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Search Products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                name="q" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..." 
                className="pl-10"
                autoFocus 
              />
            </div>
            <Button type="submit" size="lg" disabled={!query.trim()}>
              Search
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UserButton = () => {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const adminDocRef = useMemoFirebase(
      () => (firestore && user ? doc(firestore, 'admins', user.uid) : null),
      [firestore, user]
    );
    const { data: adminDoc } = useDoc(adminDocRef);
  
    const handleLogout = async () => {
      if (!auth) return;
      try {
        await signOut(auth);
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
      } catch (error) {
        console.error('Logout Error:', error);
        toast({
          variant: 'destructive',
          title: 'Logout Failed',
          description: 'There was a problem logging you out.',
        });
      }
    };
  
    const getInitials = () => {
      if (user?.displayName) {
        return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
      if (user?.email) {
        return user.email[0].toUpperCase();
      }
      return 'U';
    };

    if (isUserLoading) {
        return (
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted border-2 border-border" />
        );
    }

    if (!user) {
        return (
            <Button variant="ghost" size="icon" aria-label="Login" className="group" asChild>
                <Link href="/login">
                  <UserIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User Profile" className="relative group">
                    <Avatar className="h-9 w-9 border-2 border-transparent transition-all group-hover:border-primary">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "user photo"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {adminDoc && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className='flex items-center gap-2 cursor-pointer'>
                        <Shield className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/account/profile" className='flex items-center gap-2 cursor-pointer'>
                      <UserCircle className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/orders" className='flex items-center gap-2 cursor-pointer'>
                      <Package className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);
  
    useEffect(() => {
      setHasMounted(true);
    }, []);
  
    if (!hasMounted) {
      return null;
    }
  
    return <>{children}</>;
}


export function SiteHeader() {
  const { totalItems } = useCart();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center">
          {/* Left Section - Logo */}
          <div className="flex w-1/4 items-center">
            <Link href="/" className="group flex items-center gap-2 shrink-0">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-md transition-transform group-hover:scale-105">
                  <span className="text-xl font-black text-primary-foreground">E</span>
                  <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-yellow-400 shadow-sm animate-pulse" />
                </div>
                <span className="hidden sm:inline-block text-2xl font-bold font-headline tracking-wide bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  E&Y
                </span>
            </Link>
          </div>

          {/* Center Section - Navigation */}
          <div className="flex flex-1 justify-center">
            <MainNav />
          </div>

          {/* Right Section - Actions */}
          <div className="flex w-1/4 items-center justify-end gap-1">
            <SearchDialog />
            <UserButton />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative group">
                  <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-lg ring-2 ring-background animate-in zoom-in-50">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="text-xl font-semibold">Shopping Cart</SheetTitle>
                </SheetHeader>
                <CartSheet />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}