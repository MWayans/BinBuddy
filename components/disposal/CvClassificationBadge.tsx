import { Badge } from "@/components/ui/badge";
import { Scan } from "lucide-react";
import type { CvClassification } from "@/lib/classify/types";

interface CvClassificationBadgeProps {
  classification: CvClassification;
}

export function CvClassificationBadge({
  classification,
}: CvClassificationBadgeProps) {
  const confidencePct = Math.round(classification.confidence * 100);
  const isLowConfidence = classification.confidence < 0.7;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge variant="outline" className="gap-1">
        <Scan className="w-3 h-3" />
        Material: {classification.category}
      </Badge>
      <Badge variant={isLowConfidence ? "destructive" : "secondary"}>
        {confidencePct}% confidence
      </Badge>
      <span className="text-xs text-muted-foreground">
        EfficientNet-B0 · {classification.trashnet_class}
      </span>
    </div>
  );
}
