"use client"
import { DotPattern } from '@/components/ui/dot-pattern'
import React, { useState, useEffect } from 'react'
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Heart, 
  Bookmark, 
  Clock, 
  Users, 
  Utensils, 
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { KineticText } from '@/components/ui/kinetic-text';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from "framer-motion";
import supabase from '@/config/client';

const HomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('recipe')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      {/* Hero Section */}
      <div className="relative z-10 min-h-[60vh] flex flex-col items-center justify-center p-8 gap-6 pt-24">
        <main className="text-center space-y-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
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
            {user ? (
              <>
                You are logged in as <span className="font-semibold text-foreground">{user?.email}</span>. 
                Start exploring thousands of recipes or save your own!
              </>
            ) : (
              "Discover, share, and save your favorite recipes from around the world."
            )}
          </p>
        </main>
      </div>

      {/* Community Feed Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Community Recipes</h2>
            <p className="text-muted-foreground">Discover what others are cooking today.</p>
          </div>
          <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/5">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {recipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group h-full overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-sm flex flex-col">
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {recipe.image_url ? (
                        <img 
                          src={recipe.image_url} 
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Utensils className="h-12 w-12 opacity-20" />
                        </div>
                      )}
                      
                      {/* Overlay Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                         <Button 
                           size="icon" 
                           variant="secondary" 
                           className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-muted-foreground hover:text-red-500 transition-colors"
                         >
                           <Heart className="h-4 w-4" />
                         </Button>
                         <Button 
                           size="icon" 
                           variant="secondary" 
                           className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-muted-foreground hover:text-primary transition-colors"
                         >
                           <Bookmark className="h-4 w-4" />
                         </Button>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                         <Button 
                           variant="secondary" 
                           size="sm" 
                           className="rounded-full w-full bg-white/20 backdrop-blur text-white border-white/20 hover:bg-white/30"
                           onClick={() => router.push(`/recipe/${recipe.id}`)}
                         >
                           View Details <ChevronRight className="h-4 w-4 ml-1" />
                         </Button>
                      </div>
                    </div>

                    <CardHeader className="p-5 pb-2">
                      <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
                        {recipe.description}
                      </p>
                    </CardHeader>

                    <CardContent className="p-5 pt-2 pb-4 flex-grow">
                      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-md">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {recipe.cook_time || "N/A"}m
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/5 rounded-md">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          {recipe.servings || "N/A"}
                        </div>
                      </div>
                    </CardContent>
                    
                    <Separator className="bg-primary/5" />
                    
                    <CardFooter className="p-4 px-5 flex justify-between items-center bg-muted/20">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/80">
                          By Chef
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          <Heart className="h-3 w-3" /> 0
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                          <MessageSquare className="h-3 w-3" /> 0
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!fetching && recipes.length === 0 && (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-primary/10">
            <Utensils className="h-12 w-12 text-primary/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No recipes found yet</h3>
            <p className="text-muted-foreground mt-2">Be the first to share a masterpiece!</p>
            <Button className="mt-6 rounded-full px-8" onClick={() => router.push('/upload-recipe')}>
              Upload Recipe
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage