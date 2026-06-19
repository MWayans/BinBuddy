import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "accent" | "subtle";
}

export function GradientBackground({
  children,
  className,
  variant = "subtle",
}: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        variant === "accent" ? "gradient-nature" : "gradient-nature-subtle",
        className
      )}
    >
      {children}
    </div>
  );
}




