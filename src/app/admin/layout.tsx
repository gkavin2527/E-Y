'use client';

import { MainNav } from '@/components/admin/main-nav';
import { UserButton } from '@/components/admin/user-button';
import { AdminAuthGuard } from '@/components/admin/admin-auth-guard';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <MainNav />
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <form className="ml-auto flex-1 sm:flex-initial">
              {/* Not implemented */}
            </form>
            <UserButton />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
