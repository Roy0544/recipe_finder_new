'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Loader2, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Edit2, 
  Trash2, 
  ChevronRight,
  MoreVertical,
  Utensils
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import supabase from '@/config/client';

export default function MyRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      fetchRecipes();
    }
  }, [user, authLoading, router]);

  const fetchRecipes = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('recipe')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setFetching(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || (fetching && recipes.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12 overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">My Recipes</h1>
            <p className="text-muted-foreground text-lg">
              Manage and organize your personal culinary collection.
            </p>
          </div>
          <Button 
            size="lg" 
            className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group"
            onClick={() => router.push('/upload-recipe')}
          >
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Create New Recipe
          </Button>
        </div>

        <Separator className="bg-primary/10" />

        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search your recipes..." 
              className="pl-10 h-12 bg-card/50 backdrop-blur border-primary/10 rounded-xl focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 px-6 rounded-xl border-primary/10 bg-card/50 backdrop-blur">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <Card className="group overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-sm">
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className="rounded-full w-full"
                         onClick={() => router.push(`/recipe/${recipe.id}`)}
                       >
                         View Details <ChevronRight className="h-4 w-4 ml-1" />
                       </Button>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                       <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors">
                         <Edit2 className="h-3.5 w-3.5 text-primary" />
                       </Button>
                       <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-sm">
                         <Trash2 className="h-3.5 w-3.5" />
                       </Button>
                    </div>
                  </div>

                  <CardHeader className="p-5 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                        {recipe.title}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {recipe.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 pb-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-md">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {recipe.cook_time || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/5 rounded-md">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {recipe.servings || "N/A"} Servings
                      </div>
                    </div>
                  </CardContent>
                  
                  <Separator className="bg-primary/5" />
                  
                  <CardFooter className="p-4 px-5 flex justify-between items-center bg-muted/20">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                      Added {new Date(recipe.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                       <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State / Add New Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card 
              className="h-full border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-all group min-h-[300px]"
              onClick={() => router.push('/upload-recipe')}
            >
              <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Add Another Recipe</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                Your community is waiting for your next masterpiece.
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Design Note / Footer */}
        <div className="flex justify-center pt-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border text-xs text-muted-foreground">
            <Utensils className="h-3 w-3" />
            <span>Showing {filteredRecipes.length} recipes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
