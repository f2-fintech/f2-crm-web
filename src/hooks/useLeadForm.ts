"use client";

import { useState } from "react";

import api from "@/lib/axios";

export default function useLeadForm(initialData: any = {}) {
  const [values, setValues] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<any>({});

  const handleChange = (
    field: string,
    value: any,
  ) => {
    setValues((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const reset = () => {
    setValues(initialData);
    setErrors({});
  };

  const validate = () => {
    const error: any = {};

    if (!values.fullName)
      error.fullName = "Required";

    if (!values.phone)
      error.phone = "Required";

    if (!values.loanType)
      error.loanType = "Required";

    setErrors(error);

    return Object.keys(error).length === 0;
  };

  const createLead = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post("/leads", data);
      return response.data;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return {
    values,
    errors,
    setValues,
    setErrors,
    handleChange,
    validate,
    reset,
    createLead,
  };
}