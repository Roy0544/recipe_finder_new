'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Loader2, 
  Clock, 
  Users, 
  Heart, 
  Bookmark, 
  Share2, 
  ArrowLeft,
  Utensils,
  ChefHat,
  Star,
  MessageSquare,
  Send,
  Tag
} from 'lucide-react';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import supabase from '@/config/client';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Utensils className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Recipe not found</h2>
        <Button onClick={() => router.push('/home')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <DotPattern className="opacity-20" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          className="rounded-full hover:bg-primary/10 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-primary/10"
          >
            {recipe.image_url ? (
              <img 
                src={recipe.image_url} 
                alt={recipe.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Utensils className="h-20 w-20 text-muted-foreground opacity-10" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur shadow-md">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full bg-white/90 backdrop-blur shadow-md">
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                  <ChefHat className="h-4 w-4" />
                  Featured Recipe
                </div>
                {recipe.category && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-600/20">
                    <Tag className="h-3 w-3" />
                    {recipe.category}
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                {recipe.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-4 w-4 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  ))}
                  <span className="text-sm font-medium ml-1">(128 reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {recipe.description}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-none shadow-none text-center p-4 rounded-2xl">
                <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Time</div>
                <div className="font-bold">{recipe.cook_time || 'N/A'} mins</div>
              </Card>
              <Card className="bg-blue-500/5 border-none shadow-none text-center p-4 rounded-2xl">
                <Users className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Servings</div>
                <div className="font-bold">{recipe.servings || 'N/A'}</div>
              </Card>
              <Card className="bg-violet-500/5 border-none shadow-none text-center p-4 rounded-2xl">
                <Utensils className="h-5 w-5 text-violet-500 mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Difficulty</div>
                <div className="font-bold">Medium</div>
              </Card>
            </div>

            <div className="flex gap-4 pt-4">
              <Button size="lg" className="rounded-full flex-1 h-14 font-bold text-lg shadow-xl shadow-primary/20">
                Start Cooking
              </Button>
              <Button size="icon" variant="outline" className="rounded-full h-14 w-14 border-2">
                <Share2 className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </div>

        <Separator className="bg-primary/10" />

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Ingredients */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Ingredients
              <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {recipe.ingredients?.length || 0} items
              </span>
            </h2>
            <ul className="space-y-4">
              {recipe.ingredients?.map((ingredient, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all cursor-pointer group"
                >
                  <div className="h-2 w-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                  <span className="font-medium">{ingredient}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Preparation Steps</h2>
            <div className="space-y-8">
              {recipe.instructions?.map((step, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl border border-primary/20">
                    {index + 1}
                  </div>
                  <div className="pt-2">
                    <p className="text-lg leading-relaxed text-foreground/80">
                      {step}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-primary/10" />

        {/* Comment Section */}
        <div className="max-w-3xl mx-auto space-y-10 pt-10 pb-20">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-black tracking-tight">Community Discussion</h2>
            <p className="text-muted-foreground">Share your thoughts or ask the chef a question!</p>
          </div>

          <div className="space-y-6">
            {/* New Comment Input */}
            <div className="relative group">
              <Textarea 
                placeholder="Write your comment..." 
                className="min-h-[120px] rounded-3xl p-6 bg-card/50 backdrop-blur border-primary/10 focus:ring-primary/20 text-lg transition-all"
              />
              <Button className="absolute bottom-4 right-4 rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                <Send className="h-4 w-4 mr-2" /> Post
              </Button>
            </div>

            {/* Mock Comments */}
            <div className="space-y-8 pt-6">
              {[
                { name: "John Doe", time: "2 hours ago", comment: "Wow, this looks incredible! Can I substitute the butter with olive oil?", likes: 12 },
                { name: "Sarah Smith", time: "5 hours ago", comment: "I made this last night and it was a huge hit with the kids. Definitely adding it to my weekly rotation!", likes: 45 },
                { name: "Michael Chen", time: "1 day ago", comment: "The garlic butter instructions are spot on. Pro tip: add a pinch of chili flakes for extra kick.", likes: 8 }
              ].map((c, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-4 p-6 rounded-3xl bg-card border border-primary/5 shadow-sm"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="space-y-2 flex-grow">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold">{c.name}</h4>
                      <span className="text-xs text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {c.comment}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-red-500 transition-colors">
                        <Heart className="h-3.5 w-3.5" /> {c.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" /> Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full rounded-2xl h-14 text-muted-foreground font-bold hover:bg-muted/50 border-2 border-dashed border-primary/10">
              View all 24 comments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
