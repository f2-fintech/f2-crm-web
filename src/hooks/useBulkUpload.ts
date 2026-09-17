"use client";

import { useState } from "react";

export default function useBulkUpload() {
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const [summary, setSummary] =
    useState<any>(null);

  const [errors, setErrors] =
    useState<any[]>([]);

  const upload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      setProgress(20);

      // API

      // const formData = new FormData();

      // formData.append("file", file);

      // const res = await api.post(
      // "/leads/bulk-upload",
      // formData,
      // );

      // setSummary(res.data.summary);

      // setErrors(res.data.errors);

      setProgress(100);
    } finally {
      setLoading(false);
    }
  };

  return {
    file,

    setFile,

    loading,

    progress,

    summary,

    errors,

    upload,
  };
}