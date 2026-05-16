'use client';

import { motion } from "motion/react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  PlusIcon,
  Share1Icon,
  ArrowRightIcon,
  ClockIcon,
  StarIcon,
  LightningBoltIcon
} from "@radix-ui/react-icons";

const features = [
  {
    Icon: MagnifyingGlassIcon,
    name: "AI-Powered Search",
    description: "Search by ingredients, dietary needs, or even a photo of your fridge.",
    href: "/auth",
    cta: "Try Search",
    background: <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: StarIcon,
    name: "Curated Collections",
    description: "Expertly picked recipes for every occasion and season.",
    href: "/auth",
    cta: "Explore",
    background: <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: HeartIcon,
    name: "Personal Cookbook",
    description: "Save, categorize, and annotate your favorite recipes forever.",
    href: "/auth",
    cta: "Start Saving",
    background: <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3",
  },
  {
    Icon: LightningBoltIcon,
    name: "Instant Meal Plans",
    description: "Generate weekly plans based on your preferences in seconds.",
    href: "/auth",
    cta: "Plan Now",
    background: <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-3",
  },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Dynamic Background */}
      <DotPattern 
        glow={true}
        className="opacity-70" 
        width={32}
        height={32}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-background/50 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            New: AI Ingredient Recognition is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Master Your Kitchen with <br />
            <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              Recipe Finder
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The intelligent companion for home cooks. Find, save, and organize your favorite recipes with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="h-12 px-8 text-base font-semibold rounded-full group" 
              render={
                <Link href={user ? "/home" : "/auth"} className="flex items-center" />
              }
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 text-base font-semibold rounded-full" 
              render={<Link href="/recipes" />}
            >
              Browse Public Recipes
            </Button>
          </div>
        </motion.div>

        {/* Floating "Search" Demo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 w-full max-w-2xl p-2 rounded-2xl border bg-card/50 backdrop-blur shadow-2xl"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground italic">Try: &quot;Chicken with garlic and lemon...&quot;</div>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
             {['Pasta', 'Healthy', 'Quick', 'Dessert'].map((tag) => (
               <div key={tag} className="px-3 py-1.5 rounded-lg bg-muted text-xs font-medium text-center">
                 {tag}
               </div>
             ))}
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful Features</h2>
          <p className="text-muted-foreground">Everything you need to level up your culinary game.</p>
        </div>
        
        <BentoGrid>
          {features.map((feature, idx) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <BentoCard {...feature} />
            </motion.div>
          ))}
        </BentoGrid>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">Recipe</span>Finder
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 Recipe Finder. Built for food lovers everywhere.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-sm hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
