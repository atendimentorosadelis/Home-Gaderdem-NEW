import { useEffect, useState, useCallback } from 'react';

interface UseUnsavedChangesWarningReturn {
  showNavigationDialog: boolean;
  pendingNavigation: string | null;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
  requestNavigation: (path: string) => boolean;
}

export function useUnsavedChangesWarning(
  hasUnsavedChanges: boolean
): UseUnsavedChangesWarningReturn {
  const [showNavigationDialog, setShowNavigationDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Handle browser beforeunload (tab close, refresh, external navigation)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Request internal navigation - returns true if navigation can proceed, false if blocked
  const requestNavigation = useCallback((path: string): boolean => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowNavigationDialog(true);
      return false;
    }
    return true;
  }, [hasUnsavedChanges]);

  // Confirm navigation after user accepts the dialog
  const confirmNavigation = useCallback(() => {
    setShowNavigationDialog(false);
    const path = pendingNavigation;
    setPendingNavigation(null);
    
    if (path) {
      // Navigate after state is cleared
      window.location.href = path;
    }
  }, [pendingNavigation]);

  // Cancel navigation - user decided to stay
  const cancelNavigation = useCallback(() => {
    setShowNavigationDialog(false);
    setPendingNavigation(null);
  }, []);

  return {
    showNavigationDialog,
    pendingNavigation,
    confirmNavigation,
    cancelNavigation,
    requestNavigation,
  };
}
