"use client";

import { useEffect, useState } from "react";

export default function useLeadDetails(id: string) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getLead = async () => {
    try {
      setLoading(true);

      // API

      // const res = await api.get(`/leads/${id}`);
      // setLead(res.data.data);

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