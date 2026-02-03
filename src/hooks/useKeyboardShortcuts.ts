import { useEffect, useCallback, useState } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export interface UseKeyboardShortcutsReturn {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  shortcuts: KeyboardShortcut[];
}

// Default shortcuts for product form
export const createProductFormShortcuts = ({
  onSave,
  onPreview,
  onCancel,
  onShowHelp,
}: {
  onSave?: () => void;
  onPreview?: () => void;
  onCancel?: () => void;
  onShowHelp?: () => void;
}): KeyboardShortcut[] => [
  {
    key: "s",
    ctrlKey: true,
    description: "Formu kaydet",
    action: () => onSave?.(),
  },
  {
    key: "p",
    ctrlKey: true,
    description: "Onizlemeyi ac",
    action: () => onPreview?.(),
  },
  {
    key: "Escape",
    description: "Iptal / Dialoglari kapat",
    action: () => onCancel?.(),
  },
  {
    key: "?",
    shiftKey: true,
    description: "Klavye kisayollarini goster",
    action: () => onShowHelp?.(),
  },
];

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): UseKeyboardShortcutsReturn {
  const { shortcuts, enabled = true } = options;
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Ctrl+S even in inputs
      const isCtrlS = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      const isEscape = event.key === "Escape";

      if (isInputElement && !isCtrlS && !isEscape) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches =
          shortcut.ctrlKey === undefined ||
          shortcut.ctrlKey === (event.ctrlKey || event.metaKey);
        const metaMatches =
          shortcut.metaKey === undefined ||
          shortcut.metaKey === event.metaKey;
        const shiftMatches =
          shortcut.shiftKey === undefined ||
          shortcut.shiftKey === event.shiftKey;
        const altMatches =
          shortcut.altKey === undefined ||
          shortcut.altKey === event.altKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
    shortcuts,
  };
}

// Helper to format shortcut keys for display
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    // Show Cmd on Mac, Ctrl on Windows/Linux
    parts.push(navigator.platform.includes("Mac") ? "⌘" : "Ctrl");
  }
  if (shortcut.shiftKey) {
    parts.push("Shift");
  }
  if (shortcut.altKey) {
    parts.push("Alt");
  }

  // Format the key
  let keyDisplay = shortcut.key;
  if (shortcut.key === "Escape") {
    keyDisplay = "Esc";
  } else if (shortcut.key === " ") {
    keyDisplay = "Space";
  } else if (shortcut.key === "?") {
    keyDisplay = "?";
  } else {
    keyDisplay = shortcut.key.toUpperCase();
  }

  parts.push(keyDisplay);

  return parts.join(" + ");
}

export default useKeyboardShortcuts;
