import { useCallback, useEffect, useState, useRef } from "react";
import axios from "@/lib/axios";

export interface DashboardData {
  roleType?: string;
  stats: any;
  recentActivity: Array<any>;
  monthlyLeads: { data: Array<{ name: string; value: number }> };
  pipelineData?: any;
}

export default function useDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const [movement, setMovement] = useState<any>(null);
  const [stageAging, setStageAging] = useState<any>(null);
  const [agentWorkload, setAgentWorkload] = useState<any>(null);
  const [agentActivity, setAgentActivity] = useState<any>(null);
  const [volumeForecast, setVolumeForecast] = useState<any>(null);
  
  const [slaData, setSlaData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Configurable intervals
  const POLL_INTERVAL = 60000; // 60 seconds

  const loadData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError("");

      const [dashRes, pipRes, moveRes, stageRes, agentRes, activityRes, slaRes, volRes] = await Promise.allSettled([
        axios.get("/dashboard"),
        axios.get("/dashboard/pipeline"),
        axios.get("/dashboard/movement?timeframe=today"),
        axios.get("/dashboard/stage-aging"),
        axios.get("/dashboard/agent-workload"),
        axios.get("/dashboard/agent-activity?timeframe=today"),
        axios.get("/dashboard/sla"),
        axios.get("/dashboard/volume-forecast")
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data.data);
      if (pipRes.status === 'fulfilled') setPipeline(pipRes.value.data.data);
      if (moveRes.status === 'fulfilled') setMovement(moveRes.value.data.data);
      if (stageRes.status === 'fulfilled') setStageAging(stageRes.value.data.data);
      if (agentRes.status === 'fulfilled') setAgentWorkload(agentRes.value.data.data);
      if (activityRes.status === 'fulfilled') setAgentActivity(activityRes.value.data.data);
      if (slaRes.status === 'fulfilled') setSlaData(slaRes.value.data.data);
      if (volRes.status === 'fulfilled') setVolumeForecast(volRes.value.data.data);

    } catch (err: any) {
      console.error(err);
      if (!isBackground) {
        setError(err?.response?.data?.message || "Failed to load dashboard data.");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    dashboard,
    pipeline,
    movement,
    stageAging,
    agentWorkload,
    agentActivity,
    slaData,
    volumeForecast,
    loading,
    error,
    refresh: () => loadData(false)
  };
}