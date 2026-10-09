"use client";

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { useState } from "react";

import {
  Button,
  Stack,
  Alert,
  Card,
  Box,
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

import AiLeadSummary from "@/components/ai-assistant/AiLeadSummary";
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
    return (
      <Stack spacing={2}>
        <PageBreadcrumb pageTitle="Lead Details" />
        <Alert severity="error">
          Lead not found or may have been deleted.
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/leads')} sx={{ alignSelf: 'flex-start' }}>
          Back to Leads
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Lead Details" />

      <Card 
        sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <Button
            startIcon={<ArrowBack />}
            variant="text"
            onClick={() => router.back()}
            sx={{ fontWeight: 'bold', color: 'text.secondary', '&:hover': { background: 'rgba(0,0,0,0.05)' } }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap alignItems="center">
            <AiLeadSummary leadId={id} />

            <Button
              startIcon={<Edit />}
              variant="contained"
              onClick={() => router.push(`/leads/${id}/edit`)}
              sx={{ borderRadius: 2, textTransform: 'none', boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' }}
            >
              Edit Lead
            </Button>

            <Button
              startIcon={<AssignmentInd />}
              variant="outlined"
              onClick={() => setAssignOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'white' }}
            >
              Assign
            </Button>

            <Button
              startIcon={<Autorenew />}
              variant="outlined"
              onClick={() => setStatusOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'white' }}
            >
              Change Status
            </Button>

            <Button
              startIcon={<Delete />}
              color="error"
              variant="outlined"
              onClick={() => setDeleteOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none', bgcolor: 'error.50', '&:hover': { bgcolor: 'error.100' } }}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Box sx={{ width: '100%' }}>
        <LeadDetails lead={lead} />
      </Box>

      <AssignLeadDialog
        open={assignOpen}
        leadId={id}
        onClose={() => setAssignOpen(false)}
        onSuccess={() => {
          setAssignOpen(false);
          refresh();
        }}
      />

      <ChangeStatusDialog
        open={statusOpen}
        leadId={id}
        onClose={() => setStatusOpen(false)}
        onSuccess={() => {
          setStatusOpen(false);
          refresh();
        }}
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