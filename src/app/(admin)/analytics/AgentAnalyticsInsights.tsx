"use client";

import React, { useMemo } from 'react';
import InsightCard from '@/components/ui/insight-card/InsightCard';

interface AgentAnalyticsInsightsProps {
  agentWorkload: any[];
}

export default function AgentAnalyticsInsights({ agentWorkload }: AgentAnalyticsInsightsProps) {
  const insights = useMemo(() => {
    if (!agentWorkload || agentWorkload.length === 0) return [];
    
    const list: any[] = [];
    
    // 1. Unassigned Workload
    const unassigned = agentWorkload.find((a: any) => a.name === 'Unassigned');
    const unassignedTotal = unassigned ? (unassigned.activeLeads + unassigned.activeApps) : 0;
    if (unassignedTotal > 0) {
      list.push({
        title: "Unassigned Cases",
        metric: unassignedTotal,
        explanation: "Cases without an assigned agent.",
        severity: "info",
        action: { label: "Assign Work", href: "/leads" }
      });
    }

    // 2. Highest Workload (Bottleneck)
    const assignedAgents = agentWorkload.filter(a => a.name !== 'Unassigned');
    if (assignedAgents.length > 0) {
      const sortedByWorkload = [...assignedAgents].sort((a, b) => 
        (b.activeLeads + b.activeApps) - (a.activeLeads + a.activeApps)
      );
      
      const highest = sortedByWorkload[0];
      const highestTotal = highest.activeLeads + highest.activeApps;
      
      if (highestTotal > 0) {
        list.push({
          title: "Highest Workload",
          metric: highest.name,
          explanation: `Highest workload with ${highestTotal} active cases.`,
          severity: "info",
          context: `${highest.activeLeads} Leads, ${highest.activeApps} Apps`
        });
      }

      // 3. Lowest Workload (Capacity)
      if (sortedByWorkload.length > 1) {
        const lowest = sortedByWorkload[sortedByWorkload.length - 1];
        const lowestTotal = lowest.activeLeads + lowest.activeApps;
        if (highestTotal > lowestTotal) {
          list.push({
            title: "Lowest Workload",
            metric: lowest.name,
            explanation: `Lowest workload with ${lowestTotal} active cases.`,
            severity: "info",
            context: `Can take on more assignments.`
          });
        }
      }
    }

    return list.slice(0, 4);
  }, [agentWorkload]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Agent Workload Insights</h2>
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
