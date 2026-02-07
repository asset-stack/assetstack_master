import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  leftLabel = "Dismiss",
  rightLabel = "Complete",
  leftColor = "bg-rose-500",
  rightColor = "bg-emerald-500",
  disabled = false 
}) {
  const x = useMotionValue(0);
  const [swiping, setSwiping] = useState(false);
  const threshold = 100;

  const leftOpacity = useTransform(x, [-threshold, -40, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 40, threshold], [0, 0.5, 1]);

  const handleDragEnd = (_, info) => {
    setSwiping(false);
    if (disabled) return;
    if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <motion.div style={{ opacity: rightOpacity }} className={`flex items-center gap-2 ${rightColor} text-white px-3 py-1.5 rounded-lg text-xs font-medium`}>
          {rightLabel}
        </motion.div>
        <motion.div style={{ opacity: leftOpacity }} className={`flex items-center gap-2 ${leftColor} text-white px-3 py-1.5 rounded-lg text-xs font-medium`}>
          {leftLabel}
        </motion.div>
      </div>

      {/* Swipeable content */}
      <motion.div
        style={{ x }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragStart={() => setSwiping(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10 bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}