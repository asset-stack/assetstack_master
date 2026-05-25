import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { secureEntity } from '@/lib/secureEntities';
import { Wallet, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PortfolioValueStats from '@/components/equipment/PortfolioValueStats';
import RenewalForecastChart from '@/components/valuation/RenewalForecastChart';
import ValuationByLocation from '@/components/valuation/ValuationByLocation';
import ConditionDistribution from '@/components/valuation/ConditionDistribution';
import FinanceNav from '@/components/finance/FinanceNav';
import FinanceHeader from '@/components/finance/FinanceHeader';

export default function Valuation() {
  const { data: equipment = [], isLoading, refetch } = useQuery({
    queryKey: ['equipment-all-valuation'],
    queryFn: async () => {
      const all = [];
      for (let page = 0; page < 20; page++) {
        const batch = await secureEntity('Equipment').list('-created_date', 500, page * 500);
        if (!batch?.length) break;
        all.push(...batch);
        if (batch.length < 500) break;
      }
      return all;
    },
  });

  const recompute = useMutation({
    mutationFn: () => base44.functions.invoke('recomputeAssetMetrics', {}),
    onSuccess: (res) => {
      toast?.success?.(`Recomputed metrics on ${res?.data?.updated || 0} assets`);
      refetch();
    },
    onError: (err) => toast?.error?.(err?.message || 'Recompute failed'),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-6">
        <FinanceHeader
          icon={Wallet}
          title="Asset Valuation"
          subtitle="Replacement cost, written-down value, and 10-year renewal forecast"
          accent="indigo"
          actions={
            <Button
              variant="outline"
              onClick={() => recompute.mutate()}
              disabled={recompute.isPending}
              className="h-10"
            >
              {recompute.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Recompute Metrics
            </Button>
          }
        />

        <FinanceNav />

        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading {equipment.length || ''} assets…
          </div>
        ) : (
          <>
            <PortfolioValueStats equipment={equipment} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <ConditionDistribution equipment={equipment} />
              <ValuationByLocation equipment={equipment} />
            </div>
            <RenewalForecastChart equipment={equipment} />
          </>
        )}
      </div>
    </div>
  );
}