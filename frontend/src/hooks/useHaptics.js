import { useCallback } from 'react';

export const useHaptics = () => {
  const isSupported = useCallback(() => {
    return navigator.vibrate && typeof navigator.vibrate === 'function';
  }, []);

  const light = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(10);
    }
  }, [isSupported]);

  const medium = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(50);
    }
  }, [isSupported]);

  const heavy = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(100);
    }
  }, [isSupported]);

  const success = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([10, 50, 10]);
    }
  }, [isSupported]);

  const error = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [isSupported]);

  const notification = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate([50, 100, 50]);
    }
  }, [isSupported]);

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
    notification,
  };
}; 