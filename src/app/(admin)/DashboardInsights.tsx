"use client";

import React, { useMemo } from 'react';
import InsightCard from '@/components/ui/insight-card/InsightCard';

interface DashboardInsightsProps {
  pipeline: any;
  movement: any;
  stageAging: any;
  agentWorkload: any;
  slaData: any;
  loading: boolean;
}

export default function DashboardInsights({
  pipeline,
  movement,
  stageAging,
  agentWorkload,
  slaData,
  loading
}: DashboardInsightsProps) {

  const insights = useMemo(() => {
    const list: any[] = [];
    
    if (loading) {
      return Array(3).fill({ loading: true });
    }

    // 1. SLA Insights
    if (slaData && (slaData.breached > 0 || slaData.atRisk > 0)) {
      if (slaData.breached > 0) {
        list.push({
          title: "SLA Breaches",
          metric: slaData.breached,
          explanation: "Active cases have breached their SLA threshold and require immediate attention.",
          severity: "critical",
          action: { label: "View Cases", href: "/applications?sla=breached" }
        });
      } else if (slaData.atRisk > 0) {
        list.push({
          title: "SLA At Risk",
          metric: slaData.atRisk,
          explanation: "Active cases are nearing their SLA breach threshold.",
          severity: "warning",
        });
      }
    } else if (slaData) {
      list.push({
        title: "SLA Health",
        metric: slaData.withinSla,
        explanation: "Active cases are within their expected SLA timeline.",
        severity: "success",
      });
    }

    // 2. Stage Bottlenecks
    if (stageAging && Array.isArray(stageAging) && stageAging.length > 0) {
      const highestAge = [...stageAging].sort((a, b) => b.avgAgeDays - a.avgAgeDays)[0];
      if (highestAge && highestAge.avgAgeDays > 0) {
        list.push({
          title: "Longest Stage Duration",
          metric: highestAge.stage,
          explanation: `Cases are spending an average of ${highestAge.avgAgeDays.toFixed(1)} days in this stage.`,
          severity: "info",
          context: `Max age recorded: ${highestAge.maxAgeDays.toFixed(1)} days for ${highestAge.count} case(s).`,
        });
      }
    }

    // 3. Agent Workload
    if (agentWorkload && Array.isArray(agentWorkload) && agentWorkload.length > 0) {
      const highestWorkload = [...agentWorkload].sort((a, b) => (b.activeLeads + b.activeApps) - (a.activeLeads + a.activeApps))[0];
      
      const unassigned = agentWorkload.find((a: any) => a.name === 'Unassigned');
      if (unassigned && (unassigned.activeLeads > 0 || unassigned.activeApps > 0)) {
        list.push({
          title: "Unassigned Workload",
          metric: unassigned.activeLeads + unassigned.activeApps,
          explanation: `Cases (${unassigned.activeLeads} leads, ${unassigned.activeApps} apps) are currently unassigned.`,
          severity: "info",
          action: { label: "Assign Work", href: "/leads?assignedTo=unassigned" }
        });
      } else if (highestWorkload && (highestWorkload.activeLeads > 0 || highestWorkload.activeApps > 0)) {
        list.push({
          title: "Highest Workload",
          metric: highestWorkload.name,
          explanation: `Currently assigned ${highestWorkload.activeLeads + highestWorkload.activeApps} active cases.`,
          severity: "info",
          context: `${highestWorkload.activeLeads} Leads, ${highestWorkload.activeApps} Apps, ${highestWorkload.pendingFollowUps} Pending Follow-ups.`,
        });
      }
    }

    // 4. Pipeline Summary
    if (pipeline && Array.isArray(pipeline) && pipeline.length > 0) {
      const topStage = [...pipeline].sort((a, b) => b.count - a.count)[0];
      if (topStage && topStage.count > 0 && list.length < 4) {
        list.push({
          title: "Pipeline Concentration",
          metric: topStage.stage,
          explanation: `Largest concentration of pipeline volume with ${topStage.count} active cases.`,
          severity: "info",
        });
      }
    }

    return list.slice(0, 4); // Show top 4 insights
  }, [pipeline, movement, stageAging, agentWorkload, slaData, loading]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
          Generated from live CRM data
        </span>
      </div>
      {!loading && insights.length === 0 ? (
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
