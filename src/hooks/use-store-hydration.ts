'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';

export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist store'u rehydrate et
    const unsubHydrate = useAppStore.persist.onHydrate(() => {
      console.log('Zustand store hydration started');
    });

    const unsubFinishHydration = useAppStore.persist.onFinishHydration((state) => {
      console.log('Zustand store hydration finished', state);
      setIsHydrated(true);
    });

    // Store'u manuel olarak rehydrate et
    useAppStore.persist.rehydrate();

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return isHydrated;
}