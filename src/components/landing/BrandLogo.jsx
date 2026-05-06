import React from 'react';

/**
 * AssetStack brand logo. Uses the official mark image.
 *  - size: pixel size of the icon (square)
 *  - showWordmark: whether to render "AssetStack" text next to the icon
 *  - tone: 'dark' (default) for light backgrounds, 'light' for dark backgrounds
 */
export default function BrandLogo({ size = 32, showWordmark = true, tone = 'dark', className = '' }) {
  const wordmarkColor = tone === 'light' ? 'text-white' : 'text-slate-900';
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="https://media.base44.com/images/public/6970c68cc08dbe7897c72f22/5ff4ca1d8_8b7d4979d_AssetStack_Logo_Icon.png"
        alt="AssetStack"
        width={size}
        height={size}
        className="block shrink-0"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span className={`font-semibold text-[15px] tracking-tight ${wordmarkColor}`}>AssetStack</span>
      )}
    </span>
  );
}