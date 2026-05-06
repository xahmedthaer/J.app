import React, { useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 80;
const MAX_PULL = 120;

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, disabled = false }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullDistance = useMotionValue(0);
  const controls = useAnimation();
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const opacity = useTransform(pullDistance, [0, 40], [0, 1]);
  const rotation = useTransform(pullDistance, [0, MAX_PULL], [0, 360]);

  const checkIsAtTop = () => {
    if (!containerRef.current) return true;
    const parent = containerRef.current.parentElement;
    if (parent) {
      return parent.scrollTop === 0;
    }
    return window.scrollY === 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !checkIsAtTop()) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || !checkIsAtTop()) {
      if (pullDistance.get() > 0) pullDistance.set(0);
      return;
    }
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance
    const dampedDistance = Math.min(MAX_PULL, distance * 0.4);
    pullDistance.set(dampedDistance);

    // Prevent body bounce on iOS when pulling
    if (dampedDistance > 0) {
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;
    
    setIsPulling(false);
    const distance = pullDistance.get();

    if (distance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      await controls.start({ y: 60 });
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        await controls.start({ y: 0 });
        pullDistance.set(0);
      }
    } else {
      await controls.start({ y: 0 });
      pullDistance.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <motion.div 
        style={{ 
          top: -40,
          y: isRefreshing ? 60 : pullDistance,
          opacity: isRefreshing ? 1 : opacity
        }}
        className="absolute left-0 right-0 flex justify-center items-center h-10 z-50 text-cairo"
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md border border-gray-100 dark:border-gray-700">
          <motion.div
            style={{ rotate: isRefreshing ? undefined : rotation }}
            animate={isRefreshing ? { rotate: 360 } : undefined}
            transition={isRefreshing ? { repeat: Infinity, ease: "linear", duration: 0.8 } : undefined}
          >
            <RefreshCw className={`w-5 h-5 ${pullDistance.get() >= PULL_THRESHOLD ? 'text-primary' : 'text-gray-400'}`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Content Container */}
      <motion.div
        animate={controls}
        style={{ y: isRefreshing ? 60 : pullDistance }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
