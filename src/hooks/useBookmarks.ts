import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hr-hub-bookmarks";
const MAX_BOOKMARKS = 20;

export interface BookmarkEntry {
  product_id: string;
  product_name: string;
  logo: string;
  main_category: string;
  subscription: string;
}

function readBookmarks(): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>(readBookmarks);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setBookmarks(readBookmarks());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isBookmarked = useCallback(
    (productId: string) => bookmarks.some((b) => b.product_id === productId),
    [bookmarks]
  );

  const toggleBookmark = useCallback((product: BookmarkEntry) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.product_id === product.product_id);
      if (exists) {
        return prev.filter((b) => b.product_id !== product.product_id);
      }
      // Prepend (most-recent-first), truncate at MAX
      return [product, ...prev].slice(0, MAX_BOOKMARKS);
    });
  }, []);

  const removeBookmark = useCallback((productId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.product_id !== productId));
  }, []);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  return { bookmarks, isBookmarked, toggleBookmark, removeBookmark, clearBookmarks };
}
