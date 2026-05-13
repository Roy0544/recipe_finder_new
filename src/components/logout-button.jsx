'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import supabase from '@/config/client';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout} 
      disabled={loading}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {loading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
