"use client";

import React from 'react';
import InsightCard from '@/components/ui/insight-card/InsightCard';

interface CustomerInsightsProps {
  insights: any[];
}

export default function CustomerInsights({ insights }: CustomerInsightsProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Customer Insights</h2>
      </div>
      {!insights || insights.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-500">No insights available for the selected period.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, idx) => (
            <InsightCard key={idx} {...insight} />
          ))}
        </div>
      )}
    </div>
  );
}
