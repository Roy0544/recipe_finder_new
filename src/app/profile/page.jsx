'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Mail, Calendar, Plus, Heart, Utensils, Bookmark, Search } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import supabase from "@/config/client"
import RecipeCard from "@/components/recipe-card";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fetching, setFetching] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [userFavorites, setUserFavorites] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
    if(user){
      fetchUserData();
    }
  }, [user, loading, router]);

  const fetchUserData = async () => {
    setFetching(true);
    try {
      await Promise.all([
        fetchRecipes(),
        fetchLikedRecipes()
      ]);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setFetching(false);
    }
  };

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from('recipe')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setRecipes(data || []);
  };

  const fetchLikedRecipes = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select('recipe_id, recipe:recipe(*)')
      .eq('user_id', user.id);
    
    if(error) throw error;

    const favoriteIds = new Set(data.map(fav => fav.recipe_id));
    const fullRecipes = data.map(fav => fav.recipe).filter(Boolean);
    
    setUserFavorites(favoriteIds);
    setFavoriteRecipes(fullRecipes);
  };

  const handleFavoriteToggle = async (recipeId) => {
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
        setFavoriteRecipes(prev => prev.filter(r => r.id !== recipeId));
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: user.id, recipe_id: recipeId }]);

        if (error) throw error;
        
        const newFavs = new Set(userFavorites);
        newFavs.add(recipeId);
        setUserFavorites(newFavs);
        
        const { data: recipeData } = await supabase
          .from('recipe')
          .select('*')
          .eq('id', recipeId)
          .single();
        
        if (recipeData) {
          setFavoriteRecipes(prev => [recipeData, ...prev]);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : "Unknown";

  const avatarUrl = user.user_metadata.avatar_url;

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = favoriteRecipes.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12 overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Sidebar / User Info Card */}
          <div className="w-full md:w-80 shrink-0">
            <Card className="shadow-xl border-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl">
              <div className="h-24 bg-gradient-to-br from-primary/20 to-violet-500/20" />
              <CardHeader className="text-center pb-2 -mt-12">
                <div className="mx-auto mb-4">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarUrl} alt={user.user_metadata?.full_name || user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl font-black truncate">
                  {user.user_metadata?.full_name || user.email.split('@')[0]}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-1.5 font-medium">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <Separator className="bg-primary/5" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Member since {joinDate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                      <div className="text-xl font-black text-primary">{recipes.length}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Recipes</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                      <div className="text-xl font-black text-red-500">{favoriteRecipes.length}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Favorites</div>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/20" 
                  onClick={() => router.push('/upload-recipe')}
                >
                  <Plus className="h-5 w-5 mr-2" /> Create Recipe
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-4xl font-black tracking-tight">Your Activity</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search your collection..." 
                  className="pl-9 rounded-xl bg-card/50 backdrop-blur border-primary/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="my-recipes" className="w-full">
              <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8">
                <TabsTrigger value="my-recipes" className="rounded-xl px-6 py-2.5 font-bold data-active:shadow-md">
                  <Utensils className="h-4 w-4 mr-2" /> My Recipes
                </TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-xl px-6 py-2.5 font-bold data-active:shadow-md">
                  <Heart className="h-4 w-4 mr-2" /> Favorites
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-recipes" className="outline-none">
                {fetching ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                  </div>
                ) : filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredRecipes.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id}
                        recipe={recipe} 
                        isFavorite={userFavorites.has(recipe.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                        showUser={false}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<Utensils className="h-10 w-10" />}
                    title="No recipes yet"
                    description="You haven't shared any recipes with the community yet."
                    buttonText="Create Your First Recipe"
                    onButtonClick={() => router.push('/upload-recipe')}
                  />
                )}
              </TabsContent>

              <TabsContent value="favorites" className="outline-none">
                {fetching ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                  </div>
                ) : filteredFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFavorites.map((recipe) => (
                      <RecipeCard 
                        key={recipe.id}
                        recipe={recipe} 
                        isFavorite={userFavorites.has(recipe.id)}
                        onFavoriteToggle={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    icon={<Heart className="h-10 w-10" />}
                    title="No favorites yet"
                    description="Start exploring and save recipes you love to see them here."
                    buttonText="Explore Recipes"
                    onButtonClick={() => router.push('/home')}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description, buttonText, onButtonClick }) {
  return (
    <Card className="min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-primary/10 bg-primary/5 rounded-[2rem]">
      <div className="w-20 h-20 bg-background rounded-3xl flex items-center justify-center mb-6 shadow-sm text-primary/30">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">
        {description}
      </p>
      <Button onClick={onButtonClick} className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/10">
        {buttonText}
      </Button>
    </Card>
  );
}
