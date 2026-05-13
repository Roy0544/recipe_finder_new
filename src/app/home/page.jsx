"use client"
import { DotPattern } from '@/components/ui/dot-pattern'
import React from 'react'
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { KineticText } from '@/components/ui/kinetic-text';

const page = () => {
    const { user, loading } = useAuth();
  const router = useRouter();
    useEffect(() => {
    if (!loading && !user) {
      // router.push("/auth");  
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div>
        
        <DotPattern/>
         <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 gap-6">
      <main className="text-center space-y-4">
        <div className="flex justify-center items-center gap-4">

        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
          Welcome to
        </h1>
        
        <KineticText 
          text="Recipe Finder" 
          as="h2" 
          className="text-6xl lg:text-8xl font-bold text-primary text-violet-700"
        />
        
        </div>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          You are logged in as <span className="font-semibold text-foreground">{user?.email}</span>. 
          Start exploring thousands of recipes or save your own!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-lg mb-2">Search Recipes</h3>
            <p className="text-sm text-muted-foreground">Find the perfect meal by ingredients or name.</p>
          </div>
          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-lg mb-2">My Collection</h3>
            <p className="text-sm text-muted-foreground">Access all your saved recipes in one place.</p>
          </div>
          <div className="p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="font-bold text-lg mb-2">Add New</h3>
            <p className="text-sm text-muted-foreground">Share your own culinary creations with the world.</p>
          </div>
        </div>
      </main>
    </div>
    </div>
  )
}

export default page