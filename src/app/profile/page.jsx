'use client';

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, User, Mail, Calendar, Settings, Heart, Bookmark, Utensils, Plus } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import supabase from "@/config/client"
export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
    const [fetching, setFetching] = useState(true);
  const [recipes, setRecipes] = useState(null)
  
const [likedrecipes, setlikedRecipes] = useState(null)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
     
    }
    if(user){
      fetchLikedRecipes(user);
      fetchRecipes();
    }
  }, [user, loading, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  const fetchLikedRecipes=async(user)=>{
  const {data,error}=await supabase.from('favorites').select('recipe_id').eq('user_id',user.id);
  setlikedRecipes(data)
  console.log("liked recipes is ",data);
  
  if(error){
    console.error("Error fetching liked recipes:",error);
    return;
  }
}

  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : "Unknown";

  return (
    <div className="relative min-h-screen bg-background p-6 md:p-12 overflow-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar / User Info Card */}
          <Card className="w-full md:w-80 shadow-lg border-primary/10">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-2 border-primary/20">
                <User className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold truncate">
                {user.user_metadata?.full_name || user.email.split('@')[0]}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {joinDate}</span>
                </div>
                {/* <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </div> */}
              </div>
              {/* <Button className="w-full mt-4 rounded-full" variant="outline">
                Edit Profile
              </Button> */}
              <Button className="w-full mt-2 rounded-full" onClick={() => router.push('/upload-recipe')}>
                <Plus className="h-4 w-4 mr-2" /> Upload Recipe
              </Button>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Your Activity</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" /> Favorites
                  </CardDescription>
                  <CardTitle className="text-2xl">{likedrecipes?.length || 0}</CardTitle>
                </CardHeader>
              </Card>
              {/* <Card className="bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-blue-500" /> Saved
                  </CardDescription>
                  <CardTitle className="text-2xl">12</CardTitle>
                </CardHeader>
              </Card> */}
              <Card 
                className="bg-card/50 backdrop-blur group cursor-pointer hover:border-primary/50 transition-colors" 
                onClick={() => router.push('/upload-recipe')}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-orange-500" /> My Recipes
                    </CardDescription>
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-2xl">{recipes?.length || 0}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Activity / Placeholder */}
            <Card className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-dashed">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No recent activity</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Start searching and saving recipes to see your activity here!
              </p>
              <Button className="mt-6 rounded-full" onClick={() => router.push('/home')}>
                Explore Recipes
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

