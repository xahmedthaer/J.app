import React, { useState, useRef, useCallback } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, useSpring } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 130;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, disabled = false }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Motion values for high performance (bypass React render cycle during pull)
  const rawPullDistance = useMotionValue(0);
  
  // Spring config for buttery smooth motion
  const pullDistance = useSpring(rawPullDistance, {
    stiffness: 400,
    damping: 40,
    mass: 0.5
  });

  const controls = useAnimation();
  const startY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived values for indicator
  const opacity = useTransform(pullDistance, [0, 50], [0, 1]);
  const rotation = useTransform(pullDistance, [0, MAX_PULL], [0, 540]);
  const scale = useTransform(pullDistance, [0, PULL_THRESHOLD], [0.8, 1.1]);

  const checkIsAtTop = useCallback(() => {
    if (!containerRef.current) return true;
    const parent = containerRef.current.parentElement;
    if (parent) {
      return parent.scrollTop <= 0;
    }
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !checkIsAtTop()) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && checkIsAtTop()) {
      // Apply non-linear resistance for a "premium" feel
      const pull = Math.min(MAX_PULL, distance * 0.5);
      rawPullDistance.set(pull);
      
      // Prevent browser scroll/bounce while we are handlng the pull
      if (e.cancelable) e.preventDefault();
    } else if (distance < 0) {
      // User is scrolling up, reset pull
      rawPullDistance.set(0);
      isPulling.current = false;
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    
    isPulling.current = false;
    const distance = rawPullDistance.get();

    if (distance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      // Fixed position while refreshing
      rawPullDistance.set(70);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        rawPullDistance.set(0);
      }
    } else {
      rawPullDistance.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-full touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ willChange: 'transform' }}
    >
      {/* Pull Indicator Layer */}
      <motion.div 
        style={{ 
          top: 0,
          left: 0,
          right: 0,
          y: pullDistance,
          opacity: isRefreshing ? 1 : opacity,
          zIndex: 40
        }}
        className="absolute flex justify-center items-start pt-4 pointer-events-none"
      >
        <motion.div 
          style={{ scale }}
          className="bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center"
        >
          <motion.div
            style={{ rotate: isRefreshing ? undefined : rotation }}
            animate={isRefreshing ? { rotate: 360 } : undefined}
            transition={isRefreshing ? { repeat: Infinity, ease: "linear", duration: 0.8 } : { duration: 0 }}
          >
            <RefreshCw 
              className={`w-5 h-5 transition-colors duration-200`} 
              style={{ color: rawPullDistance.get() >= PULL_THRESHOLD || isRefreshing ? 'var(--color-primary, #3b82f6)' : '#9ca3af' }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content Container */}
      <motion.div
        style={{ 
          y: pullDistance,
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};
