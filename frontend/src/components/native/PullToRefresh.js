import React, { useState, useRef, useEffect } from 'react';
import { useHaptics } from '../../hooks/useHaptics';

const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 100, 
  disabled = false,
  refreshText = 'Desliza para actualizar',
  refreshingText = 'Actualizando...',
  releaseText = 'Suelta para actualizar'
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'pulling', 'ready', 'refreshing'
  const [touchStart, setTouchStart] = useState(0);
  const containerRef = useRef(null);
  const haptics = useHaptics();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      if (disabled || isRefreshing) return;
      
      const touch = e.touches[0];
      setTouchStart(touch.clientY);
    };

    const handleTouchMove = (e) => {
      if (disabled || isRefreshing || !touchStart) return;
      
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const scrollTop = container.scrollTop;
      
      if (scrollTop === 0) {
        const pullDistance = Math.max(0, currentY - touchStart);
        setPullDistance(pullDistance);
        
        if (pullDistance > threshold) {
          if (status !== 'ready') {
            setStatus('ready');
            haptics.light();
          }
        } else if (pullDistance > 0) {
          if (status !== 'pulling') {
            setStatus('pulling');
          }
        } else {
          setStatus('idle');
        }
        
        // Prevenir scroll si estamos arrastrando hacia abajo
        if (pullDistance > 0) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (disabled || isRefreshing || !touchStart) return;
      
      if (pullDistance > threshold) {
        setIsRefreshing(true);
        setStatus('refreshing');
        haptics.medium();
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setStatus('idle');
        }
      }
      
      setPullDistance(0);
      setTouchStart(0);
      setStatus('idle');
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, touchStart, pullDistance, threshold, onRefresh, haptics, status]);

  const getRefreshIndicatorTransform = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    return `translateY(${pullDistance * 0.5}px) rotate(${progress * 360}deg)`;
  };

  const getRefreshIndicatorOpacity = () => {
    return Math.min(pullDistance / threshold, 1);
  };

  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return releaseText;
      case 'refreshing':
        return refreshingText;
      case 'pulling':
        return refreshText;
      default:
        return refreshText;
    }
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Refresh Indicator */}
      <div 
        className="absolute inset-x-0 top-0 flex flex-col items-center justify-center text-center transition-all duration-200 ease-out"
        style={{
          transform: `translateY(${Math.max(-60, pullDistance - 60)}px)`,
          opacity: getRefreshIndicatorOpacity(),
        }}
      >
        <div 
          className="w-8 h-8 mb-2 flex items-center justify-center"
          style={{ transform: getRefreshIndicatorTransform() }}
        >
          {isRefreshing ? (
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg 
              className="w-6 h-6 text-primary-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          )}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getStatusText()}
        </span>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto"
        style={{
          transform: `translateY(${pullDistance * 0.3}px)`,
          transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh; 