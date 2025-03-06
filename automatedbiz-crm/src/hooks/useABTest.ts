import { useState, useEffect } from 'react';
import { abTesting, Test, Variant } from '../lib/abTesting';

export function useABTest(elementId: string) {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeTest = async () => {
      try {
        const test = await abTesting.getActiveTest(elementId);
        if (test) {
          const totalWeight = test.variants.reduce((sum, v) => sum + v.weight, 0);
          let random = Math.random() * totalWeight;
          let selectedVariant: Variant | null = null;
          for (const variant of test.variants) {
            random -= variant.weight;
            if (random <= 0) {
              selectedVariant = variant;
              break;
            }
          }
          if (selectedVariant) {
            setVariant(selectedVariant);
            abTesting.recordImpression(test.id, selectedVariant.id);
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };
    initializeTest();
  }, [elementId]);

  const recordConversion = async () => {
    if (variant) {
      try {
        await abTesting.recordConversion(elementId, variant.id);
      } catch (err) {
        console.error('Failed to record conversion:', err);
      }
    }
  };

  return { variant, loading, error, recordConversion };
}