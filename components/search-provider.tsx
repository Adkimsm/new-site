"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SearchDialog } from "@/components/search-dialog";

type SearchContextValue = { open: boolean; setOpen: (open: boolean) => void };

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch 必须在 SearchProvider 内使用");
  return context;
}

/** 在输入框、文本域或可编辑元素中不应劫持按键。 */
function isEditable(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.tagName === "INPUT" || element.tagName === "TEXTAREA" || element.isContentEditable;
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      // ⌘K / Ctrl+K 随时开合
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      // 「/」在非编辑状态下打开
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <SearchContext.Provider value={value}>
    {children}
    <SearchDialog open={open} onClose={close} />
  </SearchContext.Provider>;
}
