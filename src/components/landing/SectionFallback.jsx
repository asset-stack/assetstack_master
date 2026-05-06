import React from 'react';

// Fixed-height placeholder for lazy-loaded landing sections — prevents CLS.
export default function SectionFallback({ minHeight = 320 }) {
  return <div aria-hidden style={{ minHeight }} />;
}