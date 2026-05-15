"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  MessageSquare, 
  Send, 
  MoreHorizontal, 
  Flag,
  ThumbsUp,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import supabase from '@/config/client'

const CommentItem = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likes || 0)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  // Helper to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return "Just now"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Recently"
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 md:p-6 rounded-3xl bg-card border border-primary/5 shadow-sm hover:shadow-md transition-shadow group"
    >
      <Avatar className="h-10 w-10 md:h-12 md:w-12 ring-2 ring-primary/5">
        <AvatarImage src={comment.user_avatar} alt={comment.user_Name} />
        <AvatarFallback className="bg-gradient-to-tr from-violet-500 to-primary text-white font-bold">
          {comment.user_name || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-sm md:text-base text-foreground">{comment.user_name}</h4>
            <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {formatDate(comment.created_at)}
            </p>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {comment.comment}
        </p>
        
        <div className="flex items-center gap-4 pt-2">
          <button 
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold transition-colors",
              isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} /> {likesCount}
          </button>
          <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <MessageSquare className="h-4 w-4" /> Reply
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const CommentSection = ({ recipeId }) => {
  const { user } = useAuth()
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (recipeId) {
      fetchComments()
    }
  }, [recipeId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return

    setIsSubmitting(true)
    try {
      const commentData = {
        recipe_id: recipeId,
        user_id: user.id,
        comment: commentText.trim(),
        user_name: user.user_metadata?.name || user.email?.split('@')[0] || "Anonymous",
        user_avatar: user.user_metadata?.avatar_url || null
      }

      const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select()
        .single()

      if (error) throw error

      setComments([data, ...comments])
      setCommentText('')
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pt-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/10 pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            Comments
            <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {comments.length}
            </span>
          </h2>
          <p className="text-muted-foreground font-medium">Join the culinary conversation</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full">
          Sort by: <span className="text-primary cursor-pointer hover:underline">Newest</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Comment Input */}
        <div className="bg-card/50 backdrop-blur border border-primary/10 rounded-[2.5rem] p-4 md:p-6 shadow-sm focus-within:shadow-md focus-within:border-primary/20 transition-all">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/5">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-white font-bold">
                    {user?.user_metadata?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Textarea 
                  placeholder="What's your take on this recipe?" 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 text-base md:text-lg resize-none p-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary/5">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Be respectful to the chef
                </p>
                <Button 
                  onClick={handleSubmit}
                  disabled={!commentText.trim() || isSubmitting}
                  className="rounded-full px-8 font-black shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all h-10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      Post Comment
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold">Join the discussion</h4>
                <p className="text-sm text-muted-foreground">Sign in to share your thoughts and tips!</p>
              </div>
              <Button variant="outline" className="rounded-full font-bold px-8 border-2">
                Sign In to Comment
              </Button>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
            </div>
          ) : comments.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-3xl border-2 border-dashed border-primary/5">
              <MessageSquare className="h-8 w-8 text-primary/20 mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
          
          {!loading && comments.length > 5 && (
            <Button 
              variant="ghost" 
              className="w-full rounded-2xl h-14 text-muted-foreground font-bold hover:bg-muted/50 border-2 border-dashed border-primary/10 transition-all"
            >
              Load more comments
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommentSection
