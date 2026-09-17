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

import useLeads from "@/hooks/useLeads";
import useLeadFilters from "@/hooks/useLeadFilters";
import useBulkUpload from "@/hooks/useBulkUpload";

export default function LeadsPage() {
  const router = useRouter();

  const [openFilter, setOpenFilter] =
    useState(false);

  const [openUpload, setOpenUpload] =
    useState(false);

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
        />

        {/* Pagination */}

        <Box
          display="flex"
          justifyContent="flex-end"
        >
          <LeadPagination
            page={page}
            total={total}
            totalPages={totalPages}
            onChange={setPage}
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
    </>
  );
}