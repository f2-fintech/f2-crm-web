"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DriveFolderHeader from "@/components/drive-allocation/DriveFolderHeader";
import FileSelectorDropdown from "@/components/drive-allocation/FileSelectorDropdown";
import AvailableRecordsTable from "@/components/drive-allocation/AvailableRecordsTable";
import AllocatedRecordsTable from "@/components/drive-allocation/AllocatedRecordsTable";
import AllocationHistoryTable from "@/components/drive-allocation/AllocationHistoryTable";
import AllocateModal from "@/components/drive-allocation/AllocateModal";
import ReassignModal from "@/components/drive-allocation/ReassignModal";
import {
  driveAllocationService,
  DiscoveredDriveFile,
  DriveRecordItem,
  AllocationHistoryItem,
  DriveStats,
  HierarchyResponse,
  FileFilterOptions,
  CustomFilterItem,
} from "@/services/driveAllocationService";
import { Layers, Users, FolderGit2, History } from "lucide-react";

export default function DriveAllocationPage() {
  const [folderUrl] = useState(
    "https://drive.google.com/drive/folders/1MBSZMvggdJK-veLYmel8Kp-HSvywtOdj"
  );
  const [activeTab, setActiveTab] = useState<
    "available" | "allocated" | "history"
  >("available");

  // Stats & Files
  const [stats, setStats] = useState<DriveStats | null>(null);
  const [files, setFiles] = useState<DiscoveredDriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DiscoveredDriveFile | null>(
    null
  );
  const [syncingFile, setSyncingFile] = useState(false);

  // Hierarchy (Managers & Employees)
  const [hierarchy, setHierarchy] = useState<HierarchyResponse | null>(null);

  // Available Records State
  const [availableRecords, setAvailableRecords] = useState<DriveRecordItem[]>([]);
  const [availableTotal, setAvailableTotal] = useState(0);
  const [availablePage, setAvailablePage] = useState(1);
  const [availableLimit, setAvailableLimit] = useState(25);
  const [availableSearch, setAvailableSearch] = useState("");
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Dynamic Filters for Available Records
  const [availableCity, setAvailableCity] = useState("");
  const [availableState, setAvailableState] = useState("");
  const [availableYear, setAvailableYear] = useState("");
  const [availableCategory, setAvailableCategory] = useState("");
  const [availableCibilMin, setAvailableCibilMin] = useState<number | undefined>(undefined);
  const [availableLender, setAvailableLender] = useState("");
  const [availableCustomCol, setAvailableCustomCol] = useState("");
  const [availableCustomVal, setAvailableCustomVal] = useState("");
  const [availableFilters, setAvailableFilters] = useState<CustomFilterItem[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [availableMinAmount, setAvailableMinAmount] = useState<number | undefined>(
    undefined
  );
  const [availableMaxAmount, setAvailableMaxAmount] = useState<number | undefined>(
    undefined
  );
  const [filterOptions, setFilterOptions] = useState<FileFilterOptions | null>(
    null
  );
  const [loadingFilterOptions, setLoadingFilterOptions] = useState(false);

  // Allocated Records State
  const [allocatedRecords, setAllocatedRecords] = useState<DriveRecordItem[]>([]);
  const [allocatedTotal, setAllocatedTotal] = useState(0);
  const [allocatedPage, setAllocatedPage] = useState(1);
  const [allocatedSearch, setAllocatedSearch] = useState("");
  const [allocatedFileFilter, setAllocatedFileFilter] = useState("");
  const [allocatedManagerFilter, setAllocatedManagerFilter] = useState("");
  const [allocatedEmployeeFilter, setAllocatedEmployeeFilter] = useState("");
  const [loadingAllocated, setLoadingAllocated] = useState(false);

  // Allocation History State
  const [historyLogs, setHistoryLogs] = useState<AllocationHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(25);
  const [historySearch, setHistorySearch] = useState("");
  const [historyAction, setHistoryAction] = useState("ALL");
  const [historyFileFilter, setHistoryFileFilter] = useState("");
  const [historyEmployeeFilter, setHistoryEmployeeFilter] = useState("");
  const [historyStats, setHistoryStats] = useState<
    Record<string, { count: number; leads: number }>
  >({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modals state
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocatingIds, setAllocatingIds] = useState<string[]>([]);
  const [allocatingCount, setAllocatingCount] = useState<number | undefined>(
    undefined
  );
  const [allocatingLoading, setAllocatingLoading] = useState(false);

  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassigningIds, setReassigningIds] = useState<string[]>([]);
  const [reassigningLoading, setReassigningLoading] = useState(false);

  // Notifications
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // 1. Fetch initial files, stats, hierarchy
  const loadInitialData = useCallback(async () => {
    try {
      const [filesData, statsData, hierarchyData, historyData] =
        await Promise.all([
          driveAllocationService.getFiles(),
          driveAllocationService.getStats(),
          driveAllocationService.getHierarchy(),
          driveAllocationService.getAllocationHistory({ page: 1, limit: 1 }),
        ]);
      setFiles(filesData);
      setStats(statsData);
      setHierarchy(hierarchyData);
      if (historyData) {
        setHistoryTotal(historyData.total);
        setHistoryStats(historyData.stats || {});
      }

      if (filesData.length > 0 && !selectedFile) {
        setSelectedFile(filesData[0]);
      }
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Failed to load Drive info");
    }
  }, [selectedFile]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load Filter Options for File
  const loadFilterOptions = useCallback(async (fileId: string) => {
    setLoadingFilterOptions(true);
    try {
      const opts = await driveAllocationService.getFilterOptions(fileId);
      setFilterOptions(opts);
      if (opts?.headers && opts.headers.length > 0) {
        setFileHeaders(opts.headers);
      }
    } catch {
      setFilterOptions(null);
    } finally {
      setLoadingFilterOptions(false);
    }
  }, []);

  // 2. Fetch Available records for selected file
  const loadAvailableRecords = useCallback(
    async (
      fileId: string,
      page: number,
      search: string,
      limit: number,
      city?: string,
      state?: string,
      year?: string,
      category?: string,
      cibilMin?: number,
      lender?: string,
      customColumn?: string,
      customValue?: string,
      minAmount?: number,
      maxAmount?: number,
      filters?: CustomFilterItem[]
    ) => {
      setLoadingAvailable(true);
      try {
        const validFilters = (filters || []).filter(
          (f) =>
            Boolean(f.column && f.column.trim()) &&
            (Boolean(f.value && f.value.trim()) ||
              (f.values && f.values.length > 0) ||
              f.minAmount !== undefined ||
              f.maxAmount !== undefined)
        );
        const res = await driveAllocationService.getAvailableRecords(fileId, {
          page,
          limit,
          search,
          city: city || undefined,
          state: state || undefined,
          year: year || undefined,
          category: category || undefined,
          cibilMin,
          lender: lender || undefined,
          customColumn: customColumn || undefined,
          customValue: customValue || undefined,
          minAmount,
          maxAmount,
          filters:
            validFilters.length > 0 ? JSON.stringify(validFilters) : undefined,
        });
        setAvailableRecords(res.data);
        setAvailableTotal(res.total);
        setAvailablePage(res.page);
        if (res.headers && res.headers.length > 0) {
          setFileHeaders(res.headers);
        }
      } catch (err: any) {
        showAlert("error", err.response?.data?.message || "Failed to load records");
      } finally {
        setLoadingAvailable(false);
      }
    },
    []
  );

  // 3. Fetch Allocated records
  const loadAllocatedRecords = useCallback(
    async (
      page = 1,
      search = "",
      managerId = "",
      employeeId = "",
      fileId = ""
    ) => {
      setLoadingAllocated(true);
      try {
        const res = await driveAllocationService.getAllocatedRecords({
          page,
          limit: 500,
          search,
          managerId: managerId || undefined,
          employeeId: employeeId || undefined,
          fileId: fileId || undefined,
        });
        setAllocatedRecords(res.data);
        setAllocatedTotal(res.total);
        setAllocatedPage(res.page);
      } catch (err: any) {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to load allocated records"
        );
      } finally {
        setLoadingAllocated(false);
      }
    },
    []
  );

  // 4. Fetch Permanent Allocation History
  const loadHistory = useCallback(
    async (
      page = 1,
      action = "ALL",
      search = "",
      fileId = "",
      employeeId = ""
    ) => {
      setLoadingHistory(true);
      try {
        const res = await driveAllocationService.getAllocationHistory({
          page,
          limit: historyLimit,
          action: action === "ALL" ? undefined : action,
          search: search || undefined,
          fileId: fileId || undefined,
          employeeId: employeeId || undefined,
        });
        setHistoryLogs(res.data);
        setHistoryTotal(res.total);
        setHistoryPage(res.page);
        setHistoryStats(res.stats || {});
      } catch (err: any) {
        showAlert(
          "error",
          err.response?.data?.message || "Failed to load allocation history"
        );
      } finally {
        setLoadingHistory(false);
      }
    },
    [historyLimit]
  );

  // When selectedFile changes, load filter options & reset filters
  useEffect(() => {
    if (selectedFile) {
      loadFilterOptions(selectedFile.fileId);
      setAvailableCity("");
      setAvailableState("");
      setAvailableYear("");
      setAvailableCategory("");
      setAvailableCibilMin(undefined);
      setAvailableLender("");
      setAvailableCustomCol("");
      setAvailableCustomVal("");
      setAvailableFilters([]);
      setAvailableMinAmount(undefined);
      setAvailableMaxAmount(undefined);
      setAvailableSearch("");
      setAvailablePage(1);
    }
  }, [selectedFile, loadFilterOptions]);

  // When filters or page changes, load available records
  useEffect(() => {
    if (selectedFile) {
      loadAvailableRecords(
        selectedFile.fileId,
        availablePage,
        availableSearch,
        availableLimit,
        availableCity,
        availableState,
        availableYear,
        availableCategory,
        availableCibilMin,
        availableLender,
        availableCustomCol,
        availableCustomVal,
        availableMinAmount,
        availableMaxAmount,
        availableFilters
      );
    }
  }, [
    selectedFile,
    availablePage,
    availableSearch,
    availableLimit,
    availableCity,
    availableState,
    availableYear,
    availableCategory,
    availableCibilMin,
    availableLender,
    availableCustomCol,
    availableCustomVal,
    availableMinAmount,
    availableMaxAmount,
    availableFilters,
    loadAvailableRecords,
  ]);

  // Trigger when allocated tab filters change
  useEffect(() => {
    if (activeTab === "allocated") {
      loadAllocatedRecords(
        allocatedPage,
        allocatedSearch,
        allocatedManagerFilter,
        allocatedEmployeeFilter,
        allocatedFileFilter
      );
    }
  }, [
    activeTab,
    allocatedPage,
    allocatedSearch,
    allocatedManagerFilter,
    allocatedEmployeeFilter,
    allocatedFileFilter,
    loadAllocatedRecords,
  ]);

  // Trigger when history tab filters change
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory(
        historyPage,
        historyAction,
        historySearch,
        historyFileFilter,
        historyEmployeeFilter
      );
    }
  }, [
    activeTab,
    historyPage,
    historyAction,
    historySearch,
    historyFileFilter,
    historyEmployeeFilter,
    loadHistory,
  ]);

  // Re-scan Drive folder
  const handleRescanDrive = async () => {
    try {
      const refreshedFiles = await driveAllocationService.scanFolder(folderUrl);
      setFiles(refreshedFiles);
      const newStats = await driveAllocationService.getStats();
      setStats(newStats);
      showAlert("success", "Google Drive hierarchy re-scanned successfully!");
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Re-scan failed");
    }
  };

  // Sync specific Sheet
  const handleSyncFile = async (fileId: string) => {
    setSyncingFile(true);
    try {
      const res = await driveAllocationService.syncFile(fileId);
      showAlert(
        "success",
        `${res.message} (${res.newAdded} new rows added, ${res.available} ready)`
      );
      // Refresh current file list and counts
      const [filesData, statsData] = await Promise.all([
        driveAllocationService.getFiles(),
        driveAllocationService.getStats(),
      ]);
      setFiles(filesData);
      setStats(statsData);
      const updated = filesData.find((f) => f.fileId === fileId);
      if (updated) setSelectedFile(updated);
      loadFilterOptions(fileId);
      loadAvailableRecords(fileId, 1, "", availableLimit);
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Sync failed");
    } finally {
      setSyncingFile(false);
    }
  };

  const handleResetAvailableFilters = () => {
    setAvailableCity("");
    setAvailableState("");
    setAvailableYear("");
    setAvailableCategory("");
    setAvailableCibilMin(undefined);
    setAvailableLender("");
    setAvailableCustomCol("");
    setAvailableCustomVal("");
    setAvailableFilters([]);
    setAvailableMinAmount(undefined);
    setAvailableMaxAmount(undefined);
    setAvailableSearch("");
    setAvailablePage(1);
  };

  // Open Allocate Modal
  const handleOpenAllocateModal = (recordIds: string[], count?: number) => {
    if (!selectedFile) {
      showAlert("error", "Pehle Drive file select kijiye!");
      return;
    }
    setAllocatingIds(recordIds);
    setAllocatingCount(count);
    setAllocateModalOpen(true);
  };

  // Confirm Allocate (Manager -> Employee)
  const handleConfirmAllocate = async (payload: {
    managerId: string;
    employeeId: string;
    remarks?: string;
    targetSheetName?: string;
    targetPageId?: string;
    recordIds?: string[];
    count?: number;
  }) => {
    if (!selectedFile) return;
    setAllocatingLoading(true);
    try {
      const finalRecordIds =
        payload.recordIds && payload.recordIds.length > 0
          ? payload.recordIds
          : allocatingIds.length > 0
          ? allocatingIds
          : undefined;

      const finalCount =
        finalRecordIds && finalRecordIds.length > 0
          ? finalRecordIds.length
          : payload.count !== undefined
          ? payload.count
          : allocatingCount;

      const res = await driveAllocationService.allocateRecords({
        sourceFileId: selectedFile.fileId,
        managerId: payload.managerId,
        employeeId: payload.employeeId,
        recordIds: finalRecordIds,
        count: finalCount,
        remarks: payload.remarks,
        targetSheetName: payload.targetSheetName,
        targetPageId: payload.targetPageId,
        city: !finalRecordIds ? (availableCity || undefined) : undefined,
        state: !finalRecordIds ? (availableState || undefined) : undefined,
        year: !finalRecordIds ? (availableYear || undefined) : undefined,
        category: !finalRecordIds ? (availableCategory || undefined) : undefined,
        cibilMin: !finalRecordIds ? availableCibilMin : undefined,
        lender: !finalRecordIds ? (availableLender || undefined) : undefined,
        customColumn: !finalRecordIds ? (availableCustomCol || undefined) : undefined,
        customValue: !finalRecordIds ? (availableCustomVal || undefined) : undefined,
        minAmount: !finalRecordIds ? availableMinAmount : undefined,
        maxAmount: !finalRecordIds ? availableMaxAmount : undefined,
        filters:
          !finalRecordIds
            ? (() => {
                const valid = availableFilters.filter(
                  (f) =>
                    Boolean(f.column && f.column.trim()) &&
                    (Boolean(f.value && f.value.trim()) ||
                      (f.values && f.values.length > 0) ||
                      f.minAmount !== undefined ||
                      f.maxAmount !== undefined)
                );
                return valid.length > 0 ? valid : undefined;
              })()
            : undefined,
      });

      showAlert("success", res.message);
      setAllocateModalOpen(false);

      // Refresh filter options, records & stats
      loadFilterOptions(selectedFile.fileId);
      loadAvailableRecords(
        selectedFile.fileId,
        availablePage,
        availableSearch,
        availableLimit,
        availableCity,
        availableState,
        availableYear,
        availableCategory,
        availableCibilMin,
        availableLender,
        availableCustomCol,
        availableCustomVal,
        availableMinAmount,
        availableMaxAmount,
        availableFilters
      );
      const [filesData, statsData] = await Promise.all([
        driveAllocationService.getFiles(),
        driveAllocationService.getStats(),
      ]);
      setFiles(filesData);
      setStats(statsData);
      const updated = filesData.find((f) => f.fileId === selectedFile.fileId);
      if (updated) setSelectedFile(updated);

      loadHistory(
        historyPage,
        historyAction,
        historySearch,
        historyFileFilter,
        historyEmployeeFilter
      );
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Allocation failed");
    } finally {
      setAllocatingLoading(false);
    }
  };

  // Return Allocated Records back to Source File
  const handleReturnRecords = async (recordIds: string[]) => {
    if (
      !confirm(
        `Kya aap sach me in leads ko wapas unki original file me return karna chahte hain?`
      )
    ) {
      return;
    }

    try {
      const res = await driveAllocationService.returnRecordsToFile({
        recordIds,
        reason: "Returned to file by Admin",
      });
      showAlert("success", res.message);

      // Refresh both allocated and available pools
      loadAllocatedRecords(
        allocatedPage,
        allocatedSearch,
        allocatedManagerFilter,
        allocatedEmployeeFilter,
        allocatedFileFilter
      );
      if (selectedFile) {
        loadFilterOptions(selectedFile.fileId);
        loadAvailableRecords(
          selectedFile.fileId,
          availablePage,
          availableSearch,
          availableLimit,
          availableCity,
          availableState,
          availableYear,
          availableCategory,
          availableCibilMin,
          availableLender,
          availableCustomCol,
          availableCustomVal,
          availableMinAmount,
          availableMaxAmount,
          availableFilters
        );
      }
      const [filesData, statsData] = await Promise.all([
        driveAllocationService.getFiles(),
        driveAllocationService.getStats(),
      ]);
      setFiles(filesData);
      setStats(statsData);

      loadHistory(
        historyPage,
        historyAction,
        historySearch,
        historyFileFilter,
        historyEmployeeFilter
      );
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Return failed");
    }
  };

  // Open Reassign Modal
  const handleOpenReassignModal = (recordIds: string[]) => {
    setReassigningIds(recordIds);
    setReassignModalOpen(true);
  };

  // Confirm Reassign
  const handleConfirmReassign = async (payload: {
    managerId: string;
    employeeId: string;
    remarks?: string;
  }) => {
    setReassigningLoading(true);
    try {
      const res = await driveAllocationService.reassignRecords({
        recordIds: reassigningIds,
        managerId: payload.managerId,
        employeeId: payload.employeeId,
        remarks: payload.remarks,
      });

      showAlert("success", res.message);
      setReassignModalOpen(false);

      loadAllocatedRecords(
        allocatedPage,
        allocatedSearch,
        allocatedManagerFilter,
        allocatedEmployeeFilter,
        allocatedFileFilter
      );

      loadHistory(
        historyPage,
        historyAction,
        historySearch,
        historyFileFilter,
        historyEmployeeFilter
      );
    } catch (err: any) {
      showAlert("error", err.response?.data?.message || "Reassign failed");
    } finally {
      setReassigningLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle="Google Drive Leads Allocation" />

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold shadow-sm animate-in fade-in ${
            alert.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{alert.message}</span>
          <button
            onClick={() => setAlert(null)}
            className="text-gray-400 hover:text-gray-600 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Stats */}
      <DriveFolderHeader
        stats={stats}
        onRefresh={handleRescanDrive}
        folderUrl={folderUrl}
      />

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold border-b-2 transition ${
            activeTab === "available"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Layers size={16} />
          <span>Available Data Pool (File Wise)</span>
          {stats && (
            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
              {stats.availableRecords.toLocaleString()}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("allocated")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold border-b-2 transition ${
            activeTab === "allocated"
              ? "border-purple-600 text-purple-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Users size={16} />
          <span>Allocated Leads (Return & Reassign)</span>
          {stats && (
            <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
              {stats.allocatedRecords.toLocaleString()}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold border-b-2 transition ${
            activeTab === "history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <History size={16} />
          <span>Allocation History (Audit Trail)</span>
          {historyTotal > 0 && (
            <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
              {historyTotal.toLocaleString()}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Available Records */}
      {activeTab === "available" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Step 1: File Dropdown Selector */}
          <FileSelectorDropdown
            files={files}
            selectedFile={selectedFile}
            onSelectFile={(f) => {
              setSelectedFile(f);
              setAvailablePage(1);
            }}
            onSyncFile={handleSyncFile}
            syncing={syncingFile}
          />

          {/* Step 2: Available Records Table */}
          {selectedFile ? (
            <AvailableRecordsTable
              records={availableRecords}
              total={availableTotal}
              totalUnfiltered={selectedFile.availableRecords}
              page={availablePage}
              limit={availableLimit}
              search={availableSearch}
              onSearchChange={(val) => {
                setAvailableSearch(val);
                setAvailablePage(1);
              }}
              city={availableCity}
              onCityChange={(val) => {
                setAvailableCity(val);
                setAvailablePage(1);
              }}
              state={availableState}
              onStateChange={(val) => {
                setAvailableState(val);
                setAvailablePage(1);
              }}
              year={availableYear}
              onYearChange={(val) => {
                setAvailableYear(val);
                setAvailablePage(1);
              }}
              category={availableCategory}
              onCategoryChange={(val) => {
                setAvailableCategory(val);
                setAvailablePage(1);
              }}
              cibilMin={availableCibilMin}
              onCibilMinChange={(val) => {
                setAvailableCibilMin(val);
                setAvailablePage(1);
              }}
              lender={availableLender}
              onLenderChange={(val) => {
                setAvailableLender(val);
                setAvailablePage(1);
              }}
              customColumn={availableCustomCol}
              onCustomColumnChange={(col) => {
                setAvailableCustomCol(col);
                setAvailablePage(1);
              }}
              customValue={availableCustomVal}
              onCustomValueChange={(val) => {
                setAvailableCustomVal(val);
                setAvailablePage(1);
              }}
              fileHeaders={fileHeaders}
              minAmount={availableMinAmount}
              onMinAmountChange={(val) => {
                setAvailableMinAmount(val);
                setAvailablePage(1);
              }}
              maxAmount={availableMaxAmount}
              onMaxAmountChange={(val) => {
                setAvailableMaxAmount(val);
                setAvailablePage(1);
              }}
              filterOptions={filterOptions}
              loadingFilterOptions={loadingFilterOptions}
              customFilters={availableFilters}
              onCustomFiltersChange={(newFilters) => {
                setAvailableFilters(newFilters);
                setAvailablePage(1);
              }}
              onResetFilters={handleResetAvailableFilters}
              onPageChange={(p) => setAvailablePage(p)}
              onLimitChange={(newLimit) => {
                setAvailableLimit(newLimit);
                setAvailablePage(1);
              }}
              loading={loadingAvailable}
              fileId={selectedFile.fileId}
              onOpenAllocateModal={(ids, count) =>
                handleOpenAllocateModal(ids, count)
              }
            />
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-400">
              <FolderGit2 size={36} className="mx-auto text-gray-300 mb-2" />
              Pehle upar dropdown se koi Google Drive file choose kijiye.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Allocated Records (Return & Reassign) */}
      {activeTab === "allocated" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AllocatedRecordsTable
            records={allocatedRecords}
            total={allocatedTotal}
            page={allocatedPage}
            limit={25}
            search={allocatedSearch}
            onSearchChange={(val) => {
              setAllocatedSearch(val);
              setAllocatedPage(1);
            }}
            files={files}
            selectedFileFilter={allocatedFileFilter}
            onFileFilterChange={(fId) => {
              setAllocatedFileFilter(fId);
              setAllocatedPage(1);
            }}
            selectedManagerFilter={allocatedManagerFilter}
            onManagerFilterChange={(m) => {
              setAllocatedManagerFilter(m);
              setAllocatedPage(1);
            }}
            selectedEmployeeFilter={allocatedEmployeeFilter}
            onEmployeeFilterChange={(e) => {
              setAllocatedEmployeeFilter(e);
              setAllocatedPage(1);
            }}
            onPageChange={(p) =>
              loadAllocatedRecords(
                p,
                allocatedSearch,
                allocatedManagerFilter,
                allocatedEmployeeFilter,
                allocatedFileFilter
              )
            }
            loading={loadingAllocated}
            hierarchy={hierarchy}
            onReturnRecords={handleReturnRecords}
            onOpenReassignModal={handleOpenReassignModal}
          />
        </div>
      )}

      {/* Tab 3: Permanent Allocation History / Audit Trail */}
      {activeTab === "history" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AllocationHistoryTable
            logs={historyLogs}
            total={historyTotal}
            page={historyPage}
            limit={historyLimit}
            loading={loadingHistory}
            search={historySearch}
            onSearchChange={(val) => {
              setHistorySearch(val);
              setHistoryPage(1);
            }}
            selectedAction={historyAction}
            onActionChange={(action) => {
              setHistoryAction(action);
              setHistoryPage(1);
            }}
            selectedFileFilter={historyFileFilter}
            onFileFilterChange={(fId) => {
              setHistoryFileFilter(fId);
              setHistoryPage(1);
            }}
            selectedEmployeeFilter={historyEmployeeFilter}
            onEmployeeFilterChange={(eId) => {
              setHistoryEmployeeFilter(eId);
              setHistoryPage(1);
            }}
            onPageChange={(p) =>
              loadHistory(
                p,
                historyAction,
                historySearch,
                historyFileFilter,
                historyEmployeeFilter
              )
            }
            stats={historyStats}
            files={files}
            hierarchy={hierarchy}
          />
        </div>
      )}

      {/* Modal: Allocate Data (Manager -> Employee) */}
      <AllocateModal
        open={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        hierarchy={hierarchy}
        selectedCount={
          allocatingIds.length > 0 ? allocatingIds.length : allocatingCount || 0
        }
        fileName={selectedFile?.fileName || "Drive File"}
        fileId={selectedFile?.fileId}
        folderPath={selectedFile?.folderPath || "Root"}
        filtersSummary={{
          city: availableCity,
          state: availableState,
          year: availableYear,
          category: availableCategory,
          cibilMin: availableCibilMin,
          lender: availableLender,
          customColumn: availableCustomCol,
          customValue: availableCustomVal,
          minAmount: availableMinAmount,
          maxAmount: availableMaxAmount,
          filters:
            availableFilters.length > 0
              ? availableFilters.filter(
                  (f) =>
                    Boolean(f.column && f.column.trim()) &&
                    (Boolean(f.value && f.value.trim()) ||
                      (f.values && f.values.length > 0) ||
                      f.minAmount !== undefined ||
                      f.maxAmount !== undefined)
                )
              : undefined,
        }}
        selectedRecordIds={allocatingIds.length > 0 ? allocatingIds : undefined}
        onConfirm={handleConfirmAllocate}
        loading={allocatingLoading}
      />

      {/* Modal: Reassign Lead */}
      <ReassignModal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        hierarchy={hierarchy}
        selectedCount={reassigningIds.length}
        onConfirm={handleConfirmReassign}
        loading={reassigningLoading}
      />
    </div>
  );
}
