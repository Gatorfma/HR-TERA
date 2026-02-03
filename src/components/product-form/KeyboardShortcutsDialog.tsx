import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";
import { KeyboardShortcut, formatShortcutKey } from "@/hooks/useKeyboardShortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Klavye Kısayolları
          </DialogTitle>
          <DialogDescription>
            Formu hızlı kullanmak için klavye kısayolları
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50"
            >
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
                {formatShortcutKey(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          İpucu: Bu dialogu kapatmak için Escape tuşuna basın
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default KeyboardShortcutsDialog;
