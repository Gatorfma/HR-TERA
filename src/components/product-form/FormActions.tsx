import { Save, X, Eye, Loader2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  onPreview?: () => void;
  onShowShortcuts?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  showShortcutHints?: boolean;
}

export function FormActions({
  onSave,
  onCancel,
  onPreview,
  onShowShortcuts,
  isSaving = false,
  isDirty = false,
  isValid = true,
  saveLabel = "Kaydet",
  cancelLabel = "Iptal",
  className,
  showShortcutHints = true,
}: FormActionsProps) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {cancelLabel}
          {showShortcutHints && (
            <kbd className="ml-2 text-[10px] text-muted-foreground bg-muted px-1 rounded">
              Esc
            </kbd>
          )}
        </Button>

        {onShowShortcuts && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onShowShortcuts}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Klavye kısayolları (Shift + ?)
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onPreview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="outline" onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Önizle
                {showShortcutHints && (
                  <kbd className="ml-2 text-[10px] text-muted-foreground bg-muted px-1 rounded">
                    {modKey}+P
                  </kbd>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ürün önizlemesini göster</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving || !isValid}
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                isDirty && "ring-2 ring-primary/50"
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saveLabel}
              {showShortcutHints && (
                <kbd className="ml-2 text-[10px] text-primary-foreground/70 bg-primary-foreground/20 px-1 rounded">
                  {modKey}+S
                </kbd>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isDirty ? "Kaydedilmemiş değişiklikler var" : "Tüm değişiklikler kaydedildi"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// Sticky version for bottom of form
export function StickyFormActions(props: FormActionsProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border py-4 px-6 -mx-6 mt-6">
      <FormActions {...props} />
    </div>
  );
}

export default FormActions;
