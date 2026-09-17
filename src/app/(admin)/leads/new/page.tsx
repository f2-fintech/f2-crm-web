"use client";

import { useRouter } from "next/navigation";

import {
  Button,
  Stack,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LeadForm from "@/components/leads/forms/LeadForm";

import useLeadForm from "@/hooks/useLeadForm";

export default function CreateLeadPage() {
  const router = useRouter();

  const {
    values,
    errors,
    loading,
    handleChange,
    validate,
    reset,
  } = useLeadForm();

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      // await createLead(values);

      router.push("/leads");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Create Lead" />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Stack>

      <LeadForm
        values={values}
        errors={errors}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={reset}
      />
    </>
  );
}