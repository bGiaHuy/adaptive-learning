'use client';
import { useEffect, useState } from 'react';

export function useDelayedLoading(pending: boolean, delay = 200) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!pending) { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [pending, delay]);
  return pending && visible;
}
