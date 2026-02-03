import { useEffect, useCallback, useState, useRef } from "react";

export interface UseUnsavedChangesOptions {
  isDirty: boolean;
  message?: string;
  onConfirmLeave?: () => void;
}

export interface UseUnsavedChangesReturn {
  showDialog: boolean;
  confirmLeave: () => void;
  cancelLeave: () => void;
  /** Call this before programmatic navigation to check if there are unsaved changes */
  checkUnsavedChanges: (onProceed: () => void) => boolean;
}

const DEFAULT_MESSAGE = "Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istediğinize emin misiniz?";

export function useUnsavedChanges(options: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const { isDirty, message = DEFAULT_MESSAGE, onConfirmLeave } = options;
  const [showDialog, setShowDialog] = useState(false);
  const pendingNavigationRef = useRef<(() => void) | null>(null);

  // Block browser navigation (back/forward, closing tab, refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, message]);

  // Check for unsaved changes before programmatic navigation
  // Returns true if navigation should be blocked (dialog shown), false if can proceed
  const checkUnsavedChanges = useCallback((onProceed: () => void): boolean => {
    if (isDirty) {
      pendingNavigationRef.current = onProceed;
      setShowDialog(true);
      return true; // blocked
    }
    return false; // can proceed
  }, [isDirty]);

  // Confirm leaving - proceed with pending navigation
  const confirmLeave = useCallback(() => {
    setShowDialog(false);
    onConfirmLeave?.();
    if (pendingNavigationRef.current) {
      pendingNavigationRef.current();
      pendingNavigationRef.current = null;
    }
  }, [onConfirmLeave]);

  // Cancel leaving - stay on page
  const cancelLeave = useCallback(() => {
    setShowDialog(false);
    pendingNavigationRef.current = null;
  }, []);

  return {
    showDialog,
    confirmLeave,
    cancelLeave,
    checkUnsavedChanges,
  };
}

export default useUnsavedChanges;
