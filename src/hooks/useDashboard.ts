"use client";

import { useCallback, useEffect, useState } from "react";

import axios from "@/lib/axios";

export interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalTeams: number;
    totalBranches: number;
    totalDepartments: number;
    totalRoles: number;
  };
  recentActivity: Array<{
    _id: string;
    title: string;
    description: string;
    createdAt: string;
    type: string;
  }>;
  monthlyLeads: {
    data: Array<{ name: string; value: number }>;
  };
}

export default function useDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);

        setError("");

        const { data } =
          await axios.get("/dashboard");

        setDashboard(data.data);
      } catch (err: any) {
        console.error(err);

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    dashboard,

    loading,

    error,

    refresh: loadDashboard,
  };
}