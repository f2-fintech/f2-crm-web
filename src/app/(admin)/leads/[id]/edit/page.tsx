"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import {
  Alert,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadForm from "@/components/leads/forms/LeadForm";

import useLeadDetails from "@/hooks/useLeadDetails";
import useLeadForm from "@/hooks/useLeadForm";

export default function EditLeadPage() {
  const router = useRouter();

  const params = useParams();

  const id = params.id as string;

  const {
    lead,
    loading,
  } = useLeadDetails(id);

  const {
    values,
    errors,
    setValues,
    handleChange,
    validate,
  } = useLeadForm();

  useEffect(() => {
    if (lead) {
      setValues({
        fullName: lead.fullName,
        phone: lead.phone,
        alternatePhone:
          lead.alternatePhone,

        email: lead.email,

        city: lead.city,

        state: lead.state,

        loanType: lead.loanType,

        loanAmount:
          lead.loanAmount,

        monthlyIncome:
          lead.monthlyIncome,

        employmentType:
          lead.employmentType,

        companyName:
          lead.companyName,

        leadSource:
          lead.leadSource,

        priority:
          lead.priority,

        assignedTo:
          lead.assignedTo?._id,

        branchId:
          lead.branchId?._id,

        departmentId:
          lead.departmentId?._id,

        remarks:
          lead.remarks,

        omsId:
          lead.omsId,

        applicationId:
          lead.applicationId,

        nextFollowUp:
          lead.nextFollowUp,
      });
    }
  }, [lead, setValues]);

  const handleSubmit =
    async () => {
      if (!validate()) return;

      try {
        /*
        await axios.patch(
          `/leads/${id}`,
          values,
        );
        */

        router.push(
          `/leads/${id}`,
        );
      } catch (error) {
        console.error(error);
      }
    };

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Stack>
    );
  }

  if (!lead) {
    return (
      <Alert severity="error">
        Lead not found.
      </Alert>
    );
  }

  return (
    <>
      <PageBreadcrumb
        pageTitle="Edit Lead"
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            router.back()
          }
        >
          Back
        </Button>
      </Stack>

      <LeadForm
        values={values}
        errors={errors}
        loading={false}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={() =>
          router.back()
        }
      />
    </>
  );
}