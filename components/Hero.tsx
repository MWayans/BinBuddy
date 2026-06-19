"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import Link from "next/link";

export function Hero() {
  const router = useRouter();

  const handleStartScan = () => {
    router.push("/chat");
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-background grain-overlay">
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary">
            BinBuddy
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
            Sort Your Waste{" "}
            <span className="text-primary">the Right Way</span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Snap a picture of what you&apos;re throwing away and get clear, local guidance on
            where it belongs — recycle, compost, landfill, or special collection — built for
            everyday life in Kenya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="shadow-lg hover:shadow-xl transition-all"
              onClick={handleStartScan}
            >
              <Camera className="mr-2 w-5 h-5" />
              Check My Item
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 text-black hover:text-accent-foreground dark:text-foreground"
              asChild
            >
              <Link href="/learn">How It Works</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No account needed • Free to try • Built for Kenya • Your images stay private
          </p>
        </div>
      </div>
    </div>
  );
}
