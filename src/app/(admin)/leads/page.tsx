"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Box, Stack, Tabs, Tab } from "@mui/material";

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
    changeSearch,
    setSearch,
    setPage,
    refresh,
    getDashboardStats,
    deleteLead,
    applyFilters,
  } = useLeads();

  const [stats, setStats] = useState<any>(null);
  const [tabValue, setTabValue] = useState("all");

  useEffect(() => {
    getDashboardStats().then(data => setStats(data));
    
    // Check if we navigated here with a status filter from the Dashboard
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status");
    if (statusParam) {
      applyFilters({ status: statusParam });
      filters.updateFilter("status", statusParam);
    }
  }, []);

  const filters = useLeadFilters();

  const upload = useBulkUpload();

  return (
    <>
      <PageBreadcrumb pageTitle="Leads" />

      <Stack spacing={2}>
        {/* Dashboard */}

        <DashboardCards
          stats={stats}
          activeStatus={filters.filters.status}
          onCardClick={(status) => {
            const updatedFilters = { ...filters.filters, status };
            applyFilters(updatedFilters);
          }}
        />



        {/* Tabs for Assigned/Unassigned */}
        {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff', px: 2, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => {
              setTabValue(newValue);
              const updatedFilters = { ...filters.filters };
              if (newValue === 'all') delete updatedFilters.isAssigned;
              else if (newValue === 'assigned') updatedFilters.isAssigned = 'true';
              else if (newValue === 'unassigned') updatedFilters.isAssigned = 'false';

              // Remove status filter when changing tabs to prevent conflict
              delete updatedFilters.status;

              applyFilters(updatedFilters);
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="All Leads" value="all" sx={{ fontWeight: 600 }} />
            <Tab label="Assigned Leads" value="assigned" sx={{ fontWeight: 600 }} />
            <Tab label="Unassigned Leads" value="unassigned" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box> */}

        {/* Toolbar */}

        <LeadToolbar
          search={search}
          onSearchChange={changeSearch}
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
            const monthStr = window.prompt("Enter month to sync (YYYY-MM):", new Date().toISOString().slice(0, 7));
            if (!monthStr) return;
            const [year, month] = monthStr.split('-');
            if (!year || !month) return alert("Invalid format");

            // Calculate first and last day of month
            const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
            const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999).toISOString();

            try {
              await fetch('http://localhost:3001/api/leads/sync-oms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate })
              });
              alert('OMS Leads synced successfully for ' + monthStr + '!');
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
          onPaginationChange={() => { }}
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
            onLimitChange={() => { }}
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
        onDownloadTemplate={() => { }}
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
