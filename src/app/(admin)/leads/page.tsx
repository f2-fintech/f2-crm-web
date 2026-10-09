"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Box, Stack } from "@mui/material";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";

import DashboardCards from "@/components/leads/cards/DashboardCards";

import LeadToolbar from "@/components/leads/table/LeadToolbar";
import LeadTable from "@/components/leads/table/LeadTable";
import LeadPagination from "@/components/leads/table/LeadPagination";

import LeadFilters from "@/components/leads/filters/LeadFilters";
import BulkUploadDialog from "@/components/leads/dialogs/BulkUploadDialog";
import LeadJourneyDialog from "@/components/leads/dialogs/LeadJourneyDialog";
import AssignLeadDialog from "@/components/leads/dialogs/AssignLeadDialog";
import ChangeStatusDialog from "@/components/leads/dialogs/ChangeStatusDialog";

import useLeads from "@/hooks/useLeads";
import useLeadFilters from "@/hooks/useLeadFilters";
import useBulkUpload from "@/hooks/useBulkUpload";
import LeadInsights from "./LeadInsights";
import { useEffect } from "react";

export default function LeadsPage() {
  const router = useRouter();

  const [openFilter, setOpenFilter] =
    useState(false);

  const [openUpload, setOpenUpload] =
    useState(false);

  const [journeyLeadId, setJourneyLeadId] = useState<string | null>(null);
  
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [statusLeadId, setStatusLeadId] = useState<string | null>(null);

  const {
    leads,
    loading,
    page,
    totalPages,
    total,
    search,
    setSearch,
    setPage,
    refresh,
    getDashboardStats,
    deleteLead,
  } = useLeads();

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(data => setStats(data));
  }, []);

  const filters = useLeadFilters();

  const upload = useBulkUpload();

  return (
    <>
      <PageBreadcrumb pageTitle="Leads" />

      <Stack spacing={3}>
        {/* Dashboard */}

        <DashboardCards stats={stats} />

        {/* Lead Insights */}
        <LeadInsights insights={stats?.insights || []} />

        {/* Toolbar */}

        <LeadToolbar
          search={search}
          onSearch={setSearch}
          onCreate={() =>
            router.push("/leads/new")
          }
          onFilter={() =>
            setOpenFilter(true)
          }
          onImport={() =>
            setOpenUpload(true)
          }
          onRefresh={refresh}
          onSyncOms={async () => {
            try {
              // Quick hack to show loading state if possible
              await fetch('http://localhost:3001/api/leads/sync-oms', { method: 'POST' });
              alert('OMS Leads synced successfully!');
              refresh();
            } catch (err) {
              alert('Failed to sync OMS leads');
            }
          }}
        />

        {/* Table */}

        <LeadTable
          rows={leads}
          loading={loading}
          page={page}
          pageSize={10}
          rowCount={total}
          onPaginationChange={() => {}}
          onViewJourney={(lead) => setJourneyLeadId(lead._id)}
          onAssign={(lead) => setAssignLeadId(lead._id)}
          onStatusChange={(lead) => setStatusLeadId(lead._id)}
          onDelete={async (lead) => {
            if (confirm(`Are you sure you want to delete lead ${lead.fullName}?`)) {
              await deleteLead(lead._id);
            }
          }}
        />

        {/* Pagination */}

        <Box
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <LeadPagination
            page={page}
            total={total}
            limit={10}
            onPageChange={setPage}
            onLimitChange={() => {}}
          />
        </Box>
      </Stack>

      {/* Filters */}

      <LeadFilters
        open={openFilter}
        onClose={() =>
          setOpenFilter(false)
        }
        {...filters}
      />

      {/* Bulk Upload */}

      <BulkUploadDialog
        open={openUpload}
        loading={upload.loading}
        file={upload.file}
        progress={upload.progress}
        summary={upload.summary}
        errors={upload.errors}
        onClose={() =>
          setOpenUpload(false)
        }
        onUpload={upload.upload}
        onFileChange={
          upload.setFile
        }
        onDownloadTemplate={() => {}}
      />

      <LeadJourneyDialog
        open={!!journeyLeadId}
        onClose={() => setJourneyLeadId(null)}
        leadId={journeyLeadId}
      />

      {assignLeadId && (
        <AssignLeadDialog
          open={!!assignLeadId}
          onClose={() => setAssignLeadId(null)}
          leadId={assignLeadId}
          onSuccess={() => {
            setAssignLeadId(null);
            refresh();
          }}
        />
      )}

      {statusLeadId && (
        <ChangeStatusDialog
          open={!!statusLeadId}
          onClose={() => setStatusLeadId(null)}
          leadId={statusLeadId}
          onSuccess={() => {
            setStatusLeadId(null);
            refresh();
          }}
        />
      )}
    </>
  );
}