'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LogoutButton from './logout-button';
import { UtensilsCrossed } from 'lucide-react';

export default function Navbar() {
  const { user, loading } = useAuth();

  // if (loading || !user) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary transition-colors">
          <UtensilsCrossed className="h-6 w-6" />
          <span>Recipe Finder</span>
        </Link>

       {user? <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/recipes" className="text-sm font-medium hover:text-primary transition-colors">
            My Recipes
          </Link>
          <Link href="/favorites" className="text-sm font-medium hover:text-primary transition-colors">
            Favorites
          </Link>
        </div>:null}
{user? <div className="flex items-center gap-4">
          
          <div className="hidden sm:flex flex-col items-end mr-2">
            
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <span className="text-xs font-medium truncate max-w-[150px]">{user.email}</span>
          </div>
          <LogoutButton />
        </div>:<Link href="/auth">
          Login
        </Link>}
        {/* <div className="flex items-center gap-4">
          
          <div className="hidden sm:flex flex-col items-end mr-2">
            
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <span className="text-xs font-medium truncate max-w-[150px]">{user.email}</span>
          </div>
          <LogoutButton />
        </div> */}
      </div>
    </nav>
  );
}
