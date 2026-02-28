import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateShort } from "@/lib/utils";
import { getWodTypeLabel } from "@/lib/wod-score";
import type { WOD } from "@/types";

interface WodCardProps {
  wod: WOD;
}

export function WodCard({ wod }: WodCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{formatDate(wod.date)}</p>
            <CardTitle className="mt-1 text-2xl">{wod.title}</CardTitle>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {getWodTypeLabel(wod.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-muted-foreground">{wod.description}</p>

        {wod.movements.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold">운동 구성</h3>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {wod.movements.map((movement, i) => (
                <li key={i}>{movement}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
