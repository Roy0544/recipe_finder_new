"use client"
import { DotPattern } from '@/components/ui/dot-pattern'
import React, { useState, useEffect } from 'react'
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  ChevronRight,
  Utensils
} from "lucide-react";
import { KineticText } from '@/components/ui/kinetic-text';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from "framer-motion";
import supabase from '@/config/client';
import RecipeCard from '@/components/recipe-card';

const HomePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [userFavorites, setUserFavorites] = useState(new Set());

  useEffect(() => {
    fetchRecipes();
    if (user) {
      fetchUserFavorites();
    }
  }, [user]);

  const fetchUserFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserFavorites(new Set(data.map(fav => fav.recipe_id)));
    } catch (error) {
      console.error("Error fetching user favorites:", error);
    }
  };

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

  const handleFavoriteToggle = async (recipeId) => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const isCurrentlyFav = userFavorites.has(recipeId);
    
    try {
      if (isCurrentlyFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);

        if (error) throw error;
        
        const newFavs = new Set(userFavorites);
        newFavs.delete(recipeId);
        setUserFavorites(newFavs);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, recipe_id: recipeId }]);

        if (error) throw error;
        
        const newFavs = new Set(userFavorites);
        newFavs.add(recipeId);
        setUserFavorites(newFavs);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
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
                You are logged in as <span className="font-semibold text-foreground capitalize">{user?.user_metadata.name}</span>. 
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
            <h2 className="text-3xl font-bold tracking-tight">Latest Recipes</h2>
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
                  <RecipeCard 
                    recipe={recipe} 
                    isFavorite={userFavorites.has(recipe.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
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