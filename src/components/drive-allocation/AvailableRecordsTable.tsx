"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  UserCheck,
  Zap,
  Phone,
  Building,
  MapPin,
  IndianRupee,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Calendar,
  X,
  SlidersHorizontal,
  Tag,
  GraduationCap,
  FileSpreadsheet,
  Award,
  Building2,
} from "lucide-react";
import {
  DriveRecordItem,
  FileFilterOptions,
} from "@/services/driveAllocationService";

interface AvailableRecordsTableProps {
  records: DriveRecordItem[];
  total: number;
  totalUnfiltered?: number;
  page: number;
  limit: number;
  search: string;
  onSearchChange: (search: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  state: string;
  onStateChange: (state: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  category?: string;
  onCategoryChange?: (category: string) => void;
  cibilMin?: number;
  onCibilMinChange?: (val?: number) => void;
  lender?: string;
  onLenderChange?: (val: string) => void;
  customColumn?: string;
  onCustomColumnChange?: (col: string) => void;
  customValue?: string;
  onCustomValueChange?: (val: string) => void;
  minAmount?: number;
  onMinAmountChange: (amount?: number) => void;
  maxAmount?: number;
  onMaxAmountChange: (amount?: number) => void;
  filterOptions?: FileFilterOptions | null;
  loadingFilterOptions?: boolean;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  loading: boolean;
  onOpenAllocateModal: (selectedIds: string[], count?: number) => void;
  fileHeaders?: string[];
}

export default function AvailableRecordsTable({
  records,
  total,
  totalUnfiltered,
  page,
  limit,
  search,
  onSearchChange,
  city,
  onCityChange,
  state,
  onStateChange,
  year,
  onYearChange,
  category = "",
  onCategoryChange,
  cibilMin,
  onCibilMinChange,
  lender = "",
  onLenderChange,
  customColumn = "",
  onCustomColumnChange,
  customValue = "",
  onCustomValueChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  filterOptions,
  loadingFilterOptions,
  onResetFilters,
  onPageChange,
  onLimitChange,
  loading,
  onOpenAllocateModal,
  fileHeaders,
}: AvailableRecordsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quickCount, setQuickCount] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>("100");
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const totalPages = Math.ceil(total / limit) || 1;

  // Determine dynamic columns based on actual Excel sheet headers
  const dynamicColumns = useMemo(() => {
    if (fileHeaders && fileHeaders.length > 0) return fileHeaders;
    if (filterOptions?.headers && filterOptions.headers.length > 0)
      return filterOptions.headers;
    if (records.length > 0 && records[0].rawData) {
      const keys = Object.keys(records[0].rawData);
      if (keys.length > 0) return keys;
    }
    // Fallback default columns
    return [
      "Customer Name",
      "Phone Number",
      "Branch / City",
      "Eligible Amount",
      "State",
    ];
  }, [fileHeaders, filterOptions?.headers, records]);

  const hasActiveFilters = Boolean(
    search ||
      city ||
      state ||
      year ||
      category ||
      cibilMin !== undefined ||
      lender ||
      (customColumn && customValue) ||
      minAmount !== undefined ||
      maxAmount !== undefined
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(records.map((r) => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    records.length > 0 && selectedIds.length === records.length;

  const handleQuickCountChange = (val: number) => {
    const safeVal = Math.max(1, Math.min(val, total || 1));
    setQuickCount(safeVal);
    setCustomInput(String(safeVal));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setCustomInput(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuickCount(parsed);
    }
  };

  // Helper to render cell content nicely based on column type
  const renderCellContent = (record: DriveRecordItem, colName: string) => {
    const rawVal =
      record.rawData?.[colName] !== undefined
        ? String(record.rawData[colName]).trim()
        : "";

    const lowerCol = colName.toLowerCase();

    // 1. Phone number column
    if (
      lowerCol.includes("phone") ||
      lowerCol.includes("mobile") ||
      lowerCol.includes("contact no") ||
      lowerCol.includes("number 1")
    ) {
      const val = rawVal || record.phone;
      if (!val || val === "--") return <span className="text-gray-400">--</span>;
      return (
        <span className="flex items-center gap-1.5 font-mono text-gray-800 font-semibold">
          <Phone size={12} className="text-blue-500 shrink-0" />
          {val}
        </span>
      );
    }

    // 2. Eligibility / Amount column
    if (
      lowerCol.includes("amount") ||
      lowerCol.includes("eligibility") ||
      lowerCol.includes("loan")
    ) {
      const numVal = rawVal
        ? Number(rawVal.replace(/[^0-9.-]+/g, ""))
        : record.eligibilityAmount;
      if (!numVal || isNaN(numVal))
        return <span className="text-gray-400">--</span>;
      return (
        <span className="flex items-center gap-0.5 text-emerald-700 font-bold">
          <IndianRupee size={12} />
          {numVal.toLocaleString("en-IN")}
        </span>
      );
    }

    // 3. Category column
    if (lowerCol === "category") {
      const val = rawVal || "--";
      if (!val || val === "--") return <span className="text-gray-400">--</span>;
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
          <Tag size={10} className="text-purple-600" />
          {val}
        </span>
      );
    }

    // 4. District / City / Branch column
    if (
      lowerCol.includes("district") ||
      lowerCol.includes("city") ||
      lowerCol.includes("branch")
    ) {
      const val = rawVal || record.branch;
      if (!val || val === "--") return <span className="text-gray-400">--</span>;
      return (
        <span className="flex items-center gap-1 text-gray-700 font-medium">
          <Building size={12} className="text-gray-400 shrink-0" />
          {val}
        </span>
      );
    }

    // 5. State column
    if (lowerCol === "state") {
      const val = rawVal || record.state;
      if (!val || val === "--") return <span className="text-gray-400">--</span>;
      return (
        <span className="flex items-center gap-1 text-gray-700 font-medium">
          <MapPin size={12} className="text-gray-400 shrink-0" />
          {val}
        </span>
      );
    }

    // 6. Qualification column
    if (lowerCol.includes("qualification")) {
      const val = rawVal || "--";
      if (!val || val === "--") return <span className="text-gray-400">--</span>;
      return (
        <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
          <GraduationCap size={12} className="text-indigo-500 shrink-0" />
          {val}
        </span>
      );
    }

    // 7. Person / Doctor / Customer name
    if (
      lowerCol.includes("name") ||
      lowerCol.includes("person") ||
      lowerCol.includes("candidate")
    ) {
      const val = rawVal || record.customerName;
      return (
        <span className="font-bold text-gray-900">
          {val || <span className="text-gray-400">--</span>}
        </span>
      );
    }

    // Default cell text
    return rawVal ? (
      <span className="text-gray-700 font-medium">{rawVal}</span>
    ) : (
      <span className="text-gray-400">--</span>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
              Available Data Pool
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                {total.toLocaleString("en-IN")} ready
              </span>
              {hasActiveFilters && totalUnfiltered && total !== totalUnfiltered && (
                <span className="text-[11px] font-medium text-gray-400">
                  (filtered from {totalUnfiltered.toLocaleString("en-IN")} total)
                </span>
              )}
            </h4>
            <p className="text-xs text-gray-500">
              Columns are displayed according to this file&apos;s Excel structure. Filter by any column and allocate leads directly.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-52">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search in all columns..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* Toggle Filter Bar */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-sm ${
              hasActiveFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-600 text-white w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                !
              </span>
            )}
          </button>

          {/* Quick Count & Custom Number Allocate Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-indigo-50/60 p-1.5 rounded-2xl border border-indigo-100">
            {/* Direct Number Input */}
            <div className="flex items-center gap-1.5 bg-white border border-indigo-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-[11px] font-bold text-indigo-700">Count:</span>
              <input
                type="number"
                min={1}
                max={total || 999999}
                value={customInput}
                onChange={handleCustomInputChange}
                className="w-16 text-xs font-bold text-gray-900 focus:outline-none"
                placeholder="Qty"
              />
            </div>

            {/* Presets Dropdown */}
            <select
              value={quickCount}
              onChange={(e) => handleQuickCountChange(Number(e.target.value))}
              className="rounded-xl border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-900 shadow-sm focus:outline-none"
            >
              <option value={25}>25 Leads</option>
              <option value={50}>50 Leads</option>
              <option value={100}>100 Leads</option>
              <option value={250}>250 Leads</option>
              <option value={500}>500 Leads</option>
              <option value={1000}>1,000 Leads</option>
              <option value={2500}>2,500 Leads</option>
              <option value={5000}>5,000 Leads</option>
              {total > 0 && (
                <option value={total}>
                  All {total.toLocaleString()} {hasActiveFilters ? "Filtered" : ""} Leads
                </option>
              )}
            </select>

            {/* Quick Chips */}
            <div className="hidden sm:flex items-center gap-1">
              {[50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickCountChange(preset)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                    quickCount === preset
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  {preset}
                </button>
              ))}
              {total > 0 && (
                <button
                  type="button"
                  onClick={() => handleQuickCountChange(total)}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                    quickCount === total
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  All ({total.toLocaleString()})
                </button>
              )}
            </div>

            {/* Allocate Button */}
            <button
              onClick={() => onOpenAllocateModal([], quickCount)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-95 whitespace-nowrap"
            >
              <Zap size={14} /> Allocate Top {quickCount.toLocaleString()}{" "}
              {hasActiveFilters ? "Filtered" : ""}
            </button>
          </div>

          {/* Allocate Selected Checkboxes Button */}
          {selectedIds.length > 0 && (
            <button
              onClick={() => onOpenAllocateModal(selectedIds)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-95 animate-in fade-in"
            >
              <UserCheck size={14} /> Allocate Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Filter Bar */}
      {showFilters && (
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50/40 via-indigo-50/30 to-purple-50/30 p-4 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Filter Leads by Excel Parameters
              </span>
              {loadingFilterOptions && (
                <span className="text-[11px] text-gray-400 italic">
                  (Loading filter options...)
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <RotateCcw size={12} /> Clear all filters
              </button>
            )}
          </div>

          {/* Responsive Filter Grid: Shows relevant filters for this file */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* 1. City / Branch / District Filter (Searchable with Auto-complete Datalist + Quick Badges) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building size={12} className="text-blue-500" />
                  City / Branch / District {filterOptions?.cities ? `(${filterOptions.cities.length})` : ""}
                </span>
                {city && (
                  <button
                    type="button"
                    onClick={() => onCityChange("")}
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Clear
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="available-city-datalist"
                  placeholder="Type city (e.g. Mumbai, Delhi, Surat)..."
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none"
                />
                <datalist id="available-city-datalist">
                  {filterOptions?.cities?.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              {/* Quick Popular City Badges */}
              {filterOptions && filterOptions.cities.length > 0 && !city && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {["MUMBAI", "DELHI", "JAIPUR", "AHMEDABAD", "SURAT", "PUNE", "BANGALORE"]
                    .filter((topCity) =>
                      filterOptions.cities.some(
                        (c) => c.toUpperCase() === topCity || c.toUpperCase().includes(topCity)
                      )
                    )
                    .slice(0, 4)
                    .map((topCity) => (
                      <button
                        key={topCity}
                        type="button"
                        onClick={() => onCityChange(topCity)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium border border-blue-200 transition"
                      >
                        +{topCity}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* 2. State Filter (Normalized Indian states) */}
            {filterOptions && filterOptions.states.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={12} className="text-purple-500" />
                  State ({filterOptions.states.length})
                </label>
                <select
                  value={state}
                  onChange={(e) => onStateChange(e.target.value)}
                  disabled={loadingFilterOptions}
                  className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="">All States</option>
                  {filterOptions.states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. CIBIL Score Filter */}
            {(filterOptions?.hasCibil || onCibilMinChange) && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Award size={12} className="text-emerald-500" />
                  Min CIBIL Score
                </label>
                <select
                  value={cibilMin ?? ""}
                  onChange={(e) =>
                    onCibilMinChange &&
                    onCibilMinChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Any CIBIL Score</option>
                  <option value="700">700 & Above (Standard)</option>
                  <option value="750">750 & Above (Prime)</option>
                  <option value="800">800 & Above (Super Prime)</option>
                  <option value="650">650 & Above</option>
                </select>
              </div>
            )}

            {/* 4. Lender / Bank / Employer / Partner Filter */}
            {filterOptions &&
              filterOptions.lenders &&
              filterOptions.lenders.length > 0 &&
              onLenderChange && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Building2 size={12} className="text-cyan-500" />
                    Lender / Company ({filterOptions.lenders.length})
                  </label>
                  <select
                    value={lender || ""}
                    onChange={(e) => onLenderChange(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="">All Lenders / Companies</option>
                    {filterOptions.lenders.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* 5. Category Filter */}
            {filterOptions &&
              filterOptions.categories &&
              filterOptions.categories.length > 0 &&
              onCategoryChange && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Tag size={12} className="text-purple-500" />
                    Category ({filterOptions.categories.length})
                  </label>
                  <select
                    value={category}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    disabled={loadingFilterOptions}
                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {filterOptions.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* 6. Year / Period Filter */}
            {filterOptions && filterOptions.years.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={12} className="text-amber-500" />
                  Year / Period ({filterOptions.years.length})
                </label>
                <select
                  value={year}
                  onChange={(e) => onYearChange(e.target.value)}
                  disabled={loadingFilterOptions}
                  className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-amber-500 focus:outline-none"
                >
                  <option value="">All Years / Periods</option>
                  {filterOptions.years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 7. Eligibility Amount Range Filter */}
            {filterOptions && filterOptions.maxAmount > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <IndianRupee size={12} className="text-emerald-500" />
                  Min Eligible Amount
                </label>
                <select
                  value={minAmount ?? ""}
                  onChange={(e) =>
                    onMinAmountChange(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-800 shadow-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Any Amount</option>
                  <option value="50000">₹50,000 & above</option>
                  <option value="100000">₹1,00,000 & above</option>
                  <option value="250000">₹2,50,000 & above</option>
                  <option value="500000">₹5,00,000 & above</option>
                  <option value="1000000">₹10,00,000 & above</option>
                  <option value="2500000">₹25,00,000 & above</option>
                </select>
              </div>
            )}

            {/* 8. Filter by Any Excel Column (Dynamic Filter) */}
            {dynamicColumns && dynamicColumns.length > 0 && onCustomColumnChange && onCustomValueChange && (
              <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 p-2 rounded-xl border border-blue-100 shadow-sm">
                <div className="w-full sm:w-1/2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                    Filter by Any Column:
                  </label>
                  <select
                    value={customColumn || ""}
                    onChange={(e) => onCustomColumnChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Choose Column...</option>
                    {dynamicColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                    Match Value:
                  </label>
                  <input
                    type="text"
                    placeholder={customColumn ? `Search in ${customColumn}...` : "Pick column first"}
                    disabled={!customColumn}
                    value={customValue || ""}
                    onChange={(e) => onCustomValueChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
              <span className="text-[11px] text-gray-500 font-bold">
                Active Filter Badges:
              </span>
              {city && (
                <span className="inline-flex items-center gap-1 bg-blue-100/90 text-blue-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-blue-200">
                  Location: {city}
                  <button
                    onClick={() => onCityChange("")}
                    className="hover:text-blue-950 text-blue-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {state && (
                <span className="inline-flex items-center gap-1 bg-purple-100/90 text-purple-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-purple-200">
                  State: {state}
                  <button
                    onClick={() => onStateChange("")}
                    className="hover:text-purple-950 text-purple-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {cibilMin !== undefined && onCibilMinChange && (
                <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-emerald-200">
                  CIBIL: {cibilMin}+
                  <button
                    onClick={() => onCibilMinChange(undefined)}
                    className="hover:text-emerald-950 text-emerald-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {lender && onLenderChange && (
                <span className="inline-flex items-center gap-1 bg-cyan-100/90 text-cyan-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-cyan-200">
                  Lender/Company: {lender}
                  <button
                    onClick={() => onLenderChange("")}
                    className="hover:text-cyan-950 text-cyan-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {customColumn && customValue && onCustomValueChange && (
                <span className="inline-flex items-center gap-1 bg-indigo-100/90 text-indigo-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-indigo-200">
                  {customColumn}: &quot;{customValue}&quot;
                  <button
                    onClick={() => onCustomValueChange("")}
                    className="hover:text-indigo-950 text-indigo-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {category && onCategoryChange && (
                <span className="inline-flex items-center gap-1 bg-purple-100/90 text-purple-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-purple-200">
                  Category: {category}
                  <button
                    onClick={() => onCategoryChange("")}
                    className="hover:text-purple-950 text-purple-600 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {year && (
                <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-900 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-amber-200">
                  Year/Period: {year}
                  <button
                    onClick={() => onYearChange("")}
                    className="hover:text-amber-950 text-amber-700 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {minAmount !== undefined && (
                <span className="inline-flex items-center gap-1 bg-emerald-100/90 text-emerald-900 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-emerald-200">
                  Min: ₹{minAmount.toLocaleString("en-IN")}
                  <button
                    onClick={() => onMinAmountChange(undefined)}
                    className="hover:text-emerald-950 text-emerald-700 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-lg text-[11px] font-semibold border border-gray-300">
                  Search: &quot;{search}&quot;
                  <button
                    onClick={() => onSearchChange("")}
                    className="hover:text-black ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table: Dynamically reflects the Excel Columns */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700 whitespace-nowrap">
          <thead className="bg-[#0b2545] text-white text-[11px] font-bold uppercase tracking-wider border-b border-gray-200 shadow-sm">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 w-12 text-gray-300">#</th>

              {/* Dynamic Headers from Excel File */}
              {dynamicColumns.map((colName) => (
                <th key={colName} className="p-4 text-white">
                  {colName}
                </th>
              ))}

              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={dynamicColumns.length + 4}
                  className="p-8 text-center text-xs text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    Loading data records...
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={dynamicColumns.length + 4}
                  className="p-12 text-center text-xs text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers size={32} className="text-gray-300" />
                    <p className="font-semibold text-gray-600">
                      No matching records found
                    </p>
                    <p className="text-gray-400">
                      Try changing or clearing filters, or select another Google Drive file.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="mt-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 font-bold hover:bg-blue-100 transition"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              records.map((r, idx) => {
                const isChecked = selectedIds.includes(r._id);
                return (
                  <tr
                    key={r._id}
                    className={`hover:bg-blue-50/40 transition ${
                      isChecked ? "bg-blue-50/60" : ""
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSelectOne(r._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-400">
                      {(page - 1) * limit + idx + 1}
                    </td>

                    {/* Dynamic Data Cells corresponding to Excel columns */}
                    {dynamicColumns.map((colName) => (
                      <td key={colName} className="p-4">
                        {renderCellContent(r, colName)}
                      </td>
                    ))}

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        Available
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onOpenAllocateModal([r._id])}
                        className="rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 px-2.5 py-1 text-xs font-bold transition active:scale-95"
                      >
                        Allocate
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-gray-500 bg-gray-50/30">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            Showing{" "}
            <strong className="text-gray-800">
              {records.length > 0 ? (page - 1) * limit + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-gray-800">
              {Math.min(page * limit, total)}
            </strong>{" "}
            of <strong className="text-gray-800">{total.toLocaleString()}</strong> available records
            {hasActiveFilters && totalUnfiltered && total !== totalUnfiltered && (
              <span className="text-gray-400 ml-1">
                (filtered from {totalUnfiltered.toLocaleString()} total)
              </span>
            )}
          </div>

          {onLimitChange && (
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
              <span className="text-gray-400">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="px-2 font-bold text-gray-800">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
