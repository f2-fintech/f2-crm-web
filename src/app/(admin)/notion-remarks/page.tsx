"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, Users, FileSpreadsheet, MessageSquare,
  TrendingUp, CheckCircle2, XCircle, Clock, Search,
  ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  BarChart2, RefreshCw, AlertCircle, X
} from "lucide-react";
import api from "@/lib/axios";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
interface SheetPage {
  _id: string;
  title: string;
  teamName: string;
  assignedTo: string;
  createdAt: string;
  columns?: any[];
  columnNames?: string[];
  remarkColumnNames: string[];
  totalRows: number;
  remarksFilled: number;
  remarksEmpty: number;
  rows: Record<string, any>[];
}

interface RemarkItem {
  team: string;
  sheet: string;
  assignedTo: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral" | "empty";
  lead: string;
  disposition: string;
}

// ─── Remark Classifier ────────────────────────────────────────────────────────
function classifyRemark(text: string): "positive" | "negative" | "neutral" | "empty" {
  if (!text || text.trim() === "" || text.trim() === "-") return "empty";
  const t = text.toLowerCase();
  const neg = [
    'not interested', 'wrong number', 'fake', 'no response', 'not picking', 
    'switch off', 'switched off', 'busy', 'hang up', 'abusive', 'block', 
    'reject', 'invalid', 'call cut', 'cut'
  ];
  const pos = [
    'interested', 'callback', 'call back', 'done', 'agreed', 'positive', 
    'meeting', 'met', 'follow up', 'ok', 'yes', 'good', 'connected', 
    'visit', 'willing', 'login'
  ];
  if (neg.some(w => t.includes(w))) return "negative";
  if (pos.some(w => t.includes(w))) return "positive";
  return "neutral";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotionAdminDashboard() {
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // General Filter
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sheets" | "remarks">("overview");

  // Sheets Pagination
  const [sheetsPage, setSheetsPage] = useState(1);
  const [sheetsPerPage, setSheetsPerPage] = useState(8);

  // Remarks Feed State & Pagination
  const [remarkFilter, setRemarkFilter] = useState<"all" | "positive" | "negative" | "neutral">("all");
  const [remarksSearch, setRemarksSearch] = useState("");
  const [remarksPage, setRemarksPage] = useState(1);
  const [remarksPerPage, setRemarksPerPage] = useState(25);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/notion-pages/admin/remarks", { timeout: 30000 });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.data || []);
      setPages(list);
    } catch (err: any) {
      console.error("Failed to fetch notion remarks", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to connect to backend server";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Derived Analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const teams = new Set<string>();
    let totalLeads = 0, positive = 0, negative = 0, neutral = 0, empty = 0;
    const teamMap: Record<string, { positive: number; negative: number; neutral: number; empty: number; total: number }> = {};
    const allRemarks: RemarkItem[] = [];

    pages.forEach(page => {
      teams.add(page.teamName);
      if (!teamMap[page.teamName]) {
        teamMap[page.teamName] = { positive: 0, negative: 0, neutral: 0, empty: 0, total: 0 };
      }
      
      totalLeads += page.totalRows || 0;
      teamMap[page.teamName].total += page.totalRows || 0;
      
      empty += page.remarksEmpty || 0;
      teamMap[page.teamName].empty += page.remarksEmpty || 0;

      page.rows.forEach(row => {
        // Get remark value
        const remarkText = page.remarkColumnNames
          .map(k => String(row[k] || ""))
          .find(v => v.trim() !== "") || row.feedback_notes || "";
          
        const disposition = row.disposition || row.Disposition || "";
        const textToAnalyze = remarkText || disposition;

        // Get lead name
        const leadName = Object.entries(row)
          .filter(([k]) => !k.startsWith('_') && k !== 'id')
          .find(([k]) => k.toLowerCase().includes('name'))?.[1] 
          || `Lead #${row._rowId?.slice(-4) || '?'}`;

        const sentiment = classifyRemark(textToAnalyze);
        if (sentiment === "positive") {
          positive++;
          teamMap[page.teamName].positive++;
        } else if (sentiment === "negative") {
          negative++;
          teamMap[page.teamName].negative++;
        } else if (sentiment === "neutral") {
          neutral++;
          teamMap[page.teamName].neutral++;
        }

        if (remarkText || disposition) {
          allRemarks.push({
            team: page.teamName,
            sheet: page.title,
            assignedTo: page.assignedTo,
            text: remarkText,
            sentiment,
            lead: String(leadName),
            disposition,
          });
        }
      });
    });

    return {
      teams: Array.from(teams).sort(),
      totalLeads,
      positive,
      negative,
      neutral,
      empty,
      teamMap,
      allRemarks,
    };
  }, [pages]);

  // ── Chart Data ─────────────────────────────────────────────────────────────
  const donutSeries = [analytics.positive, analytics.negative, analytics.neutral, analytics.empty];
  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['Positive', 'Negative', 'Neutral', 'No Remark'],
    colors: ['#22c55e', '#ef4444', '#f59e0b', '#e2e8f0'],
    legend: { position: 'bottom', fontSize: '13px' },
    plotOptions: { pie: { donut: { size: '65%' } } },
    stroke: { width: 0 },
    dataLabels: { style: { fontFamily: 'inherit' } },
  };

  const teamNames = Object.keys(analytics.teamMap);
  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, fontFamily: 'inherit', toolbar: { show: false } },
    colors: ['#22c55e', '#ef4444', '#f59e0b', '#e2e8f0'],
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
    xaxis: { categories: teamNames, labels: { style: { fontFamily: 'inherit', fontSize: '12px' } } },
    legend: { position: 'top', fontFamily: 'inherit' },
    fill: { opacity: 1 },
    tooltip: { shared: true, intersect: false },
  };
  const barSeries = [
    { name: 'Positive', data: teamNames.map(t => analytics.teamMap[t]?.positive || 0) },
    { name: 'Negative', data: teamNames.map(t => analytics.teamMap[t]?.negative || 0) },
    { name: 'Neutral', data: teamNames.map(t => analytics.teamMap[t]?.neutral || 0) },
    { name: 'No Remark', data: teamNames.map(t => analytics.teamMap[t]?.empty || 0) },
  ];

  // ── Filtered & Paginated Sheets ─────────────────────────────────────────────
  const filteredPages = useMemo(() => {
    return pages.filter(p => {
      if (selectedTeam !== "All" && p.teamName !== selectedTeam) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(s) ||
          p.teamName.toLowerCase().includes(s) ||
          p.assignedTo.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [pages, selectedTeam, search]);

  const totalSheets = filteredPages.length;
  const totalSheetsPages = Math.max(1, Math.ceil(totalSheets / sheetsPerPage));
  const currentSheetsPage = Math.min(sheetsPage, totalSheetsPages);
  const pagedSheets = useMemo(() => {
    const start = (currentSheetsPage - 1) * sheetsPerPage;
    return filteredPages.slice(start, start + sheetsPerPage);
  }, [filteredPages, currentSheetsPage, sheetsPerPage]);

  // ── Filtered & Paginated Remarks ───────────────────────────────────────────
  const filteredRemarks = useMemo(() => {
    return analytics.allRemarks.filter(r => {
      if (remarkFilter !== "all" && r.sentiment !== remarkFilter) return false;
      if (remarksSearch.trim()) {
        const q = remarksSearch.toLowerCase().trim();
        const inLead = r.lead.toLowerCase().includes(q);
        const inText = r.text.toLowerCase().includes(q);
        const inDisp = (r.disposition || "").toLowerCase().includes(q);
        const inSheet = r.sheet.toLowerCase().includes(q);
        const inTeam = r.team.toLowerCase().includes(q);
        const inAssigned = r.assignedTo.toLowerCase().includes(q);
        if (!inLead && !inText && !inDisp && !inSheet && !inTeam && !inAssigned) return false;
      }
      return true;
    });
  }, [analytics.allRemarks, remarkFilter, remarksSearch]);

  const totalRemarks = filteredRemarks.length;
  const totalRemarksPages = Math.max(1, Math.ceil(totalRemarks / remarksPerPage));
  const currentRemarksPage = Math.min(remarksPage, totalRemarksPages);
  const pagedRemarks = useMemo(() => {
    const start = (currentRemarksPage - 1) * remarksPerPage;
    return filteredRemarks.slice(start, start + remarksPerPage);
  }, [filteredRemarks, currentRemarksPage, remarksPerPage]);

  // ── Sentiment Badge Helper ─────────────────────────────────────────────────
  const SentimentBadge = ({ s }: { s: string }) => {
    const map: Record<string, string> = {
      positive: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      negative: "bg-red-100 text-red-700 border border-red-200",
      neutral: "bg-amber-100 text-amber-700 border border-amber-200",
      empty: "bg-slate-100 text-slate-500 border border-slate-200"
    };
    const icon: Record<string, React.ReactNode> = {
      positive: <CheckCircle2 size={11} />,
      negative: <XCircle size={11} />,
      neutral: <Clock size={11} />,
      empty: <Clock size={11} />
    };
    const label: Record<string, string> = {
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
      empty: "Empty"
    };
    return (
      <span className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full ${map[s] || map.empty}`}>
        {icon[s] || icon.empty}
        {label[s] || s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-semibold text-sm">Loading Notion Remarks & Dashboard...</p>
      </div>
    );
  }

  if (error && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="bg-red-50 p-4 rounded-2xl mb-4 border border-red-200">
          <AlertCircle size={36} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to load Notion Remarks</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-sm text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Notion Master Remarks</h1>
            <p className="text-xs text-slate-400 font-medium">
              {pages.length} active sheets · {analytics.totalLeads.toLocaleString()} total leads · {analytics.allRemarks.length.toLocaleString()} remarks
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-200 shadow-2xs"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="px-6 lg:px-10 py-6 space-y-6">
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchData} className="underline font-bold hover:text-amber-900 ml-4">
              Retry
            </button>
          </div>
        )}

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPI icon={<FileSpreadsheet size={18} className="text-indigo-500" />} label="Total Sheets" value={pages.length} bg="bg-indigo-50" />
          <KPI icon={<Users size={18} className="text-blue-500" />} label="Total Leads" value={analytics.totalLeads} bg="bg-blue-50" />
          <KPI icon={<CheckCircle2 size={18} className="text-emerald-500" />} label="Positive Remarks" value={analytics.positive} sub={`${analytics.totalLeads ? Math.round((analytics.positive / analytics.totalLeads) * 100) : 0}% rate`} bg="bg-emerald-50" />
          <KPI icon={<XCircle size={18} className="text-red-500" />} label="Negative Remarks" value={analytics.negative} sub={`${analytics.totalLeads ? Math.round((analytics.negative / analytics.totalLeads) * 100) : 0}% rate`} bg="bg-red-50" />
          <KPI icon={<Clock size={18} className="text-slate-400" />} label="Pending Remarks" value={analytics.empty} bg="bg-slate-100" />
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 bg-slate-200/70 p-1 rounded-xl w-fit">
          {(["overview", "sheets", "remarks"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "overview" && <><BarChart2 size={13} className="inline mr-1.5 mb-0.5" />Overview</>}
              {tab === "sheets" && <><FileSpreadsheet size={13} className="inline mr-1.5 mb-0.5" />Sheets ({filteredPages.length})</>}
              {tab === "remarks" && <><MessageSquare size={13} className="inline mr-1.5 mb-0.5" />Remarks Feed ({analytics.allRemarks.length})</>}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-500" /> Overall Remark Sentiment
              </h3>
              {analytics.totalLeads > 0 ? (
                <Chart options={donutOptions} series={donutSeries} type="donut" width="100%" height={300} />
              ) : (
                <EmptyState />
              )}
            </div>
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-500" /> Movement by Team
              </h3>
              {teamNames.length > 0 ? (
                <Chart options={barOptions} series={barSeries} type="bar" width="100%" height={300} />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ SHEETS TAB (PAGINATED) ══════════════════ */}
        {activeTab === "sheets" && (
          <div className="space-y-4">
            {/* Search & Team Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sheets by title, team, assignee..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setSheetsPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <FilterPill
                  label="All Teams"
                  active={selectedTeam === "All"}
                  onClick={() => {
                    setSelectedTeam("All");
                    setSheetsPage(1);
                  }}
                />
                {analytics.teams.map(t => (
                  <FilterPill
                    key={t}
                    label={t}
                    active={selectedTeam === t}
                    onClick={() => {
                      setSelectedTeam(t);
                      setSheetsPage(1);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sheets List Cards */}
            {pagedSheets.length === 0 ? (
              <EmptyState message="No sheets match your filters" />
            ) : (
              <div className="space-y-3">
                {pagedSheets.map(page => {
                  const isOpen = expandedPage === page._id;
                  const pct = page.totalRows > 0 ? Math.round((page.remarksFilled / page.totalRows) * 100) : 0;
                  return (
                    <div key={page._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Sheet Header Row */}
                      <button
                        onClick={() => setExpandedPage(isOpen ? null : page._id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                          <div className="bg-indigo-50 p-2.5 rounded-xl flex-shrink-0">
                            <FileSpreadsheet size={18} className="text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm truncate">{page.title}</div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-semibold">
                              <span className="flex items-center gap-1 text-slate-600"><Users size={11} /> {page.teamName}</span>
                              <span>·</span>
                              <span>Assigned: <span className="text-slate-700">{page.assignedTo}</span></span>
                              <span>·</span>
                              <span>{page.totalRows} leads</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                          {/* Progress Bar */}
                          <div className="hidden md:block w-32">
                            <div className="text-xs text-slate-400 font-semibold mb-1 flex justify-between">
                              <span>Remarks</span><span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{page.remarksFilled} filled</span>
                            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{page.remarksEmpty} empty</span>
                          </div>
                          {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                        </div>
                      </button>

                      {/* Expanded: Paginated Row Table */}
                      {isOpen && (
                        <SheetRowTable
                          page={page}
                          classifyRemark={classifyRemark}
                          SentimentBadge={SentimentBadge}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sheets Pagination Footer */}
            {totalSheets > sheetsPerPage && (
              <div className="flex flex-wrap items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600 gap-3">
                <div>
                  Showing <strong>{(currentSheetsPage - 1) * sheetsPerPage + 1}</strong> to <strong>{Math.min(currentSheetsPage * sheetsPerPage, totalSheets)}</strong> of <strong>{totalSheets}</strong> sheets
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentSheetsPage <= 1}
                    onClick={() => setSheetsPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-xs disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalSheetsPages }, (_, i) => i + 1).slice(
                    Math.max(0, currentSheetsPage - 3),
                    Math.min(totalSheetsPages, currentSheetsPage + 2)
                  ).map(p => (
                    <button
                      key={p}
                      onClick={() => setSheetsPage(p)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                        p === currentSheetsPage
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={currentSheetsPage >= totalSheetsPages}
                    onClick={() => setSheetsPage(p => Math.min(totalSheetsPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-xs disabled:opacity-40 hover:bg-slate-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════ REMARKS FEED TAB (PAGINATED) ══════════════════ */}
        {activeTab === "remarks" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Toolbar */}
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <MessageSquare size={16} className="text-indigo-500" />
                  All Remarks Feed — {filteredRemarks.length} {remarkFilter !== "all" ? `(${remarkFilter})` : ""} of {analytics.allRemarks.length}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Page {currentRemarksPage} of {totalRemarksPages} · {remarksPerPage} per page
                </p>
              </div>

              {/* Search Inside Remarks */}
              <div className="relative flex-grow max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by lead, remark text, sheet..."
                  value={remarksSearch}
                  onChange={e => {
                    setRemarksSearch(e.target.value);
                    setRemarksPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50"
                />
                {remarksSearch && (
                  <button
                    onClick={() => {
                      setRemarksSearch("");
                      setRemarksPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Sentiment Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => { setRemarkFilter("all"); setRemarksPage(1); }}
                  className={`px-3 py-1 rounded-full border transition ${
                    remarkFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  All ({analytics.allRemarks.length})
                </button>
                <button
                  onClick={() => { setRemarkFilter("positive"); setRemarksPage(1); }}
                  className={`px-3 py-1 rounded-full border transition ${
                    remarkFilter === "positive" ? "bg-emerald-600 text-white border-emerald-600" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  {analytics.positive} Positive
                </button>
                <button
                  onClick={() => { setRemarkFilter("negative"); setRemarksPage(1); }}
                  className={`px-3 py-1 rounded-full border transition ${
                    remarkFilter === "negative" ? "bg-rose-600 text-white border-rose-600" : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  {analytics.negative} Negative
                </button>
                <button
                  onClick={() => { setRemarkFilter("neutral"); setRemarksPage(1); }}
                  className={`px-3 py-1 rounded-full border transition ${
                    remarkFilter === "neutral" ? "bg-amber-600 text-white border-amber-600" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  {analytics.neutral} Neutral
                </button>
              </div>
            </div>

            {/* Paginated Remarks Cards */}
            <div className="divide-y divide-slate-100 min-h-[200px]">
              {pagedRemarks.length === 0 ? (
                <EmptyState message="No remarks match your search criteria" />
              ) : (
                pagedRemarks.map((r, i) => {
                  const sentimentColor: Record<string, string> = {
                    positive: "border-l-4 border-emerald-500 bg-emerald-50/20",
                    negative: "border-l-4 border-red-500 bg-red-50/20",
                    neutral: "border-l-4 border-amber-500 bg-amber-50/15",
                    empty: "border-l-4 border-slate-200",
                  };
                  return (
                    <div key={i} className={`px-6 py-4 hover:bg-slate-50/70 transition-colors ${sentimentColor[r.sentiment]}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow min-w-0">
                          <div className="font-bold text-slate-800 text-sm mb-1">{r.lead}</div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {r.disposition && (
                              <span className="bg-indigo-100 text-indigo-700 text-[10.5px] font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                                {r.disposition}
                              </span>
                            )}
                            {r.text && (
                              <div className="text-slate-700 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 font-medium shadow-2xs">
                                &quot;{r.text}&quot;
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{r.team}</span>
                            <span>Sheet: <strong className="text-slate-600">{r.sheet}</strong></span>
                            <span>· Assigned: <strong className="text-slate-600">{r.assignedTo}</strong></span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <SentimentBadge s={r.sentiment} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 gap-4">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong>{totalRemarks > 0 ? (currentRemarksPage - 1) * remarksPerPage + 1 : 0}</strong> to{" "}
                  <strong>{Math.min(currentRemarksPage * remarksPerPage, totalRemarks)}</strong> of{" "}
                  <strong>{totalRemarks}</strong> remarks
                </span>

                {/* Per Page Selector */}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-slate-400">Rows:</span>
                  <select
                    value={remarksPerPage}
                    onChange={(e) => {
                      setRemarksPerPage(Number(e.target.value));
                      setRemarksPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                <button
                  disabled={currentRemarksPage <= 1}
                  onClick={() => setRemarksPage(1)}
                  title="First Page"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  disabled={currentRemarksPage <= 1}
                  onClick={() => setRemarksPage(p => Math.max(1, p - 1))}
                  title="Previous Page"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition flex items-center gap-1"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {/* Page numbers window */}
                {Array.from({ length: totalRemarksPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalRemarksPages || Math.abs(p - currentRemarksPage) <= 2)
                  .map((p, idx, arr) => {
                    const prevP = arr[idx - 1];
                    const showEllipsis = prevP && p - prevP > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          onClick={() => setRemarksPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                            p === currentRemarksPage
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  disabled={currentRemarksPage >= totalRemarksPages}
                  onClick={() => setRemarksPage(p => Math.min(totalRemarksPages, p + 1))}
                  title="Next Page"
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition flex items-center gap-1"
                >
                  Next <ChevronRight size={13} />
                </button>
                <button
                  disabled={currentRemarksPage >= totalRemarksPages}
                  onClick={() => setRemarksPage(totalRemarksPages)}
                  title="Last Page"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sheet Row Table with Internal Pagination ──────────────────────────────────
function SheetRowTable({
  page,
  classifyRemark,
  SentimentBadge,
}: {
  page: SheetPage;
  classifyRemark: (t: string) => "positive" | "negative" | "neutral" | "empty";
  SentimentBadge: React.FC<{ s: string }>;
}) {
  const [rowPage, setRowPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const total = page.rows.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(rowPage, totalPages);
  const pagedRows = page.rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="border-t border-slate-100">
      <div className="overflow-x-auto max-h-[450px]">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold text-xs uppercase text-slate-400 w-12 text-center">#</th>
              {Object.keys(page.rows[0] || {})
                .filter((k) => k !== "_rowId")
                .map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap ${
                      page.remarkColumnNames.includes(col)
                        ? "text-indigo-600"
                        : "text-slate-500"
                    }`}
                  >
                    {page.remarkColumnNames.includes(col) ? "💬 " : ""}
                    {col}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.map((row, idx) => {
              const globalIndex = (currentPage - 1) * rowsPerPage + idx + 1;
              const remarkText =
                page.remarkColumnNames
                  .map((k) => row[k] || "")
                  .find((v) => String(v).trim() !== "") || row.feedback_notes || "";
              const sentiment = classifyRemark(String(remarkText));
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 text-center">{globalIndex}</td>
                  {Object.entries(row)
                    .filter(([k]) => k !== "_rowId")
                    .map(([k, v]) => (
                      <td key={k} className="px-4 py-3 whitespace-nowrap">
                        {page.remarkColumnNames.includes(k) ? (
                          <div className="flex items-center gap-2">
                            <SentimentBadge s={sentiment} />
                            <span className="text-slate-700 font-medium text-xs max-w-[250px] truncate">
                              {String(v) || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">{String(v) || "—"}</span>
                        )}
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Row Pagination Footer */}
      {total > 15 && (
        <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 gap-3">
          <div>
            Showing <strong>{(currentPage - 1) * rowsPerPage + 1}</strong> to{" "}
            <strong>{Math.min(currentPage * rowsPerPage, total)}</strong> of{" "}
            <strong>{total}</strong> rows
          </div>
          <div className="flex items-center gap-2">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setRowPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs font-semibold text-slate-700"
            >
              <option value={15}>15 per page</option>
              <option value={30}>30 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <button
              disabled={currentPage <= 1}
              onClick={() => setRowPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-0.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 font-bold text-xs"
            >
              Prev
            </button>
            <span className="font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setRowPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-0.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 font-bold text-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function KPI({ icon, label, value, sub, bg }: { icon: React.ReactNode; label: string; value: number; sub?: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg}`}>{icon}</div>
      </div>
      <p className="text-2xl font-black text-slate-900">{value.toLocaleString()}</p>
      <p className="text-xs font-semibold text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-emerald-600 font-bold mt-1">{sub}</p>}
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
        active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center text-slate-400">
      <BarChart2 size={36} className="mb-3 opacity-30" />
      <p className="font-semibold text-sm">No data to display</p>
      <p className="text-xs mt-1 text-slate-400">{message || "No remarks or sheets found matching current filters"}</p>
    </div>
  );
}
