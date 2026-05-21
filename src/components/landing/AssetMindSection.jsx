import React from 'react';
import HeroLiveAssetMind from './HeroLiveAssetMind';
import HeroProductCanvas from './HeroProductCanvas';

export default function AssetMindSection() {
  return (
    <section className="bg-white pt-16 md:pt-24 pb-12">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8">
        <HeroLiveAssetMind />
        <HeroProductCanvas />
      </div>
    </section>
  );
}