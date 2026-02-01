import { CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressStep {
  id: string;
  label: string;
  isCompleted: boolean;
}

interface FormProgressProps {
  completedFields: number;
  totalRequiredFields: number;
  completionPercentage: number;
  steps?: ProgressStep[];
  className?: string;
}

export function FormProgress({
  completedFields,
  totalRequiredFields,
  completionPercentage,
  steps,
  className,
}: FormProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Form tamamlanma durumu</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {completedFields}/{totalRequiredFields} zorunlu alan dolduruldu
        </p>
      </div>

      {/* Step indicators */}
      {steps && steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Bölümler</p>
          <div className="space-y-1">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 text-sm py-1.5 px-2 rounded-md transition-colors",
                  step.isCompleted
                    ? "text-green-700 bg-green-50"
                    : "text-muted-foreground"
                )}
              >
                {step.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar
export function CompactFormProgress({
  completedFields,
  totalRequiredFields,
  completionPercentage,
}: Omit<FormProgressProps, "steps">) {
  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Ilerleme</span>
        <span
          className={cn(
            "text-sm font-bold",
            completionPercentage === 100 ? "text-green-600" : "text-primary"
          )}
        >
          {completionPercentage}%
        </span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      <p className="text-xs text-muted-foreground mt-2">
        {completedFields}/{totalRequiredFields} zorunlu alan
      </p>
      {completionPercentage === 100 && (
        <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
          <CheckCircle2 className="h-3 w-3" />
          <span>Tüm zorunlu alanlar dolduruldu</span>
        </div>
      )}
    </div>
  );
}

export default FormProgress;
