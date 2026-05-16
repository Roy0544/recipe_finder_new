'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DotPattern } from '@/components/ui/dot-pattern';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Utensils, Clock, Users, ArrowLeft, Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import supabase from '@/config/client';

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  ingredients: z.array(z.object({
    value: z.string().min(1, "Ingredient cannot be empty")
  })).min(1, "Please add at least one ingredient"),
  instructions: z.array(z.object({
    value: z.string().min(1, "Instruction cannot be empty")
  })).min(1, "Please add at least one instruction"),
  cookTime: z.number().int().min(1, "Cook time is required"),
  servings: z.number().int().min(1, "Servings count is required"),
});

function UploadRecipeForm(){
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');
  const isEditMode = !!recipeId;  
  const [existingImageUrl, setExistingImageUrl] = useState(null);

  const categories = [
    "Breakfast", "Lunch", "Dinner", "Dessert", 
    "Vegan", "Vegetarian", "Gluten-Free", "Quick & Easy"
  ];

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      cookTime: 30,
      servings: 4,
      category: "Breakfast",
      ingredients: [{ value: "" }],
      instructions: [{ value: "" }],
    }
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: "ingredients",
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction } = useFieldArray({
    control,
    name: "instructions",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (recipeId) fetchRecipe();
  }, [recipeId]);

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;

      reset({
        title: data.title,
        description: data.description,
        category: data.category,
        cookTime: data.cook_time,
        servings: data.servings,
        ingredients: data.ingredients.map(i => ({ value: i })),
        instructions: data.instructions.map(i => ({ value: i })),
      });

      if (data.image_url) {
        setImagePreview(data.image_url);
        setExistingImageUrl(data.image_url);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = ''; 
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      let imageUrl = existingImageUrl;
      const file = imageInputRef.current?.files?.[0];

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('food_images')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          console.error("Storage upload error detail:", uploadError);
          throw new Error(`Storage error: ${uploadError.message || 'Check if bucket exists'}`);
        }

        const { data } = supabase.storage
          .from('food_images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }
      
      if (!imagePreview && !file) imageUrl = null;
    
      const recipeData = {
        title: formData.title,  
        description: formData.description,
        category: formData.category,
        ingredients: formData.ingredients.map(i => i.value),
        instructions: formData.instructions.map(i => i.value),
        cook_time: formData.cookTime,
        servings: formData.servings,
        user_id: user.id,
        image_url: imageUrl,
        user_Name: user?.user_metadata?.name || user?.user_metadata?.full_name || "Unknown Chef",
        avatar_Url: user?.user_metadata?.avatar_url
      };

      if (isEditMode) {
        console.log("Updating recipe:", recipeId, "User:", user.id);
        const { data: updateData, error } = await supabase
          .from('recipe')
          .update(recipeData)
          .eq('id', recipeId)
          .eq('user_id', user.id)
          .select();

        if (error) throw error;
        console.log("Update database response:", updateData);
        if (!updateData || updateData.length === 0) {
           console.error("NO ROWS UPDATED. Check permissions or ID.");
           alert("Update failed: You may not have permission to edit this recipe.");
        }
      } else {
        const { error } = await supabase
          .from('recipe')
          .insert([recipeData]);

        if (error) throw error;
      }
      
      router.push('/profile');
    } catch (error) {
      console.error("Error submitting recipe:", error);
      alert(error.message || "An error occurred while saving the recipe.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
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
      
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="mb-4 hover:bg-primary/10 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="shadow-2xl border-primary/10">
          <CardHeader className="text-center border-b bg-muted/30">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Utensils className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">{isEditMode ? "Edit Recipe" : "Upload New Recipe"}</CardTitle>
            <CardDescription>
              Share your culinary masterpiece with the Recipe Finder community.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                
                  <div className="space-y-2">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Recipe Image
                  </Label>
                  <div className="flex flex-col items-center justify-center w-full">
                    <input 
                      id="image-upload"
                      ref={imageInputRef} 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border shadow-inner">
                        <Image 
                          src={imagePreview} 
                          alt="Preview" 
                          fill
                          unoptimized
                          className="object-cover" 
                        />
                        <Button 
                          type="button"
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2 rounded-full h-8 w-8"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <label 
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-muted-foreground/20"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recipe Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Classic Garlic Butter Pasta" 
                      {...register('title')}
                      className={`h-12 text-lg ${errors.title ? "border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Short Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="A brief story about this dish..." 
                      {...register('description')}
                      className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
                    <select
                      id="category"
                      {...register('category')}
                      className={`flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.category ? "border-red-500" : "border-primary/20 focus:border-primary"}`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ingredients</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 rounded-full"
                        onClick={() => appendIngredient({ value: "" })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {ingredientFields.map((field, index) => (
                        <div key={field.id} className="group flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                          <Input
                            {...register(`ingredients.${index}.value`)}
                            placeholder={`Ingredient ${index + 1}`}
                            className={errors.ingredients?.[index]?.value ? "border-red-500" : ""}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 duration-200"
                            onClick={() => removeIngredient(index)}
                            disabled={ingredientFields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {errors.ingredients && typeof errors.ingredients.message === 'string' && (
                        <p className="text-xs text-red-500">{errors.ingredients.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Instructions</Label>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary hover:bg-primary/10 h-8 rounded-full"
                        onClick={() => appendInstruction({ value: "" })}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Step
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {instructionFields.map((field, index) => (
                        <div key={field.id} className="group flex gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                          <Textarea
                            {...register(`instructions.${index}.value`)}
                            placeholder={`Step ${index + 1}`}
                            className={`min-h-[60px] ${errors.instructions?.[index]?.value ? "border-red-500" : ""}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 duration-200"
                            onClick={() => removeInstruction(index)}
                            disabled={instructionFields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {errors.instructions && typeof errors.instructions.message === 'string' && (
                        <p className="text-xs text-red-500">{errors.instructions.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" /> Cook Time (mins)
                    </Label>
                    <Input 
                      type="number"
                      {...register('cookTime', { valueAsNumber: true })}
                      className={errors.cookTime ? "border-red-500" : ""}
                    />
                    {errors.cookTime && <p className="text-xs text-red-500">{errors.cookTime.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" /> Servings
                    </Label>
                    <Input 
                      type="number"
                      {...register('servings', { valueAsNumber: true })}
                      className={errors.servings ? "border-red-500" : ""}
                    />
                    {errors.servings && <p className="text-xs text-red-500">{errors.servings.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 rounded-full border-2 hover:bg-muted"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 rounded-full bg-primary text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {isEditMode ? "Update" : "Publish"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default function UploadRecipePage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UploadRecipeForm />
    </Suspense>
  );
}
