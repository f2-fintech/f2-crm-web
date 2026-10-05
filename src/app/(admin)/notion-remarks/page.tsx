"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  LayoutDashboard, Users, FileSpreadsheet, MessageSquare,
  TrendingUp, CheckCircle2, XCircle, Clock, Search,
  ChevronDown, ChevronRight, BarChart2, RefreshCw
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
  remarkColumnNames: string[];
  totalRows: number;
  remarksFilled: number;
  remarksEmpty: number;
  rows: Record<string, any>[];
}

// ─── Remark Classifier ────────────────────────────────────────────────────────
function classifyRemark(text: string): "positive" | "negative" | "neutral" | "empty" {
  if (!text || text.trim() === "" || text.trim() === "-") return "empty";
  const t = text.toLowerCase();
  const neg = ['not interested', 'wrong number', 'fake', 'no response', 'not picking', 'switch off', 'switched off', 'busy', 'hang up', 'abusive', 'block', 'reject', 'invalid'];
  const pos = ['interested', 'callback', 'call back', 'done', 'agreed', 'positive', 'meeting', 'met', 'follow up', 'ok', 'yes', 'good', 'connected', 'visit', 'willing'];
  if (neg.some(w => t.includes(w))) return "negative";
  if (pos.some(w => t.includes(w))) return "positive";
  return "neutral";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotionAdminDashboard() {
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "sheets" | "remarks">("overview");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notion-pages/admin/remarks");
      setPages(res.data);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived Analytics ──────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const teams = new Set<string>();
    let totalLeads = 0, positive = 0, negative = 0, neutral = 0, empty = 0;
    const teamMap: Record<string, { positive: number; negative: number; neutral: number; empty: number; total: number }> = {};
    const allRemarks: { team: string; sheet: string; assignedTo: string; text: string; sentiment: string; lead: string; disposition: string }[] = [];

    pages.forEach(page => {
      teams.add(page.teamName);
      if (!teamMap[page.teamName]) teamMap[page.teamName] = { positive: 0, negative: 0, neutral: 0, empty: 0, total: 0 };
      
      totalLeads += page.totalRows || 0;
      teamMap[page.teamName].total += page.totalRows || 0;
      
      empty += page.remarksEmpty || 0;
      teamMap[page.teamName].empty += page.remarksEmpty || 0;

      page.rows.forEach(row => {
        
        // Get the remark value
        let remarkText = page.remarkColumnNames
          .map(k => String(row[k] || ""))
          .find(v => v.trim() !== "") || "";
          
        const disposition = row.disposition || row.Disposition || "";
        
        // If they only have disposition, use it for sentiment calculation
        const textToAnalyze = remarkText || disposition;

        // Get the lead name
        const leadName = Object.entries(row)
          .filter(([k]) => !k.startsWith('_'))
          .find(([k]) => k.toLowerCase().includes('name'))?.[1] 
          || `Lead #${row._rowId?.slice(-4) || '?'}`;

        const sentiment = classifyRemark(textToAnalyze);
        if (sentiment === "positive") { positive++; teamMap[page.teamName].positive++; }
        else if (sentiment === "negative") { negative++; teamMap[page.teamName].negative++; }
        else if (sentiment === "neutral") { neutral++; teamMap[page.teamName].neutral++; }

        if (remarkText || disposition) {
          allRemarks.push({ team: page.teamName, sheet: page.title, assignedTo: page.assignedTo, text: remarkText, sentiment, lead: String(leadName), disposition });
        }
      });
    });

    return { teams: Array.from(teams).sort(), totalLeads, positive, negative, neutral, empty, teamMap, allRemarks };
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
    dataLabels: { style: { fontFamily: 'inherit' } }
  };

  const teamNames = Object.keys(analytics.teamMap);
  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', stacked: true, fontFamily: 'inherit', toolbar: { show: false } },
    colors: ['#22c55e', '#ef4444', '#f59e0b', '#e2e8f0'],
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: '60%' } },
    xaxis: { categories: teamNames, labels: { style: { fontFamily: 'inherit', fontSize: '12px' } } },
    legend: { position: 'top', fontFamily: 'inherit' },
    fill: { opacity: 1 },
    tooltip: { shared: true, intersect: false }
  };
  const barSeries = [
    { name: 'Positive', data: teamNames.map(t => analytics.teamMap[t]?.positive || 0) },
    { name: 'Negative', data: teamNames.map(t => analytics.teamMap[t]?.negative || 0) },
    { name: 'Neutral', data: teamNames.map(t => analytics.teamMap[t]?.neutral || 0) },
    { name: 'No Remark', data: teamNames.map(t => analytics.teamMap[t]?.empty || 0) },
  ];

  // ── Filtered pages ─────────────────────────────────────────────────────────
  const filteredPages = pages.filter(p => {
    if (selectedTeam !== "All" && p.teamName !== selectedTeam) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.title.toLowerCase().includes(s) || p.teamName.toLowerCase().includes(s) || p.assignedTo.toLowerCase().includes(s);
    }
    return true;
  });

  // ── Sentiment badge ────────────────────────────────────────────────────────
  const SentimentBadge = ({ s }: { s: string }) => {
    const map: Record<string, string> = {
      positive: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      negative: "bg-red-100 text-red-700 border border-red-200",
      neutral: "bg-amber-100 text-amber-700 border border-amber-200",
      empty: "bg-slate-100 text-slate-500 border border-slate-200"
    };
    const label: Record<string, string> = { positive: "✓ Positive", negative: "✗ Negative", neutral: "~ Neutral", empty: "○ No Remark" };
    return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[s]}`}>{label[s]}</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-semibold">Loading Notion Master Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-10 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Notion Master Dashboard</h1>
            <p className="text-xs text-slate-400 font-medium">{pages.length} active sheets · {analytics.totalLeads.toLocaleString()} total leads</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-200">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="px-6 lg:px-10 py-6 space-y-6">
        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPI icon={<FileSpreadsheet size={20} className="text-indigo-500" />} label="Total Sheets" value={pages.length} bg="bg-indigo-50" />
          <KPI icon={<Users size={20} className="text-blue-500" />} label="Total Leads" value={analytics.totalLeads} bg="bg-blue-50" />
          <KPI icon={<CheckCircle2 size={20} className="text-emerald-500" />} label="Positive Remarks" value={analytics.positive} sub={`${analytics.totalLeads ? Math.round((analytics.positive / analytics.totalLeads) * 100) : 0}% rate`} bg="bg-emerald-50" />
          <KPI icon={<XCircle size={20} className="text-red-500" />} label="Negative Remarks" value={analytics.negative} sub={`${analytics.totalLeads ? Math.round((analytics.negative / analytics.totalLeads) * 100) : 0}% rate`} bg="bg-red-50" />
          <KPI icon={<Clock size={20} className="text-slate-400" />} label="Pending Remarks" value={analytics.empty} bg="bg-slate-100" />
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["overview", "sheets", "remarks"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {tab === "overview" && <><BarChart2 size={14} className="inline mr-1.5 mb-0.5" />Overview</>}
              {tab === "sheets" && <><FileSpreadsheet size={14} className="inline mr-1.5 mb-0.5" />Sheets</>}
              {tab === "remarks" && <><MessageSquare size={14} className="inline mr-1.5 mb-0.5" />Remarks Feed</>}
            </button>
          ))}
        </div>

        {/* ══════════════════ OVERVIEW TAB ══════════════════ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-500" /> Overall Remark Sentiment</h3>
              {analytics.totalLeads > 0 ? (
                <Chart options={donutOptions} series={donutSeries} type="donut" width="100%" height={300} />
              ) : <EmptyState />}
            </div>
            <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Movement by Team</h3>
              {teamNames.length > 0 ? (
                <Chart options={barOptions} series={barSeries} type="bar" width="100%" height={300} />
              ) : <EmptyState />}
            </div>
          </div>
        )}

        {/* ══════════════════ SHEETS TAB ══════════════════ */}
        {activeTab === "sheets" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search sheets, teams, assignees..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <FilterPill label="All" active={selectedTeam === "All"} onClick={() => setSelectedTeam("All")} />
                {analytics.teams.map(t => <FilterPill key={t} label={t} active={selectedTeam === t} onClick={() => setSelectedTeam(t)} />)}
              </div>
            </div>

            {/* Sheet Cards */}
            <div className="space-y-3">
              {filteredPages.map(page => {
                const isOpen = expandedPage === page._id;
                const pct = page.totalRows > 0 ? Math.round((page.remarksFilled / page.totalRows) * 100) : 0;
                return (
                  <div key={page._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Sheet Header Row */}
                    <button onClick={() => setExpandedPage(isOpen ? null : page._id)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-4 flex-grow min-w-0">
                        <div className="bg-indigo-50 p-2 rounded-xl flex-shrink-0">
                          <FileSpreadsheet size={18} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-base truncate">{page.title}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-semibold">
                            <span className="flex items-center gap-1"><Users size={11} /> {page.teamName}</span>
                            <span>·</span>
                            <span>Assigned: <span className="text-slate-600">{page.assignedTo}</span></span>
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

                    {/* Expanded: Row Table */}
                    {isOpen && (
                      <div className="border-t border-slate-100">
                        <div className="overflow-x-auto max-h-[450px]">
                          <table className="w-full text-sm text-left">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                              <tr>
                                {Object.keys(page.rows[0] || {})
                                  .filter(k => k !== '_rowId')
                                  .map(col => (
                                    <th key={col} className={`px-4 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap ${page.remarkColumnNames.includes(col) ? 'text-indigo-600' : 'text-slate-500'}`}>
                                      {page.remarkColumnNames.includes(col) ? '💬 ' : ''}{col}
                                    </th>
                                  ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {page.rows.map((row, idx) => {
                                const remarkText = page.remarkColumnNames.map(k => row[k] || "").find(v => String(v).trim() !== "") || "";
                                const sentiment = classifyRemark(String(remarkText));
                                return (
                                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                    {Object.entries(row)
                                      .filter(([k]) => k !== '_rowId')
                                      .map(([k, v]) => (
                                        <td key={k} className="px-4 py-3 whitespace-nowrap">
                                          {page.remarkColumnNames.includes(k) ? (
                                            <div className="flex items-center gap-2">
                                              <SentimentBadge s={sentiment} />
                                              <span className="text-slate-700 font-medium text-sm max-w-[250px] truncate">{String(v) || "—"}</span>
                                            </div>
                                          ) : (
                                            <span className="text-slate-600">{String(v) || "—"}</span>
                                          )}
                                        </td>
                                      ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );

                function SentimentBadge({ s }: { s: string }) {
                  const map: Record<string, string> = {
                    positive: "bg-emerald-100 text-emerald-700",
                    negative: "bg-red-100 text-red-700",
                    neutral: "bg-amber-100 text-amber-700",
                    empty: "bg-slate-100 text-slate-400"
                  };
                  const icon: Record<string, React.ReactNode> = {
                    positive: <CheckCircle2 size={11} />,
                    negative: <XCircle size={11} />,
                    neutral: <Clock size={11} />,
                    empty: <Clock size={11} />
                  };
                  return <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${map[s]}`}>{icon[s]} {s.toUpperCase()}</span>;
                }
              })}
            </div>
          </div>
        )}

        {/* ══════════════════ REMARKS FEED TAB ══════════════════ */}
        {activeTab === "remarks" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={18} className="text-indigo-500" /> All Remarks — {analytics.allRemarks.length} entries</h3>
              <div className="flex gap-2 text-xs font-bold">
                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{analytics.positive} Positive</span>
                <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{analytics.negative} Negative</span>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[600px] divide-y divide-slate-100">
              {analytics.allRemarks.length === 0 ? <EmptyState /> :
                analytics.allRemarks.map((r, i) => {
                  const sentimentColor: Record<string, string> = {
                    positive: "border-l-4 border-emerald-400 bg-emerald-50/30",
                    negative: "border-l-4 border-red-400 bg-red-50/30",
                    neutral: "border-l-4 border-amber-400 bg-amber-50/20",
                    empty: "border-l-4 border-slate-200"
                  };
                  return (
                    <div key={i} className={`px-6 py-4 hover:bg-slate-50/50 transition-colors ${sentimentColor[r.sentiment]}`}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow">
                          <div className="font-semibold text-slate-800 text-sm mb-1">{r.lead}</div>
                          <div className="flex items-center gap-2 mb-2">
                            {r.disposition && (
                              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-200">
                                {r.disposition}
                              </span>
                            )}
                            {r.text && (
                              <div className="text-slate-600 text-sm bg-white px-3 py-1.5 rounded-xl border border-slate-100 font-medium">
                                "{r.text}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-semibold">
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">{r.team}</span>
                            <span>Sheet: {r.sheet}</span>
                            <span>· {r.assignedTo}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {r.sentiment === "positive" && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={12} /> Positive</span>}
                          {r.sentiment === "negative" && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><XCircle size={12} /> Negative</span>}
                          {r.sentiment === "neutral" && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1"><Clock size={12} /> Neutral</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}
      </div>
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
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${active ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"}`}>
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="py-16 flex flex-col items-center text-center text-slate-400">
      <BarChart2 size={40} className="mb-3 opacity-30" />
      <p className="font-semibold">No data to display</p>
      <p className="text-xs mt-1">No sheets with rows found for current filters</p>
    </div>
  );
}
