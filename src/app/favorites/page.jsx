"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { DotPattern } from '@/components/ui/dot-pattern'
import { KineticText } from '@/components/ui/kinetic-text'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Heart, 
  Search, 
  Utensils, 
  Clock, 
  Users, 
  ChevronRight, 
  Bookmark, 
  ArrowLeft,
  Filter,
  Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import supabase from '@/config/client'

const FavoritesPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
    const { user, loading: authLoading } = useAuth();
      const [fetching, setFetching] = useState(true);
      const [recipes, setRecipes] = useState([]);
    
    useEffect(() => {
        if (!authLoading && !user) {
          router.push("/auth");
          return;
        }
    
        if (user) {
          fetchLikedRecipes(user);
          
        }
      }, [user, authLoading, router]);

      const fetchLikedRecipes = async (user) => {
    setFetching(true);
    try {
      const { data, error } = await supabase
      .from('favorites')
      .select(`
        recipe_id,
        recipe:recipe_id (
          id,
          title,
          description,
          category,
          image_url,
          user_Name,
          cook_time,
          servings
        )
      `)
      .eq('user_id', user.id); 

      if (error) throw error;
      const likedRecipes = data.map(fav => fav.recipe);
    setRecipes(likedRecipes || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;

      // Update local state to remove the recipe
      setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };
  
  const handleFavoriteChange = async (recipeId) => {
    if (!user) return;
  
    const isAlreadyFavorited = favoriteIds.includes(recipeId);
  
    // Optimistic UI update: Toggle immediately on screen for smooth performance
    if (isAlreadyFavorited) {
      setFavoriteIds(prev => prev.filter(id => id !== recipeId));
    } else {
      setFavoriteIds(prev => [...prev, recipeId]);
    }
  
    try {
      if (isAlreadyFavorited) {
        // Remove from database
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
          
        if (error) throw error;
      } else {
        // Add to database
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, recipe_id: recipeId }]);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      // Revert state change if the network request fails
      fetchUserFavorites();
    }
  };

  // Mock favorites data for the skeleton/design
  

  const filteredFavorites = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-24 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                My
              </h1>
              <KineticText 
                text="Favorites" 
                as="h2" 
                className="text-5xl lg:text-7xl font-bold text-violet-700"
              />
            </div>
            <p className="text-xl text-muted-foreground max-w-lg">
              Your hand-picked collection of culinary inspirations and go-to meals.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="rounded-full h-12 px-6 border-primary/10 bg-card/50 backdrop-blur hover:bg-primary/5"
              onClick={() => router.push('/home')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Explore
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search within your favorites..." 
            className="pl-12 h-14 bg-card/50 backdrop-blur-xl border-primary/10 rounded-2xl text-lg shadow-inner focus:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Results Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              Saved Recipes
            </h3>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Sort by: Recent
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredFavorites.length > 0 ? (
                filteredFavorites.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="group h-full overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-sm flex flex-col rounded-3xl">
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        {recipe.image_url ? (
                          <Image 
                            src={recipe.image_url} 
                            alt={recipe.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-violet-500/5">
                            <Utensils className="h-16 w-16 opacity-10" />
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-violet-600/90 backdrop-blur text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {recipe.category}
                          </span>
                        </div>
                        
                        {/* Overlay Buttons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                           <Button 
                             size="icon" 
                             variant="secondary" 
                             className="h-10 w-10  relative z-20 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-red-500 transition-colors"
                             onClick={() => handleRemoveFavorite(recipe.id)}
                           >
                             <Heart className="h-5 w-5 fill-red-500" />
                           </Button>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                           <Button 
                             variant="secondary" 
                             size="sm" 
                             className="rounded-full w-full bg-white/20 backdrop-blur text-white border-white/20 hover:bg-white/30 font-bold"
                             onClick={() => router.push(`/recipe/${recipe.id}`)}
                           >
                             View Recipe <ChevronRight className="h-4 w-4 ml-1" />
                           </Button>
                        </div>
                      </div>

                      <CardHeader className="p-6 pb-2">
                        <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          {recipe.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 min-h-[40px]">
                          {recipe.description}
                        </p>
                      </CardHeader>

                      <CardContent className="p-6 pt-2 pb-4 flex-grow">
                        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-xl">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {recipe.cook_time}m
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/5 rounded-xl">
                            <Users className="h-3.5 w-3.5 text-blue-500" />
                            {recipe.servings} Servings
                          </div>
                        </div>
                      </CardContent>
                      
                      <Separator className="bg-primary/5" />
                      
                      <CardFooter className="p-4 px-6 flex justify-between items-center bg-muted/10">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-primary flex items-center justify-center shadow-inner">
                            <span className="text-[10px] font-black text-white">{recipe.user_Name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground">
                            {recipe.user_Name}
                          </span>
                        </div>
                        {/* <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/5">
                           <Bookmark className="h-4 w-4 text-muted-foreground" />
                        </Button> */}
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-24 flex flex-col items-center justify-center bg-card/30 backdrop-blur rounded-[3rem] border-2 border-dashed border-primary/10 text-center space-y-6">
                  <div className="relative">
                    <Heart className="h-20 w-20 text-primary/10 fill-primary/5" />
                    <Utensils className="absolute inset-0 m-auto h-8 w-8 text-primary/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">No favorites found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {searchQuery ? `No recipes matching "${searchQuery}" in your favorites.` : "You haven't saved any recipes yet. Start exploring and click the heart icon to build your collection!"}
                    </p>
                  </div>
                  <Button 
                    className="rounded-full px-8 bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20 transition-all font-bold h-12"
                    onClick={() => router.push('/home')}
                  >
                    Start Exploring
                  </Button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FavoritesPage
