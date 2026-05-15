"use client"

import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  Clock, 
  Users, 
  Utensils, 
  ChevronRight, 
  Bookmark, 
  MessageSquare,
  Tag
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const RecipeCard = ({ recipe, isFavorite, onFavoriteToggle, showUser = true }) => {
  const router = useRouter();

  return (
    <Card className="group h-full overflow-hidden border-primary/5 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-xl bg-card/50 backdrop-blur-sm flex flex-col rounded-3xl">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-violet-500/5">
            <Utensils className="h-12 w-12 opacity-20" />
          </div>
        )}
        
        {/* Category Badge */}
        {recipe.category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-violet-600/90 backdrop-blur text-[10px] font-bold text-white shadow-lg flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {recipe.category}
            </span>
          </div>
        )}
        
        {/* Overlay Buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
           <Button 
             size="icon" 
             variant="secondary" 
             className={`h-9 w-9 rounded-full relative z-20 bg-white/90 backdrop-blur shadow-sm hover:bg-white transition-colors ${isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
             onClick={(e) => {
               e.stopPropagation();
               onFavoriteToggle(recipe.id);
             }}
           >
             <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
           </Button>
           <Button 
             size="icon" 
             variant="secondary" 
             className="h-9 w-9 rounded-full bg-white/90 backdrop-blur shadow-sm hover:bg-white text-muted-foreground hover:text-primary transition-colors"
             onClick={(e) => e.stopPropagation()}
           >
             <Bookmark className="h-4 w-4" />
           </Button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
           <Button 
             variant="secondary" 
             size="sm" 
             className="rounded-full w-full bg-white/20 backdrop-blur text-white border-white/20 hover:bg-white/30 font-bold"
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
      
      {showUser && (
        <>
          <Separator className="bg-primary/5" />
          <CardFooter className="p-4 px-5 flex justify-between items-center bg-muted/10">
            <div className="flex items-center gap-2">
              <Avatar size="sm" className="h-6 w-6">
                <AvatarImage src={recipe.avatar_Url} alt={recipe.user_Name} />
                <AvatarFallback className="bg-gradient-to-tr from-violet-500 to-primary text-[10px] font-black text-white">
                  {(recipe.user_Name || "U")[0]}
                </AvatarFallback>
              </Avatar>
                <span className="text-[10px] font-bold text-muted-foreground/80">
                {recipe.user_Name || "Unknown Chef"}
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
        </>
      )}
    </Card>
  )
}

export default RecipeCard
