"use client";

import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GradientBackground } from "@/components/GradientBackground";
import { SmoothLink, useAnchorScroll } from "@/components/SmoothLink";
import Link from "next/link";
import {
  Camera,
  Recycle,
  Shield,
  MapPin,
  ArrowRight,
  Leaf,
  Zap,
  Globe,
} from "lucide-react";

export default function Home() {
  useAnchorScroll();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Section id="features" className="bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Smarter Sorting,{" "}
              <span className="text-primary">Less Guesswork</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              BinBuddy reads your photo, identifies the material, and points you toward the
              right bin or drop-off — with rules and facilities that matter in Kenya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Camera}
              title="Photo-Based ID"
              description="Point your camera at the item or upload a shot from your gallery — BinBuddy figures out what you're holding."
            />
            <FeatureCard
              icon={Recycle}
              title="Local Rules & Options"
              description="Advice reflects Kenyan waste practices: what can be recycled, what needs special handling, and what goes to landfill."
            />
            <FeatureCard
              icon={Shield}
              title="Hazard Warnings"
              description="Batteries, chemicals, and sharp objects get flagged so you can handle them safely before they leave your home."
            />
            <FeatureCard
              icon={MapPin}
              title="Drop-Off Pointers"
              description="When recycling or special collection applies, we suggest the kinds of facilities and services to look for nearby."
            />
          </div>
        </div>
      </Section>

      {/* How It Works Section */}
      <Section id="how-it-works" className="bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Three Steps to a Clearer Bin
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From photo to action in under a minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-primary/20 -z-10" />

            <div className="relative">
              <div className="bg-card rounded-2xl p-8 shadow-lg border-0 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Show the Item</h3>
                <p className="text-muted-foreground">
                  Use your phone camera or pick a photo from your library. A single clear view of the object is enough.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card rounded-2xl p-8 shadow-lg border-0 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  BinBuddy Analyzes
                </h3>
                <p className="text-muted-foreground">
                  A vision model spots the material and category; our assistant then drafts disposal steps tuned to Kenyan context.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card rounded-2xl p-8 shadow-lg border-0 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Follow the Plan
                </h3>
                <p className="text-muted-foreground">
                  You get ordered steps, safety notes if needed, and notes on recycling or drop-off — then sort it with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Benefits/Value Proposition Section */}
      <Section id="benefits" className="bg-background">
        <GradientBackground variant="accent" className="rounded-3xl p-12 md:p-16">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white">
              Small Choices Add Up
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
              Putting waste in the right stream cuts pollution, keeps recyclables in circulation,
              and lowers risks from hazardous items. BinBuddy makes that choice quicker on busy days.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-white/90">
                <Recycle className="w-5 h-5" />
                <span>Less Landfill</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Globe className="w-5 h-5" />
                <span>Cleaner Communities</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Zap className="w-5 h-5" />
                <span>Answers in Seconds</span>
              </div>
            </div>
          </div>
        </GradientBackground>
      </Section>

      {/* Call-to-Action Section */}
      <Section id="cta" className="bg-background">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl bg-card">
            <CardContent className="p-12 md:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Got Something to Throw Out?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Open BinBuddy, share a photo, and see where it should go. No signup — just a clearer bin label in your head.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/chat">
                    Open BinBuddy
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 text-black hover:text-accent-foreground dark:text-foreground"
                  asChild
                >
                  <Link href="/learn">See the Guide</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Link href="/">
                <h3 className="font-semibold text-lg mb-4 text-foreground hover:text-primary transition-colors cursor-pointer">
                  BinBuddy
                </h3>
              </Link>
              <p className="text-muted-foreground">
                Your pocket guide for sorting waste in Kenya — photo in, practical disposal advice out.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <SmoothLink href="#features">
                    Features
                  </SmoothLink>
                </li>
                <li>
                  <SmoothLink href="#how-it-works">
                    How It Works
                  </SmoothLink>
                </li>
                <li>
                  <SmoothLink href="#benefits">
                    Benefits
                  </SmoothLink>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">About</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BinBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
