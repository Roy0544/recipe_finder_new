"use client"

import React, { useEffect, useState } from 'react'
import { DotPattern } from '@/components/ui/dot-pattern'
import { KineticText } from '@/components/ui/kinetic-text'
import { Input } from '@/components/ui/input'
import supabase from '@/config/client';
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  Utensils, 
  Plus,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import RecipeCard from '@/components/recipe-card'

const DiscoverPage = () => {
  const categories = [
    "Breakfast", "Lunch", "Dinner", "Dessert", 
    "Vegan", "Vegetarian", "Gluten-Free", "Quick & Easy"
  ];

  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All")
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchRecipes();
      fetchUserFavorites();
    }
  }, [user, authLoading, router]);

  const fetchUserFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setFavoriteIds(data.map(fav => fav.recipe_id));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchRecipes = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('recipe')
        .select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleFavoriteToggle = async (recipeId) => {
    if (!user) return;

    const isAlreadyFavorited = favoriteIds.includes(recipeId);

    // Optimistic UI update
    if (isAlreadyFavorited) {
      setFavoriteIds(prev => prev.filter(id => id !== recipeId));
    } else {
      setFavoriteIds(prev => [...prev, recipeId]);
    }

    try {
      if (isAlreadyFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, recipe_id: recipeId }]);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error("Failed to update favorite status:", error);
      fetchUserFavorites();
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-24 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Discover
            </h1>
            <KineticText 
              text="New Flavors" 
              as="h2" 
              className="text-5xl lg:text-7xl font-bold text-violet-700"
            />
          </div>
          <p className="text-xl text-muted-foreground">
            Search by ingredients you have or explore recipes by category.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto space-y-8 bg-card/50 backdrop-blur-md p-8 rounded-3xl border border-primary/10 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                onChange={(e)=>setSearchQuery(e.target.value)}
                placeholder="Enter ingredients (e.g., tomato, pasta, basil)..." 
                className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Filter className="h-4 w-4" />
              Filter by Category
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => setSelectedCategory("All")}
                variant={selectedCategory === "All" ? "default" : "outline"} 
                size="sm" 
                className={`rounded-full transition-all ${selectedCategory === "All" ? "bg-violet-600 hover:bg-violet-700 shadow-lg" : "border-primary/10 hover:border-primary/40 hover:bg-primary/5"}`}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"} 
                  size="sm" 
                  className={`rounded-full transition-all ${selectedCategory === category ? "bg-violet-600 hover:bg-violet-700 shadow-lg" : "border-primary/10 hover:border-primary/40 hover:bg-primary/5"}`}
                >
                  {category}
                </Button>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full text-primary hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 mr-1" /> Custom
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">
              {selectedCategory === "All" ? "Search Results" : `${selectedCategory} Recipes`}
            </h3>
            <p className="text-sm text-muted-foreground">Showing {filteredRecipes.length} recipes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fetching ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="h-[400px] animate-pulse bg-muted/20 border-primary/5 rounded-3xl" />
              ))
            ) : filteredRecipes.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {filteredRecipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RecipeCard 
                      recipe={recipe} 
                      isFavorite={favoriteIds.includes(recipe.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="col-span-full text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/10">
                <Utensils className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No recipes found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscoverPage
