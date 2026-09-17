"use client";

import { useState } from "react";

export default function useLeadForm(initialData: any = {}) {
  const [values, setValues] = useState(initialData);

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

  return {
    values,
    errors,
    setValues,
    setErrors,
    handleChange,
    validate,
    reset,
  };
}