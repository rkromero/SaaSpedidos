import { useState, useEffect, useRef } from 'react';

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;
    
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

export const usePullToRefresh = (onRefresh, threshold = 100) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollElement = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const currentScrollY = scrollElement.current?.scrollTop || 0;
    
    if (currentScrollY === 0) {
      const pullDistance = Math.max(0, touchY - touchStartY.current);
      setPullDistance(pullDistance);
      
      if (pullDistance > threshold) {
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return {
    pullDistance,
    isRefreshing,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    scrollElement,
  };
};

export const useLongPress = (onLongPress, delay = 500) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef();
  const target = useRef();

  const start = (e) => {
    timeout.current = setTimeout(() => {
      onLongPress(e);
      setLongPressTriggered(true);
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }, delay);
  };

  const clear = () => {
    timeout.current && clearTimeout(timeout.current);
    setLongPressTriggered(false);
  };

  return {
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onTouchMove: clear,
    longPressTriggered,
  };
}; 