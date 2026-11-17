"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, Users, FileSpreadsheet, MessageSquare,
  TrendingUp, CheckCircle2, XCircle, Clock, Search,
  ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight,
  BarChart2, RefreshCw, AlertCircle, X, Flame, Phone, MessageCircle,
  Copy, Check, Sparkles, Filter, ExternalLink, UserCheck
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
  id: string;
  team: string;
  sheet: string;
  sheetId: string;
  assignedTo: string;
  text: string;
  sentiment: "positive" | "negative" | "neutral" | "empty";
  lead: string;
  phone: string;
  cleanPhone: string;
  disposition: string;
  isHot: boolean;
  isFollowup: boolean;
  hasNote: boolean;
}

interface CallerStat {
  name: string;
  team: string;
  hot: number;
  followup: number;
  withNotes: number;
  totalWorked: number;
}

// ─── Remark & Disposition Classifiers ──────────────────────────────────────────
function classifyRemark(text: string): "positive" | "negative" | "neutral" | "empty" {
  if (!text || text.trim() === "" || text.trim() === "-") return "empty";
  const t = text.toLowerCase();
  const neg = [
    'not interested', 'not eligible', 'ineligible', 'wrong number', 'fake', 'no response', 'not picking', 
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

function isHotDisposition(disp: string, text: string): boolean {
  const d = (disp || "").toLowerCase().trim();
  const t = (text || "").toLowerCase().trim();
  if (d.includes("not interested") || d.includes("not eligible")) return false;
  return (
    d === "interested" ||
    d === "login" ||
    d.includes("interested") ||
    d.includes("login") ||
    t.includes("interested") ||
    t.includes("login")
  );
}

function isFollowupDisposition(disp: string, text: string): boolean {
  const d = (disp || "").toLowerCase().trim();
  const t = (text || "").toLowerCase().trim();
  return (
    d.includes("follow up") ||
    d.includes("followup") ||
    d.includes("call back") ||
    d.includes("callback") ||
    d.includes("meeting") ||
    t.includes("follow up") ||
    t.includes("call back")
  );
}

function formatPhoneDisplay(clean: string, raw: string): string {
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return raw || clean;
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

  // Action Hub State & Pagination
  const [actionFilter, setActionFilter] = useState<"all_actionable" | "hot" | "followup" | "notes" | "all">("all_actionable");
  const [callerFilter, setCallerFilter] = useState<string>("All");
  const [remarksSearch, setRemarksSearch] = useState("");
  const [remarksPage, setRemarksPage] = useState(1);
  const [remarksPerPage, setRemarksPerPage] = useState(20);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

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

  const handleCopy = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => {
      setCopiedPhone(prev => (prev === phone ? null : prev));
    }, 2000);
  };

  // ── Derived Analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const teams = new Set<string>();
    let totalLeads = 0, positive = 0, negative = 0, neutral = 0, empty = 0;
    let hotCount = 0, followupCount = 0, notesCount = 0;
    const teamMap: Record<string, { positive: number; negative: number; neutral: number; empty: number; total: number }> = {};
    const callerMap: Record<string, CallerStat> = {};
    const allRemarks: RemarkItem[] = [];

    if (!Array.isArray(pages)) {
      return {
        teams: [],
        totalLeads: 0,
        positive: 0,
        negative: 0,
        neutral: 0,
        empty: 0,
        hotCount: 0,
        followupCount: 0,
        notesCount: 0,
        callerStats: [],
        teamMap: {},
        allRemarks: [],
      };
    }

    pages.forEach(page => {
      if (!page) return;
      const teamName = page.teamName || "Unassigned";
      teams.add(teamName);
      if (!teamMap[teamName]) {
        teamMap[teamName] = { positive: 0, negative: 0, neutral: 0, empty: 0, total: 0 };
      }
      
      const pageTotal = Number(page.totalRows) || (Array.isArray(page.rows) ? page.rows.length : 0);
      const pageFilled = Number(page.remarksFilled) || 0;
      const pageEmpty = Number(page.remarksEmpty) || Math.max(0, pageTotal - pageFilled);

      totalLeads += pageTotal;
      teamMap[teamName].total += pageTotal;
      
      empty += pageEmpty;
      teamMap[teamName].empty += pageEmpty;

      const safeRows = Array.isArray(page.rows) ? page.rows : [];
      const remarkCols = Array.isArray(page.remarkColumnNames) ? page.remarkColumnNames : [];

      safeRows.forEach((row, rowIdx) => {
        if (!row || typeof row !== "object") return;
        
        // 1. Get real remark text from feedback_notes or dynamic remark columns (NEVER from disposition)
        let remarkText = "";
        if (row.feedback_notes && String(row.feedback_notes).trim()) {
          remarkText = String(row.feedback_notes).trim();
        } else if (row.Remarks && String(row.Remarks).trim()) {
          remarkText = String(row.Remarks).trim();
        } else if (row.remarks && String(row.remarks).trim()) {
          remarkText = String(row.remarks).trim();
        } else {
          const found = remarkCols
            .filter(k => k && k.toLowerCase() !== "disposition")
            .map(k => String(row[k] || "").trim())
            .find(v => v !== "");
          if (found) remarkText = found;
        }

        const disposition = String(row.disposition || row.Disposition || "").trim();
        const textToAnalyze = remarkText || disposition;

        // 2. Extract Lead Phone
        let rawPhone = "";
        for (const [k, v] of Object.entries(row)) {
          if (!k || k.startsWith("_") || !v) continue;
          const kl = k.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (
            kl.includes("mobile") ||
            kl.includes("phone") ||
            kl.includes("contact") ||
            kl.includes("whatsapp") ||
            kl.includes("mob")
          ) {
            rawPhone = String(v).trim();
            break;
          }
        }
        if (!rawPhone) {
          for (const v of Object.values(row)) {
            if (!v) continue;
            const digits = String(v).replace(/\D/g, "");
            if (digits.length === 10 || (digits.length === 12 && digits.startsWith("91"))) {
              rawPhone = String(v).trim();
              break;
            }
          }
        }
        const digitsOnly = rawPhone.replace(/\D/g, "");
        const cleanPhone = digitsOnly.length === 12 && digitsOnly.startsWith("91") ? digitsOnly.slice(2) : digitsOnly;

        // 3. Extract Lead Name
        let leadName = "";
        for (const [k, v] of Object.entries(row)) {
          if (!k || k.startsWith("_") || !v) continue;
          const kl = k.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (
            kl === "id" ||
            kl === "disposition" ||
            kl.includes("remark") ||
            kl.includes("note") ||
            kl.includes("feedback") ||
            kl.includes("phone") ||
            kl.includes("mobile")
          ) {
            continue;
          }
          if (
            kl.includes("name") ||
            kl.includes("candidate") ||
            kl.includes("customer") ||
            kl.includes("client") ||
            kl.includes("lead")
          ) {
            leadName = String(v).trim();
            break;
          }
        }
        if (!leadName) {
          leadName = row.Name || row.name || row.CANDIDATE_NAME || `Lead #${row._rowId ? String(row._rowId).slice(-4) : rowIdx + 1}`;
        }

        const sentiment = classifyRemark(String(textToAnalyze || ""));
        if (sentiment === "positive") {
          positive++;
          teamMap[teamName].positive++;
        } else if (sentiment === "negative") {
          negative++;
          teamMap[teamName].negative++;
        } else if (sentiment === "neutral") {
          neutral++;
          teamMap[teamName].neutral++;
        }

        const hasNote = Boolean(remarkText && remarkText.trim() !== "");
        const isHot = isHotDisposition(disposition, remarkText);
        const isFollowup = !isHot && isFollowupDisposition(disposition, remarkText);

        if (isHot) hotCount++;
        if (isFollowup) followupCount++;
        if (hasNote) notesCount++;

        // Caller Stats
        const callerName = page.assignedTo || "Unassigned";
        if (callerName && callerName !== "Unassigned") {
          if (!callerMap[callerName]) {
            callerMap[callerName] = {
              name: callerName,
              team: teamName,
              hot: 0,
              followup: 0,
              withNotes: 0,
              totalWorked: 0,
            };
          }
          if (remarkText || disposition) {
            callerMap[callerName].totalWorked++;
            if (isHot) callerMap[callerName].hot++;
            if (isFollowup) callerMap[callerName].followup++;
            if (hasNote) callerMap[callerName].withNotes++;
          }
        }

        if (remarkText || disposition) {
          allRemarks.push({
            id: `${page._id}-${row._rowId || rowIdx}`,
            team: teamName,
            sheet: page.title || "Untitled Sheet",
            sheetId: page._id,
            assignedTo: callerName,
            text: String(remarkText),
            sentiment,
            lead: String(leadName),
            phone: rawPhone,
            cleanPhone,
            disposition: String(disposition),
            isHot,
            isFollowup,
            hasNote,
          });
        }
      });
    });

    const callerStats = Object.values(callerMap).sort((a, b) => {
      const scoreA = a.hot * 5 + a.followup * 2 + a.totalWorked;
      const scoreB = b.hot * 5 + b.followup * 2 + b.totalWorked;
      return scoreB - scoreA;
    });

    return {
      teams: Array.from(teams).sort(),
      totalLeads,
      positive,
      negative,
      neutral,
      empty,
      hotCount,
      followupCount,
      notesCount,
      callerStats,
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
    if (!Array.isArray(pages)) return [];
    return pages.filter(p => {
      if (!p) return false;
      if (selectedTeam !== "All" && (p.teamName || "Unassigned") !== selectedTeam) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (p.title && p.title.toLowerCase().includes(s)) ||
          (p.teamName && p.teamName.toLowerCase().includes(s)) ||
          (p.assignedTo && p.assignedTo.toLowerCase().includes(s))
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

  // ── Filtered & Paginated Action Hub Leads ───────────────────────────────────
  const filteredActionLeads = useMemo(() => {
    return analytics.allRemarks.filter(r => {
      // 1. Caller Filter
      if (callerFilter !== "All" && r.assignedTo !== callerFilter) return false;

      // 2. Action Category Filter
      if (actionFilter === "all_actionable" && !r.isHot && !r.isFollowup) return false;
      if (actionFilter === "hot" && !r.isHot) return false;
      if (actionFilter === "followup" && !r.isFollowup) return false;
      if (actionFilter === "notes" && !r.hasNote) return false;

      // 3. Search Query Filter
      if (remarksSearch.trim()) {
        const q = remarksSearch.toLowerCase().trim();
        const inLead = r.lead.toLowerCase().includes(q);
        const inPhone = r.phone.toLowerCase().includes(q) || r.cleanPhone.includes(q);
        const inText = r.text.toLowerCase().includes(q);
        const inDisp = (r.disposition || "").toLowerCase().includes(q);
        const inSheet = r.sheet.toLowerCase().includes(q);
        const inTeam = r.team.toLowerCase().includes(q);
        const inAssigned = r.assignedTo.toLowerCase().includes(q);
        if (!inLead && !inPhone && !inText && !inDisp && !inSheet && !inTeam && !inAssigned) return false;
      }
      return true;
    });
  }, [analytics.allRemarks, actionFilter, callerFilter, remarksSearch]);

  const totalActionLeads = filteredActionLeads.length;
  const totalActionPages = Math.max(1, Math.ceil(totalActionLeads / remarksPerPage));
  const currentActionPage = Math.min(remarksPage, totalActionPages);
  const pagedActionLeads = useMemo(() => {
    const start = (currentActionPage - 1) * remarksPerPage;
    return filteredActionLeads.slice(start, start + remarksPerPage);
  }, [filteredActionLeads, currentActionPage, remarksPerPage]);

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
              {pages.length} active sheets · {analytics.totalLeads.toLocaleString()} total leads · {analytics.allRemarks.length.toLocaleString()} remarks worked
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
              {tab === "remarks" && (
                <>
                  <Flame size={13} className="inline mr-1.5 mb-0.5 text-amber-500" />
                  Action Hub
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold border border-amber-200">
                    {analytics.hotCount + analytics.followupCount} Hot
                  </span>
                </>
              )}
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
                  const total = Number(page.totalRows) || (Array.isArray(page.rows) ? page.rows.length : 0);
                  const filled = Number(page.remarksFilled) || 0;
                  const empty = Number(page.remarksEmpty) || Math.max(0, total - filled);
                  const pct = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;
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
                              <span>{total} leads</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                          {/* Progress Bar */}
                          <div className="hidden md:block w-36">
                            <div className="text-xs text-slate-500 font-bold mb-1.5 flex justify-between">
                              <span>Progress</span><span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pct >= 75 ? "bg-emerald-500" : pct >= 35 ? "bg-indigo-500" : pct > 0 ? "bg-amber-500" : "bg-slate-300"
                                }`}
                                style={{ width: `${Math.max(0, pct)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {filled} filled
                            </span>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              {empty} empty
                            </span>
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

        {/* ══════════════════ ACTION HUB TAB (REVAMPED REMARKS FEED) ══════════════════ */}
        {activeTab === "remarks" && (
          <div className="space-y-4">
            {/* Top Action Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4 rounded-2xl border border-emerald-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <Flame size={13} className="text-emerald-600" /> Hot Leads
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics.hotCount}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">Interested & Login</p>
                </div>
                <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-xs">
                  <Flame size={20} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={13} className="text-amber-600" /> Follow-Up Queue
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics.followupCount}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">Callbacks scheduled</p>
                </div>
                <div className="bg-amber-500 text-white p-2.5 rounded-xl shadow-xs">
                  <Clock size={20} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white p-4 rounded-2xl border border-blue-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare size={13} className="text-blue-600" /> Notes Written
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics.notesCount}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">Remarks notes logged</p>
                </div>
                <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-xs">
                  <MessageSquare size={20} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white p-4 rounded-2xl border border-indigo-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck size={13} className="text-indigo-600" /> Active Callers
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{analytics.callerStats.length}</p>
                  <p className="text-[10.5px] text-slate-400 font-medium">Telecallers working</p>
                </div>
                <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-xs">
                  <UserCheck size={20} />
                </div>
              </div>
            </div>

            {/* Telecaller Activity Filter Strip */}
            {analytics.callerStats.length > 0 && (
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider whitespace-nowrap pl-1">
                  Telecaller:
                </span>
                <button
                  onClick={() => { setCallerFilter("All"); setRemarksPage(1); }}
                  className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap ${
                    callerFilter === "All"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All ({analytics.allRemarks.length})
                </button>
                {analytics.callerStats.map(caller => (
                  <button
                    key={caller.name}
                    onClick={() => {
                      setCallerFilter(callerFilter === caller.name ? "All" : caller.name);
                      setRemarksPage(1);
                    }}
                    className={`px-3 py-1 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                      callerFilter === caller.name
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{caller.name}</span>
                    {caller.hot > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${callerFilter === caller.name ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"}`}>
                        🔥 {caller.hot}
                      </span>
                    )}
                    {caller.followup > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${callerFilter === caller.name ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800"}`}>
                        ⏰ {caller.followup}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Action Hub Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header & Filter Controls */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" />
                    Action Hub — {totalActionLeads} lead{totalActionLeads === 1 ? "" : "s"} ready for action
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filter hot prospects, follow-up calls, and reach out via Call or WhatsApp instantly.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative flex-grow max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, phone, notes, caller, sheet..."
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

                {/* Category Action Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <button
                    onClick={() => { setActionFilter("all_actionable"); setRemarksPage(1); }}
                    className={`px-3 py-1 rounded-full border transition flex items-center gap-1 ${
                      actionFilter === "all_actionable" ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles size={12} /> Hot & Follow-up ({analytics.hotCount + analytics.followupCount})
                  </button>
                  <button
                    onClick={() => { setActionFilter("hot"); setRemarksPage(1); }}
                    className={`px-3 py-1 rounded-full border transition flex items-center gap-1 ${
                      actionFilter === "hot" ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    <Flame size={12} /> Hot ({analytics.hotCount})
                  </button>
                  <button
                    onClick={() => { setActionFilter("followup"); setRemarksPage(1); }}
                    className={`px-3 py-1 rounded-full border transition flex items-center gap-1 ${
                      actionFilter === "followup" ? "bg-amber-600 text-white border-amber-600 shadow-2xs" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <Clock size={12} /> Follow-ups ({analytics.followupCount})
                  </button>
                  <button
                    onClick={() => { setActionFilter("notes"); setRemarksPage(1); }}
                    className={`px-3 py-1 rounded-full border transition flex items-center gap-1 ${
                      actionFilter === "notes" ? "bg-blue-600 text-white border-blue-600 shadow-2xs" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    <MessageSquare size={12} /> Notes ({analytics.notesCount})
                  </button>
                  <button
                    onClick={() => { setActionFilter("all"); setRemarksPage(1); }}
                    className={`px-3 py-1 rounded-full border transition ${
                      actionFilter === "all" ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All Feed ({analytics.allRemarks.length})
                  </button>
                </div>
              </div>

              {/* Lead Cards List */}
              <div className="divide-y divide-slate-100 min-h-[220px]">
                {pagedActionLeads.length === 0 ? (
                  <EmptyState message="No actionable leads found matching your criteria" />
                ) : (
                  pagedActionLeads.map((r) => {
                    const initials = r.lead
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(w => w[0].toUpperCase())
                      .join("") || "L";

                    const isHot = r.isHot;
                    const isFollow = r.isFollowup;

                    return (
                      <div
                        key={r.id}
                        className={`px-6 py-4 hover:bg-slate-50/80 transition-colors ${
                          isHot
                            ? "border-l-4 border-emerald-500 bg-emerald-50/15"
                            : isFollow
                            ? "border-l-4 border-amber-500 bg-amber-50/15"
                            : "border-l-4 border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Lead Details */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-grow">
                            {/* Initials Avatar */}
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs ${
                                isHot
                                  ? "bg-emerald-600 text-white"
                                  : isFollow
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-200 text-slate-700"
                              }`}
                            >
                              {initials}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-grow">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">{r.lead}</span>

                                {/* Disposition Pill */}
                                {r.disposition && (
                                  <span
                                    className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                      isHot
                                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                        : isFollow
                                        ? "bg-amber-100 text-amber-800 border-amber-300"
                                        : "bg-slate-100 text-slate-700 border-slate-200"
                                    }`}
                                  >
                                    {isHot ? "🔥 " : isFollow ? "⏰ " : ""}
                                    {r.disposition}
                                  </span>
                                )}

                                <SentimentBadge s={r.sentiment} />
                              </div>

                              {/* Sheet & Caller Tags */}
                              <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-400 font-semibold flex-wrap">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200/80">
                                  {r.team}
                                </span>
                                <span>Sheet: <strong className="text-slate-700">{r.sheet}</strong></span>
                                <span>·</span>
                                <span>Caller: <strong className="text-slate-700">{r.assignedTo}</strong></span>
                              </div>

                              {/* Remark Notes Speech Box */}
                              {r.text ? (
                                <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs inline-block max-w-xl">
                                  <span className="text-slate-400 font-bold mr-1">💬 Remark Note:</span>
                                  &quot;{r.text}&quot;
                                </div>
                              ) : (
                                <div className="mt-1 text-[11px] text-slate-400 italic">
                                  No written remark notes
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Quick Action Buttons (Call / WhatsApp / Copy) */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                            {r.cleanPhone ? (
                              <>
                                {/* Display Phone & Copy */}
                                <div className="text-right mr-1">
                                  <div className="text-xs font-mono font-bold text-slate-800">
                                    {formatPhoneDisplay(r.cleanPhone, r.phone)}
                                  </div>
                                  <div className="text-[10px] text-slate-400">Direct Contact</div>
                                </div>

                                {/* Call Action */}
                                <a
                                  href={`tel:${r.cleanPhone}`}
                                  title={`Call ${r.lead}`}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 text-xs font-bold transition-all shadow-2xs"
                                >
                                  <Phone size={13} />
                                  <span>Call</span>
                                </a>

                                {/* WhatsApp Action */}
                                <a
                                  href={`https://wa.me/91${r.cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`WhatsApp ${r.lead}`}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold transition-all shadow-2xs"
                                >
                                  <MessageCircle size={13} />
                                  <span>WhatsApp</span>
                                </a>

                                {/* Copy Button */}
                                <button
                                  onClick={() => handleCopy(r.cleanPhone)}
                                  title="Copy phone number"
                                  className="p-1.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-200 border border-slate-200 transition-colors"
                                >
                                  {copiedPhone === r.cleanPhone ? (
                                    <Check size={14} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                                No phone in sheet
                              </span>
                            )}
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
                    Showing <strong>{totalActionLeads > 0 ? (currentActionPage - 1) * remarksPerPage + 1 : 0}</strong> to{" "}
                    <strong>{Math.min(currentActionPage * remarksPerPage, totalActionLeads)}</strong> of{" "}
                    <strong>{totalActionLeads}</strong> leads
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
                      <option value={20}>20</option>
                      <option value={35}>35</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentActionPage <= 1}
                    onClick={() => setRemarksPage(1)}
                    title="First Page"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    disabled={currentActionPage <= 1}
                    onClick={() => setRemarksPage(p => Math.max(1, p - 1))}
                    title="Previous Page"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition flex items-center gap-1"
                  >
                    <ChevronLeft size={13} /> Prev
                  </button>

                  {Array.from({ length: totalActionPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalActionPages || Math.abs(p - currentActionPage) <= 2)
                    .map((p, idx, arr) => {
                      const prevP = arr[idx - 1];
                      const showEllipsis = prevP && p - prevP > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                          <button
                            onClick={() => setRemarksPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                              p === currentActionPage
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
                    disabled={currentActionPage >= totalActionPages}
                    onClick={() => setRemarksPage(p => Math.min(totalActionPages, p + 1))}
                    title="Next Page"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition flex items-center gap-1"
                  >
                    Next <ChevronRight size={13} />
                  </button>
                  <button
                    disabled={currentActionPage >= totalActionPages}
                    onClick={() => setRemarksPage(totalActionPages)}
                    title="Last Page"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-600 disabled:opacity-30 hover:bg-slate-100 transition"
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
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
  const rows = Array.isArray(page?.rows) ? page.rows : [];
  const remarkCols = Array.isArray(page?.remarkColumnNames) ? page.remarkColumnNames : [];
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const currentPage = Math.min(rowPage, totalPages);
  const pagedRows = rows.slice(
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
              {Object.keys(rows[0] || {})
                .filter((k) => k !== "_rowId" && k !== "feedback_notes")
                .map((col) => {
                  const isRemark = col === "Remarks" || col.toLowerCase().includes("remark") || (remarkCols.includes(col) && col.toLowerCase() !== "disposition");
                  const isDisp = col.toLowerCase() === "disposition";
                  return (
                    <th
                      key={col}
                      className={`px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap ${
                        isRemark
                          ? "text-indigo-600"
                          : isDisp
                          ? "text-purple-600"
                          : "text-slate-500"
                      }`}
                    >
                      {isRemark ? "💬 " : isDisp ? "📌 " : ""}
                      {col === "disposition" ? "Disposition" : col}
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.map((row, idx) => {
              const globalIndex = (currentPage - 1) * rowsPerPage + idx + 1;
              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-slate-400 text-center">{globalIndex}</td>
                  {Object.entries(row || {})
                    .filter(([k]) => k !== "_rowId" && k !== "feedback_notes")
                    .map(([k, v]) => {
                      const isRemark = k === "Remarks" || k.toLowerCase().includes("remark") || (remarkCols.includes(k) && k.toLowerCase() !== "disposition");
                      const isDisp = k.toLowerCase() === "disposition";
                      const valStr = v !== undefined && v !== null && String(v).trim() !== "" ? String(v).trim() : "—";
                      return (
                        <td key={k} className="px-4 py-3 whitespace-nowrap">
                          {isRemark ? (
                            <div className="flex items-center gap-2">
                              {valStr !== "—" ? <SentimentBadge s={classifyRemark(valStr)} /> : null}
                              <span className="text-slate-700 font-medium text-xs max-w-[280px] truncate" title={valStr}>
                                {valStr}
                              </span>
                            </div>
                          ) : isDisp ? (
                            valStr !== "—" ? (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {valStr}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">—</span>
                            )
                          ) : (
                            <span className="text-slate-600 text-xs">{valStr}</span>
                          )}
                        </td>
                      );
                    })}
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
