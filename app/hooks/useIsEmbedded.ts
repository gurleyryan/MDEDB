'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export function useIsEmbedded() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if explicitly set via query parameter
    const embedParam = searchParams.get('embed');
    if (embedParam === 'true') {
      setIsEmbedded(true);
      return;
    }

    // Check if window is in an iframe
    try {
      setIsEmbedded(window.self !== window.top);
    } catch {
      // If we can't access window.top due to cross-origin, we're likely embedded
      setIsEmbedded(true);
    }
  }, [searchParams]);

  return isEmbedded;
}
