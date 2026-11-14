"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

export default function useLeadDetails(id: string) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getLead = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leads/${id}`);
      // NestJS findOne returns the object directly, not wrapped in a data property
      setLead(res.data?.data ? res.data.data : res.data);
    } catch (error) {
      console.error("Failed to fetch lead details:", error);
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getLead();
    }
  }, [id]);

  return {
    lead,
    loading,
    refresh: getLead,
  };
}