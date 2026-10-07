"use client";

import React from 'react';
import InsightCard from '@/components/ui/insight-card/InsightCard';

interface LeadInsightsProps {
  insights: any[];
}

export default function LeadInsights({ insights }: LeadInsightsProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Lead Insights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} {...insight} />
        ))}
      </div>
    </div>
  );
}
