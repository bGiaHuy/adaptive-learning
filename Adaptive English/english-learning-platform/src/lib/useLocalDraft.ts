"use client";
import { useEffect, useState } from "react";

export function useLocalDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); setValue(raw ? JSON.parse(raw) : initial); }
    catch { setValue(initial); }
    setReady(true);
    // The caller supplies a stable storage key for each document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(value)); setSaved(true); }
    catch { setSaved(false); }
  }, [key, ready, value]);
  return { value, setValue, ready, saved };
}
