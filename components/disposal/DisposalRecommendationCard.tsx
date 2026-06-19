import { Badge } from "@/components/ui/badge";
import {
  Recycle,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import type { DisposalRecommendation } from "@/lib/schemas/recommendations";
import type { CvClassification } from "@/lib/classify/types";
import { CvClassificationBadge } from "@/components/disposal/CvClassificationBadge";

interface DisposalRecommendationCardProps {
  recommendation: DisposalRecommendation | Partial<DisposalRecommendation>;
  intro?: string | null;
  cvClassification?: CvClassification | null;
}

export function DisposalRecommendationCard({
  recommendation,
  intro,
  cvClassification,
}: DisposalRecommendationCardProps) {
  const {
    item,
    material,
    category,
    disposal_method,
    disposal_steps,
    recycling_available,
    hazards,
    local_notes,
    location_info,
    environmental_impact,
  } = recommendation;

  if (!item) return null;

  return (
    <div className="space-y-4">
      {cvClassification && (
        <CvClassificationBadge classification={cvClassification} />
      )}
      {intro && (
        <p className="text-sm text-muted-foreground">{intro}</p>
      )}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Recycle className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{item}</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {category && <Badge variant="secondary">{category}</Badge>}
              {disposal_method && (
                <Badge
                  variant={recycling_available ? "default" : "outline"}
                >
                  {disposal_method}
                </Badge>
              )}
              {recycling_available && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Can recycle
                </Badge>
              )}
            </div>
            {material && (
              <p className="text-sm text-muted-foreground">
                <strong>Material:</strong> {material}
              </p>
            )}
          </div>
        </div>

        {disposal_steps && disposal_steps.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              What to do:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-6">
              {disposal_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {hazards && hazards.length > 0 && (
          <div className="mt-4 bg-destructive/5 rounded-lg p-3 border border-destructive/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h4 className="font-medium text-sm text-destructive">
                Handle with care:
              </h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
              {hazards.map((hazard, idx) => (
                <li key={idx}>{hazard}</li>
              ))}
            </ul>
          </div>
        )}

        {local_notes && (
          <div className="mt-4 bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-sm">Local guidance (Kenya):</h4>
            </div>
            <p className="text-sm text-muted-foreground">{local_notes}</p>
          </div>
        )}

        {location_info && (
          <div className="mt-3 text-sm text-muted-foreground">
            <strong>Where to take it:</strong> {location_info}
          </div>
        )}

        {environmental_impact && (
          <div className="mt-3 text-sm text-muted-foreground italic">
            {environmental_impact}
          </div>
        )}
      </div>
    </div>
  );
}
