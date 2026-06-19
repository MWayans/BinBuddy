import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ai-elements/loader";
import { Image as ImageIcon } from "lucide-react";
import type { DisposalRecommendation } from "@/lib/schemas/recommendations";
import type { CvClassification } from "@/lib/classify/types";
import { CvClassificationBadge } from "@/components/disposal/CvClassificationBadge";

interface DisposalGuideSidebarProps {
  recommendation: DisposalRecommendation | null;
  cvClassification?: CvClassification | null;
  isLoading: boolean;
}

export function DisposalGuideSidebar({
  recommendation,
  cvClassification,
  isLoading,
}: DisposalGuideSidebarProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">At a Glance</h2>

      {!recommendation && !isLoading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 text-primary/30" />
            <p>Nothing to show yet.</p>
            <p className="text-sm mt-2">
              Add a photo above and your summary will land here.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading && !recommendation && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Loader />
            <p className="text-sm text-muted-foreground mt-4">
              Working on your item...
            </p>
          </CardContent>
        </Card>
      )}

      {cvClassification && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-base">Material Scan</CardTitle>
            <CardDescription>
              On-device classifier result before the assistant adds disposal detail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CvClassificationBadge classification={cvClassification} />
          </CardContent>
        </Card>
      )}

      {recommendation && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">{recommendation.item}</CardTitle>
            <CardDescription>{recommendation.material}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{recommendation.category}</Badge>
              <Badge
                variant={
                  recommendation.recycling_available ? "default" : "outline"
                }
              >
                {recommendation.disposal_method}
              </Badge>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <strong className="text-foreground">Next steps:</strong>
                <ol className="list-decimal list-inside mt-1 text-muted-foreground space-y-1">
                  {recommendation.disposal_steps.slice(0, 3).map((step, idx) => (
                    <li key={idx} className="text-xs">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
              {recommendation.local_notes && (
                <div className="pt-2 border-t border-border">
                  <strong className="text-foreground">In Kenya:</strong>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recommendation.local_notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
