
'use client';

import { MainNav } from './main-nav';
import { Button } from '../ui/button';
import { LogOut, Search, ShoppingBag, User } from 'lucide-react';
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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
import React from 'react';


const SearchDialog = () => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get('q') as string;
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    setOpen(false); // Close the dialog after search
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Search">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search for products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2">
            <Input name="q" placeholder="e.g. 'Classic Crewneck Tee'" autoFocus />
            <Button type="submit">Search</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function SiteHeader() {
  const { totalItems } = useCart();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`;
    }
    if (firstName) {
        return firstName[0];
    }
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('');
    }
    if(user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  }


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <SearchDialog />
            
            {isUserLoading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User Profile">
                     <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "user photo"} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/account/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
               <Button variant="ghost" size="icon" aria-label="Login" asChild>
                  <Link href="/login">
                    <User className="h-5 w-5" />
                  </Link>
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Shopping Cart" className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-primary-foreground bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>
                <CartSheet />
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
