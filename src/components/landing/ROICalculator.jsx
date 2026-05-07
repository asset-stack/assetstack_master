import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';

const fmtMoney = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
};

export default function ROICalculator() {
  const [assetCount, setAssetCount] = useState(1500);
  const [avgValue, setAvgValue] = useState(45000);

  const results = useMemo(() => {
    const portfolioValue = assetCount * avgValue;
    // Conservative AssetStack capability assumptions (illustrative, not guaranteed):
    // - 2.5% of portfolio value typically locked in deferred maintenance backlog
    // - 18% backlog reduction in year 1 via prioritisation
    // - 3% of portfolio value avoided in unplanned failures p.a.
    const backlog = portfolioValue * 0.025;
    const backlogReduction = backlog * 0.18;
    const failureAvoidance = portfolioValue * 0.03;
    const totalImpact = backlogReduction + failureAvoidance;
    return { portfolioValue, backlog, backlogReduction, failureAvoidance, totalImpact };
  }, [assetCount, avgValue]);

  return null;





























































































}