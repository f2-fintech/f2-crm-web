"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";

export interface LeadFilters {
  search?: string;
  status?: string;
  priority?: string;
  leadSource?: string;
  assignedTo?: string;
  branchId?: string;
  departmentId?: string;
  city?: string;
  state?: string;
  loanType?: string;
  employmentType?: string;
  isConverted?: boolean;
  fromDate?: string;
  toDate?: string;
}

export default function useLeads() {
  const [loading, setLoading] = useState(false);

  const [leads, setLeads] = useState<any[]>([]);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [filters, setFilters] =
    useState<LeadFilters>({});

  const getLeads = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const params: any = {
        page,
        limit,
      };

      if (search) params.search = search;

      Object.entries(filters).forEach(
        ([key, value]) => {
          if (
            value !== undefined &&
            value !== "" &&
            value !== null
          ) {
            params[key] = value;
          }
        }
      );

      const response = await api.get(
        "/leads",
        {
          params,
        }
      );

      const result = response.data;

      setLeads(result.data || []);

      setTotal(
        result.pagination?.total || 0
      );

      setTotalPages(
        result.pagination?.totalPages || 1
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to fetch leads"
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    filters,
  ]);
    // ==========================================
  // Refresh
  // ==========================================

  const refresh = async () => {
    await getLeads();
  };

  // ==========================================
  // Pagination
  // ==========================================

  const changePage = (
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const changeLimit = (
    newLimit: number,
  ) => {
    setLimit(newLimit);

    setPage(1);
  };

  // ==========================================
  // Search
  // ==========================================

  const changeSearch = (
    value: string,
  ) => {
    setSearch(value);

    setPage(1);
  };

  // ==========================================
  // Filters
  // ==========================================

  const applyFilters = (
    values: LeadFilters,
  ) => {
    setFilters(values);

    setPage(1);
  };

  const resetFilters = () => {
    setFilters({});

    setSearch("");

    setPage(1);
  };

  // ==========================================
  // Delete Lead
  // ==========================================

  const deleteLead = async (
    id: string,
  ) => {
    try {
      await api.delete(
        `/leads/${id}`,
      );

      await refresh();

      return true;
    } catch (err: any) {
      setError(
        err?.response?.data
          ?.message ??
          "Failed to delete lead",
      );

      return false;
    }
  };

  // ==========================================
  // Dashboard
  // ==========================================

  const getDashboardStats =
    async () => {
      try {
        const response =
          await api.get(
            "/leads/dashboard/stats",
          );

        return response.data.data;
      } catch {
        return null;
      }
    };
      // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    getLeads();
  }, [getLeads]);

  // ==========================================
  // Return
  // ==========================================

  return {
    // Data
    leads,
    loading,
    error,

    // Pagination
    page,
    limit,
    total,
    totalPages,

    // Search
    search,

    // Filters
    filters,

    // Setters
    setPage,
    setLimit,
    setSearch,
    setFilters,

    // Methods
    refresh,
    getLeads,
    deleteLead,

    changePage,
    changeLimit,
    changeSearch,

    applyFilters,
    resetFilters,

    getDashboardStats,
  };
}