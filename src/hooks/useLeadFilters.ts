"use client";

import { useState } from "react";

export default function useLeadFilters() {
  const [filters, setFilters] =
    useState({
      search: "",

      status: "",

      priority: "",

      leadSource: "",

      city: "",

      loanType: "",

      assignedTo: "",

      fromDate: "",

      toDate: "",
    });

  const updateFilter = (
    field: string,
    value: any,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",

      status: "",

      priority: "",

      leadSource: "",

      city: "",

      loanType: "",

      assignedTo: "",

      fromDate: "",

      toDate: "",
    });
  };

  return {
    filters,

    setFilters,

    updateFilter,

    resetFilters,
  };
}