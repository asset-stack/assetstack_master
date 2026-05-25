import React from 'react';

/**
 * Static dithered banner background for the MechanismSection.
 */
export default function MechanismBackground() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <img
        src="https://media.base44.com/images/public/6a0a6a5d4d043b0e41a16d90/de94d1985_Screenshot2026-05-25at124049PM.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />
    </div>
  );
}