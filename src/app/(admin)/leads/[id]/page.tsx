"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { useState } from "react";

import {
  Button,
  Stack,
} from "@mui/material";

import {
  ArrowBack,
  Edit,
  AssignmentInd,
  Autorenew,
  Delete,
} from "@mui/icons-material";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import LeadDetails from "@/components/leads/details/LeadDetails";

import AssignLeadDialog from "@/components/leads/dialogs/AssignLeadDialog";
import ChangeStatusDialog from "@/components/leads/dialogs/ChangeStatusDialog";
import DeleteLeadDialog from "@/components/leads/dialogs/DeleteLeadDialog";

import useLeadDetails from "@/hooks/useLeadDetails";

export default function LeadDetailsPage() {
  const router = useRouter();

  const params = useParams();

  const id = params.id as string;

  const {
    lead,
    loading,
    refresh,
  } = useLeadDetails(id);

  const [assignOpen, setAssignOpen] =
    useState(false);

  const [statusOpen, setStatusOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  if (loading) {
    return <>Loading...</>;
  }

  if (!lead) {
    return <>Lead not found</>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Lead Details" />

      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={() => router.back()}
        >
          Back
        </Button>

        <Stack direction="row" spacing={2}>
          <Button
            startIcon={<Edit />}
            variant="contained"
            onClick={() =>
              router.push(
                `/leads/${id}/edit`,
              )
            }
          >
            Edit
          </Button>

          <Button
            startIcon={
              <AssignmentInd />
            }
            variant="outlined"
            onClick={() =>
              setAssignOpen(true)
            }
          >
            Assign
          </Button>

          <Button
            startIcon={
              <Autorenew />
            }
            variant="outlined"
            onClick={() =>
              setStatusOpen(true)
            }
          >
            Change Status
          </Button>

          <Button
            startIcon={<Delete />}
            color="error"
            variant="outlined"
            onClick={() =>
              setDeleteOpen(true)
            }
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <LeadDetails lead={lead} />

      <AssignLeadDialog
        open={assignOpen}
        loading={false}
        users={[]}
        branches={[]}
        departments={[]}
        values={{
          userId: "",
          branchId: "",
          departmentId: "",
          priority: lead.priority,
          nextFollowUp: "",
          assignmentRemark: "",
        }}
        onClose={() =>
          setAssignOpen(false)
        }
        onSubmit={() => {}}
        onChange={() => {}}
      />

      <ChangeStatusDialog
        open={statusOpen}
        loading={false}
        values={{
          status: lead.status,
          remarks: "",
          lastFollowUp: "",
          nextFollowUp: "",
        }}
        onClose={() =>
          setStatusOpen(false)
        }
        onSubmit={() => {}}
        onChange={() => {}}
      />

      <DeleteLeadDialog
        open={deleteOpen}
        loading={false}
        lead={lead}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={() => {}}
      />
    </>
  );
}