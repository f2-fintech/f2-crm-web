"use client";

import React, { useMemo } from 'react';
import InsightCard from '@/components/ui/insight-card/InsightCard';

interface Client360InsightsProps {
  customer: any;
  lifecycleCurrent: any;
  applications: any[];
  followUps: any[];
  omsData: any;
}

export default function Client360Insights({
  customer,
  lifecycleCurrent,
  applications,
  followUps,
  omsData
}: Client360InsightsProps) {

  const insights = useMemo(() => {
    const list: any[] = [];

    // 1. SLA State Insight
    if (lifecycleCurrent?.slaState === 'BREACHED') {
      list.push({
        title: "SLA Breached",
        metric: lifecycleCurrent.currentStage,
        explanation: "This customer has exceeded the allowed time in their current stage.",
        severity: "critical"
      });
    } else if (lifecycleCurrent?.slaState === 'AT_RISK') {
      list.push({
        title: "SLA At Risk",
        metric: lifecycleCurrent.currentStage,
        explanation: "This customer is nearing the SLA breach threshold in their current stage.",
        severity: "warning"
      });
    }

    // 2. Pending Follow-up Insight
    const pendingFollowUps = followUps.filter(f => f.status === 'PENDING');
    if (pendingFollowUps.length > 0) {
      const overdue = pendingFollowUps.filter(f => new Date(f.dueDate) < new Date());
      if (overdue.length > 0) {
        list.push({
          title: "Overdue Follow-up",
          metric: overdue.length,
          explanation: "There are overdue follow-up tasks for this customer.",
          severity: "info"
        });
      } else {
        list.push({
          title: "Pending Follow-ups",
          metric: pendingFollowUps.length,
          explanation: "Upcoming follow-up tasks are scheduled.",
          severity: "info"
        });
      }
    }

    // 3. Application State Insight
    const activeApps = applications.filter(a => a.status !== 'APPROVED' && a.status !== 'REJECTED' && a.status !== 'DISBURSED');
    if (activeApps.length > 0) {
      list.push({
        title: "Active Applications",
        metric: activeApps.length,
        explanation: "Applications are currently in progress.",
        severity: "info",
        context: `Latest status: ${activeApps[0].status}`
      });
    } else if (applications.some(a => a.status === 'APPROVED')) {
      list.push({
        title: "Approved Applications",
        metric: applications.filter(a => a.status === 'APPROVED').length,
        explanation: "Applications have been approved and await disbursement.",
        severity: "info"
      });
    }

    // 4. OMS Movement Insight
    if (omsData && omsData.loansCount > 0) {
      list.push({
        title: "OMS Sync",
        metric: `${omsData.loansCount} Loans`,
        explanation: "Customer has synced records from the core lending system.",
        severity: "info"
      });
    }

    return list.slice(0, 4);
  }, [customer, lifecycleCurrent, applications, followUps, omsData]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Client 360 Insights</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, idx) => (
          <InsightCard key={idx} {...insight} />
        ))}
      </div>
    </div>
  );
}
