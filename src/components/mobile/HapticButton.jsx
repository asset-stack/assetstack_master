import React from 'react';
import { Button } from "@/components/ui/button";

/**
 * Button with haptic feedback on supported devices.
 * Falls back silently to a normal button on unsupported devices.
 */
export default function HapticButton({ onClick, children, ...props }) {
  const handleClick = (e) => {
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}