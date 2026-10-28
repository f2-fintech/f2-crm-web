"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
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
  ChevronDown,
  Check,
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
  Plus,
  Trash2,
} from "lucide-react";
import {
  DriveRecordItem,
  FileFilterOptions,
  CustomFilterItem,
  driveAllocationService,
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
  customFilters?: CustomFilterItem[];
  onCustomFiltersChange?: (filters: CustomFilterItem[]) => void;
  fileId?: string;
}

interface ColumnValueMultiSelectProps {
  column: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  fileId?: string;
}

function ColumnValueMultiSelect({
  column,
  options,
  selectedValues,
  onChange,
  placeholder,
  fileId,
}: ColumnValueMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [backendOptions, setBackendOptions] = useState<string[]>([]);
  const [isSearchingBackend, setIsSearchingBackend] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Live backend search for column values when user types in search box
  useEffect(() => {
    if (!fileId || !column || !search.trim()) {
      setBackendOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingBackend(true);
        const results = await driveAllocationService.searchColumnValues(
          fileId,
          column,
          search
        );
        if (Array.isArray(results)) {
          setBackendOptions(results);
        }
      } catch {
        // Fallback to client options
      } finally {
        setIsSearchingBackend(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [fileId, column, search]);

  const allAvailableOptions = useMemo(() => {
    const set = new Set<string>();
    options.forEach((opt) => {
      if (opt && opt.trim()) set.add(opt.trim());
    });
    selectedValues.forEach((val) => {
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set);
  }, [options, selectedValues]);

  const filteredOptions = useMemo(() => {
    const set = new Set<string>();
    // Include any values found in backend search
    backendOptions.forEach((opt) => set.add(opt));

    if (!search.trim()) {
      allAvailableOptions.forEach((opt) => set.add(opt));
    } else {
      const q = search.trim().toLowerCase();
      allAvailableOptions.forEach((opt) => {
        if (opt.toLowerCase().includes(q)) set.add(opt);
      });
    }
    return Array.from(set);
  }, [allAvailableOptions, backendOptions, search]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleRemoveOne = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== val));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearch("");
  };

  const handleSelectAllFiltered = () => {
    const newVals = new Set(selectedValues);
    filteredOptions.forEach((opt) => newVals.add(opt));
    onChange(Array.from(newVals));
  };

  const handleAddCustom = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (!selectedValues.includes(trimmed)) {
      onChange([...selectedValues, trimmed]);
    }
    setSearch("");
  };

  const isExactMatch = allAvailableOptions.some(
    (opt) => opt.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[240px] max-w-xl">
      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex min-h-[34px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 text-xs transition shadow-2xs ${
          isOpen
            ? "border-indigo-500 ring-2 ring-indigo-500/20"
            : selectedValues.length > 0
            ? "border-indigo-300 bg-indigo-50/20"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {selectedValues.length === 0 ? (
          <span className="text-gray-400 select-none flex items-center gap-1.5 py-0.5">
            <Search size={12} className="text-gray-300" />
            {placeholder || `Choose multiple values (${options.length} available)...`}
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-1 py-0.5 max-w-full">
            {selectedValues.slice(0, 3).map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 text-[11px] font-bold text-indigo-700"
              >
                <span className="truncate max-w-[120px]">{val}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveOne(e, val)}
                  className="text-indigo-400 hover:text-indigo-700 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            {selectedValues.length > 3 && (
              <span className="inline-flex items-center rounded-md bg-indigo-100 text-indigo-800 px-1.5 py-0.5 text-[10px] font-bold">
                +{selectedValues.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 shrink-0">
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
              title="Clear column selections"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={13}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] sm:min-w-[340px] max-w-md rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header: Search + Actions */}
          <div className="p-2 border-b border-gray-100 space-y-1.5 bg-gray-50/60 rounded-t-xl">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (search.trim()) {
                      if (!isExactMatch) {
                        handleAddCustom();
                      } else if (filteredOptions.length > 0) {
                        toggleOption(filteredOptions[0]);
                      }
                    }
                  }
                }}
                placeholder={`Search or type value in ${column}...`}
                className="w-full h-7 rounded-lg border border-gray-200 bg-white pl-7 pr-7 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between text-[11px] px-1 text-gray-500">
              <span className="font-semibold text-indigo-700 flex items-center gap-1.5">
                <span>{selectedValues.length} selected</span>
                {isSearchingBackend && (
                  <span className="text-[10px] font-normal text-indigo-500 italic animate-pulse">
                    (searching file...)
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {filteredOptions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    Select All ({filteredOptions.length})
                  </button>
                )}
                {selectedValues.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onChange([])}
                    className="font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {search.trim() && !isExactMatch && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="flex items-center gap-1.5 w-full rounded-lg px-2.5 py-1.5 text-xs text-left font-bold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100/80 transition cursor-pointer mb-1 border border-indigo-200 border-dashed"
              >
                <Plus size={12} />
                <span>Add &quot;{search.trim()}&quot; as filter value</span>
              </button>
            )}

            {filteredOptions.length === 0 && !search.trim() ? (
              <div className="p-3 text-center text-xs text-gray-400 italic">
                No values pre-loaded. Type any value above and press Enter to add.
              </div>
            ) : filteredOptions.length === 0 && search.trim() ? (
              <div className="p-3 text-center text-xs text-gray-400">
                No existing option matches &quot;{search}&quot;. Click above to add it.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs cursor-pointer transition select-none ${
                      isSelected
                        ? "bg-indigo-50 font-bold text-indigo-900"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="truncate">{opt}</span>
                    </div>
                    {isSelected && (
                      <Check size={13} className="text-indigo-600 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
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
  customFilters,
  onCustomFiltersChange,
  fileId,
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

  // Map of unique values per column from filterOptions and records
  const columnOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {};

    // 1. If backend provided columnUniqueValues, use them
    if (filterOptions?.columnUniqueValues) {
      Object.entries(filterOptions.columnUniqueValues).forEach(([k, vals]) => {
        map[k] = vals;
      });
    }

    // 2. Incorporate known normalized filterOptions lists as helpers
    if (filterOptions?.states && filterOptions.states.length > 0) {
      map["State"] = map["State"] || filterOptions.states;
      map["STATE"] = map["STATE"] || filterOptions.states;
    }
    if (filterOptions?.cities && filterOptions.cities.length > 0) {
      map["City"] = map["City"] || filterOptions.cities;
      map["CITY"] = map["CITY"] || filterOptions.cities;
      map["Branch"] = map["Branch"] || filterOptions.cities;
      map["Branch / City"] = map["Branch / City"] || filterOptions.cities;
      map["DISTRICT"] = map["DISTRICT"] || filterOptions.cities;
      map["District"] = map["District"] || filterOptions.cities;
    }
    if (filterOptions?.categories && filterOptions.categories.length > 0) {
      map["Category"] = map["Category"] || filterOptions.categories;
      map["CATEGORY"] = map["CATEGORY"] || filterOptions.categories;
    }
    if (filterOptions?.lenders && filterOptions.lenders.length > 0) {
      map["Lender"] = map["Lender"] || filterOptions.lenders;
      map["Partner_Name"] = map["Partner_Name"] || filterOptions.lenders;
    }
    if (filterOptions?.years && filterOptions.years.length > 0) {
      map["Year"] = map["Year"] || filterOptions.years;
      map["YEAR"] = map["YEAR"] || filterOptions.years;
    }

    // 3. Fallback: extract unique values from currently loaded records' rawData
    if (records && records.length > 0) {
      records.forEach((rec) => {
        if (!rec.rawData) return;
        Object.entries(rec.rawData).forEach(([k, v]) => {
          if (!map[k]) map[k] = [];
          const s = String(v ?? "").trim();
          if (
            s &&
            s !== "--" &&
            s.length <= 60 &&
            !map[k].includes(s) &&
            map[k].length < 200
          ) {
            map[k].push(s);
          }
        });
      });
    }

    return map;
  }, [filterOptions, records]);

  // Unique values for the currently selected column
  const getOptionsForColumn = (colName: string) => {
    if (!colName) return [];
    if (columnOptionsMap[colName] && columnOptionsMap[colName].length > 0) {
      return columnOptionsMap[colName];
    }
    const lowerKey = colName.toLowerCase();
    const found = Object.keys(columnOptionsMap).find(
      (k) => k.toLowerCase() === lowerKey
    );
    if (found && columnOptionsMap[found] && columnOptionsMap[found].length > 0) {
      return columnOptionsMap[found];
    }
    return [];
  };

  const isColAmount = (colName: string) => {
    return Boolean(
      colName && /(amount|eligib|loan|limit|salary|income)/i.test(colName)
    );
  };

  // If customFilters prop is passed, use it; otherwise fallback to single customColumn
  const activeFiltersList = useMemo<CustomFilterItem[]>(() => {
    if (customFilters !== undefined && customFilters.length > 0) {
      return customFilters;
    }
    if (customColumn || customValue || minAmount !== undefined || maxAmount !== undefined) {
      const parsedValues = customValue
        ? customValue.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      return [
        {
          id: "flt-single",
          column: customColumn || "",
          value: customValue || "",
          values: parsedValues,
          minAmount,
          maxAmount,
        },
      ];
    }
    return [{ id: "flt-init", column: "", value: "", values: [] }];
  }, [customFilters, customColumn, customValue, minAmount, maxAmount]);

  const handleAddFilterRow = (colName?: string) => {
    const newFilter: CustomFilterItem = {
      id: `flt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      column: colName || "",
      value: "",
      values: [],
    };
    const current = activeFiltersList.map((f) => ({ ...f }));
    const updated = [...current, newFilter];
    onCustomFiltersChange?.(updated);
  };

  const handleUpdateFilterRow = (index: number, updates: Partial<CustomFilterItem>) => {
    const list = [...activeFiltersList];
    if (!list[index]) {
      list[index] = { id: `flt-${Date.now()}`, column: "", value: "", values: [] };
    }
    const existing = list[index];
    const updatedItem = { ...existing, ...updates };

    if (updates.column !== undefined && updates.column !== existing.column) {
      updatedItem.value = "";
      updatedItem.values = [];
      updatedItem.minAmount = undefined;
      updatedItem.maxAmount = undefined;
    }

    // Keep value string and values array synchronized
    if (updates.values !== undefined && updates.value === undefined) {
      updatedItem.value = updates.values.join(", ");
    } else if (updates.value !== undefined && updates.values === undefined) {
      updatedItem.values = updates.value
        ? updates.value.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }

    list[index] = updatedItem;
    onCustomFiltersChange?.(list);

    if (index === 0) {
      if (updates.column !== undefined) onCustomColumnChange?.(updates.column);
      if (updatedItem.value !== undefined) onCustomValueChange?.(updatedItem.value);
      if (updates.minAmount !== undefined) onMinAmountChange?.(updates.minAmount);
      if (updates.maxAmount !== undefined) onMaxAmountChange?.(updates.maxAmount);
    }
  };

  const handleRemoveFilterRow = (index: number) => {
    const list = activeFiltersList.filter((_, i) => i !== index);
    onCustomFiltersChange?.(list);
    if (index === 0) {
      onCustomColumnChange?.("");
      onCustomValueChange?.("");
      onMinAmountChange?.(undefined);
      onMaxAmountChange?.(undefined);
    }
  };

  const hasActiveCustomFilters = Boolean(
    activeFiltersList.some(
      (f) =>
        f.column &&
        ((f.values && f.values.length > 0) ||
          f.value ||
          f.minAmount !== undefined ||
          f.maxAmount !== undefined)
    )
  );

  const hasActiveFilters = Boolean(
    search ||
      hasActiveCustomFilters ||
      (customColumn && customValue) ||
      city ||
      state ||
      year ||
      category ||
      cibilMin !== undefined ||
      lender ||
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

      {/* Simple, Modern Filter Bar */}
      {showFilters && (
        <div className="border-b border-gray-200/80 bg-slate-50/70 p-3 sm:p-4 space-y-2.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-indigo-600" />
              <span className="text-xs font-bold text-gray-700 tracking-wide">
                Filter Leads by Excel Columns
              </span>
              {loadingFilterOptions && (
                <span className="text-[11px] text-gray-400 italic">
                  (Loading...)
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                <RotateCcw size={11} /> Clear all filters
              </button>
            )}
          </div>

          {/* Clean Inline Filter Rows */}
          <div className="space-y-2">
            {activeFiltersList.map((flt, idx) => {
              const filterCol = flt.column || "";
              const isAmount = isColAmount(filterCol);
              const colOptions = getOptionsForColumn(filterCol);

              return (
                <div
                  key={flt.id || `filter-${idx}`}
                  className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-gray-200/90 px-3 py-2 shadow-2xs hover:border-indigo-200 transition"
                >
                  {/* Condition label: Where / And */}
                  {/* <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-12 shrink-0">
                    {idx === 0 ? "Where" : "And"}
                  </span> */}
                  

                  {/* Column Select */}
                  <select
                    value={filterCol}
                    onChange={(e) => {
                      handleUpdateFilterRow(idx, {
                        column: e.target.value,
                        value: "",
                        minAmount: undefined,
                        maxAmount: undefined,
                      });
                    }}
                    className="h-8 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-white px-2.5 text-xs font-semibold text-gray-800 focus:border-indigo-500 focus:outline-none transition min-w-[170px]"
                  >
                    <option value="">-- Choose Column --</option>
                    {dynamicColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>

                  {/* Value / Amount controls */}
                  <div className="flex-1 flex flex-wrap items-center gap-2 min-w-[200px]">
                    {!filterCol ? (
                      <span className="text-xs text-gray-400 italic">
                        Select a column to set condition...
                      </span>
                    ) : isAmount ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[11px] font-bold text-gray-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Min"
                            value={flt.minAmount ?? ""}
                            onChange={(e) => {
                              const val = e.target.value
                                ? Number(e.target.value)
                                : undefined;
                              handleUpdateFilterRow(idx, {
                                minAmount: val,
                              });
                            }}
                            className="h-8 w-24 sm:w-28 rounded-lg border border-gray-200 bg-white pl-5 pr-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition"
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">to</span>
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-[11px] font-bold text-gray-400">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="Max"
                            value={flt.maxAmount ?? ""}
                            onChange={(e) => {
                              const val = e.target.value
                                ? Number(e.target.value)
                                : undefined;
                              handleUpdateFilterRow(idx, {
                                maxAmount: val,
                              });
                            }}
                            className="h-8 w-24 sm:w-28 rounded-lg border border-gray-200 bg-white pl-5 pr-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none transition"
                          />
                        </div>

                        {/* Quick Presets */}
                        <div className="hidden md:flex items-center gap-1 ml-1">
                          {[
                            { label: "50k-1L", min: 50000, max: 100000 },
                            { label: "1L-2.5L", min: 100000, max: 250000 },
                            { label: "2.5L-5L", min: 250000, max: 500000 },
                            { label: "5L+", min: 500000, max: undefined },
                          ].map((p) => {
                            const isSel =
                              flt.minAmount === p.min &&
                              flt.maxAmount === p.max;
                            return (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  if (isSel) {
                                    handleUpdateFilterRow(idx, {
                                      minAmount: undefined,
                                      maxAmount: undefined,
                                    });
                                  } else {
                                    handleUpdateFilterRow(idx, {
                                      minAmount: p.min,
                                      maxAmount: p.max,
                                    });
                                  }
                                }}
                                className={`text-[10px] px-2 py-1 rounded-md font-medium border transition cursor-pointer ${
                                  isSel
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <ColumnValueMultiSelect
                        column={filterCol}
                        options={colOptions}
                        selectedValues={
                          flt.values && flt.values.length > 0
                            ? flt.values
                            : flt.value
                            ? flt.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : []
                        }
                        onChange={(vals) => {
                          handleUpdateFilterRow(idx, {
                            values: vals,
                            value: vals.join(", "),
                          });
                        }}
                        placeholder={`Select multiple ${filterCol} values...`}
                        fileId={fileId}
                      />
                    )}
                  </div>

                  {/* Remove Filter Row Button */}
                  {(activeFiltersList.length > 1 || flt.column) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFilterRow(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer shrink-0"
                      title="Remove condition"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Filter Button + Quick Column Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAddFilterRow()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>+ Add Column Filter</span>
            </button>

            {/* Quick-add unselected columns */}
            {dynamicColumns
              .filter((col) => !activeFiltersList.some((f) => f.column === col))
              .slice(0, 6)
              .map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => handleAddFilterRow(col)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 text-[11px] font-semibold transition cursor-pointer border border-gray-200 hover:border-indigo-200 shadow-2xs"
                >
                  <Plus size={10} className="text-gray-400" />
                  <span>{col}</span>
                </button>
              ))}
          </div>
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
