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

import useLeads from "@/hooks/useLeads";
import useLeadFilters from "@/hooks/useLeadFilters";
import useBulkUpload from "@/hooks/useBulkUpload";

export default function LeadsPage() {
  const router = useRouter();

  const [openFilter, setOpenFilter] =
    useState(false);

  const [openUpload, setOpenUpload] =
    useState(false);

  const [journeyLeadId, setJourneyLeadId] = useState<string | null>(null);

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
  } = useLeads();

  const filters = useLeadFilters();

  const upload = useBulkUpload();

  return (
    <>
      <PageBreadcrumb pageTitle="Leads" />

      <Stack spacing={3}>
        {/* Dashboard */}

        <DashboardCards />

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
    </>
  );
}