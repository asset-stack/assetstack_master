import React from 'react';
import BetaHero from '@/components/beta/BetaHero';
import AccuracyDashboard from '@/components/beta/AccuracyDashboard';
import ImageQualityGate from '@/components/beta/ImageQualityGate';
import EnsembleToggle from '@/components/beta/EnsembleToggle';
import RoadmapCard from '@/components/beta/RoadmapCard';

export default function BetaFeatures() {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <BetaHero />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <AccuracyDashboard />
          <ImageQualityGate />
        </div>
        <div className="space-y-5">
          <EnsembleToggle />
          <RoadmapCard />
        </div>
      </div>
    </div>
  );
}