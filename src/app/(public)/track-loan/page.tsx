"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Building2,
  Calendar,
  IndianRupee,
  Phone,
  MessageCircle,
  Share2,
  Copy,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface Milestone {
  title: string;
  desc: string;
  status: "completed" | "current" | "upcoming" | "failed";
  date?: string;
}

function TrackLoanContent() {
  const searchParams = useSearchParams();
  const initialTicket = searchParams.get("ticket") || searchParams.get("id") || "";
  const initialPhone = searchParams.get("phone") || "";

  const [searchQuery, setSearchQuery] = useState(initialTicket || initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loanData, setLoanData] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const fetchLoanDetails = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    const isNumericOnly = /^\d+$/.test(query.trim());
    const isPhone = isNumericOnly && query.trim().length === 10;
    const isTicket = isNumericOnly && query.trim().length <= 7;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const OMS_BASE = process.env.NEXT_PUBLIC_OMS_BASE_URL || "https://admin.f2fintech.in";

    try {
      let ticketIdToFetch = query.trim();
      let cachedLead: any = null;

      // 1. If searching by Phone number or non-ticket string, search DB leads
      if (isPhone || !isTicket) {
        try {
          const leadRes = await fetch(`${API_BASE}/leads?search=${encodeURIComponent(query.trim())}`);
          if (leadRes.ok) {
            const leadJson = await leadRes.json();
            const found = leadJson.data?.[0];
            if (found) {
              cachedLead = found;
              if (found.omsTicketId) {
                ticketIdToFetch = String(found.omsTicketId);
              }
            }
          }
        } catch (e) {
          console.warn("Backend phone search failed:", e);
        }
      }

      // 2. Fetch live OMS detail (Try backend proxy first, fallback to direct OMS API)
      let detailData: any = null;
      let historyData: any[] = [];

      try {
        const backendRes = await fetch(`${API_BASE}/leads/oms/detail/${ticketIdToFetch}`);
        if (backendRes.ok) {
          const bJson = await backendRes.json();
          if (bJson?.data) detailData = bJson.data;
        }
      } catch (e) {
        // Backend proxy down, fallback to direct OMS API
      }

      if (!detailData) {
        try {
          const directRes = await fetch(`${OMS_BASE}/api/v1/get-ticket-with-detail/${ticketIdToFetch}`);
          if (directRes.ok) {
            const dJson = await directRes.json();
            if (dJson?.data) detailData = dJson.data;
          }
        } catch (e) {
          console.warn("Direct OMS fetch failed:", e);
        }
      }

      // 3. Fetch OMS History Timeline (Try backend proxy first, fallback to direct OMS API)
      try {
        const hBackendRes = await fetch(`${API_BASE}/leads/oms/history/${ticketIdToFetch}`);
        if (hBackendRes.ok) {
          const hJson = await hBackendRes.json();
          if (Array.isArray(hJson?.data)) historyData = hJson.data;
        }
      } catch (e) {
        // Fallback to direct OMS API
      }

      if (!historyData || historyData.length === 0) {
        try {
          const hRes = await fetch(`${OMS_BASE}/api/v1/get-ticket-histories/${ticketIdToFetch}`);
          if (hRes.ok) {
            const hJson = await hRes.json();
            if (Array.isArray(hJson?.data)) historyData = hJson.data;
          }
        } catch (e) {
          console.warn("History fetch failed:", e);
        }
      }

      if (detailData) {
        const d = detailData;
        setLoanData({
          ticketId: d.ticketId || ticketIdToFetch,
          customerName: d.customerName || d.name || cachedLead?.fullName || "Customer",
          customerContact: d.customerContact || d.contactNo || d.phone || cachedLead?.phone || "",
          customerEmail: d.customerEmail || d.email || cachedLead?.email || "",
          applicationAmount: d.applicationAmount || d.amount || cachedLead?.loanAmount || 0,
          approvedAmount: d.approved_amount || d.approvedAmount || cachedLead?.omsApprovedAmount || null,
          disbursedAmount: d.disbursed_amount || d.disbursedAmount || cachedLead?.omsDisbursedAmount || null,
          provider: d.provider || d.bankName || cachedLead?.omsProvider || "Partner Bank",
          ticketStatus: (d.employeeStatus || d.status || d.ticketStatus || d.loanStatus || cachedLead?.omsTicketStatus || "IN_PROCESS").toUpperCase(),
          loanType: d.loanType || d.leadType || cachedLead?.loanType || "Loan",
          tenure: d.applicationTenure || d.tenure || cachedLead?.omsTenure,
          appliedByName: d.appliedByName || d.agentName || cachedLead?.omsAppliedByName || null,
          createdAt: d.applicationDate || d.createdAt || d.created_at || d.date || cachedLead?.createdAt
        });
        setTimeline(historyData);
        setLoading(false);
        return;
      }

      // 4. Fallback to cachedLead if OMS didn't return detail
      if (cachedLead) {
        setLoanData({
          ticketId: cachedLead.omsTicketId || cachedLead.leadId || ticketIdToFetch,
          customerName: cachedLead.fullName,
          customerContact: cachedLead.phone,
          customerEmail: cachedLead.email,
          applicationAmount: cachedLead.loanAmount,
          approvedAmount: cachedLead.omsApprovedAmount || null,
          disbursedAmount: cachedLead.omsDisbursedAmount || null,
          provider: cachedLead.omsProvider || cachedLead.leadSource || "Partner Bank",
          ticketStatus: (cachedLead.omsTicketStatus || cachedLead.status || "IN_PROCESS").toUpperCase(),
          loanType: cachedLead.loanType || cachedLead.omsLeadType || "Loan",
          tenure: cachedLead.omsTenure,
          appliedByName: cachedLead.omsAppliedByName || cachedLead.appliedByName,
          createdAt: cachedLead.createdAt
        });
        setTimeline(historyData.length > 0 ? historyData : (cachedLead.latestTimelineItem ? [cachedLead.latestTimelineItem] : []));
        setLoading(false);
        return;
      }

      throw new Error(`Application #${ticketIdToFetch} could not be found. Please check your ticket ID or mobile number.`);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve application status. Please verify your details.");
      setLoanData(null);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket || initialPhone) {
      fetchLoanDetails(initialTicket || initialPhone);
    }
  }, [initialTicket, initialPhone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchLoanDetails(searchQuery.trim());
    }
  };

  const handleCopyLink = () => {
    if (!loanData) return;
    const url = `${window.location.origin}/track-loan?ticket=${loanData.ticketId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!loanData) return;
    const url = `${window.location.origin}/track-loan?ticket=${loanData.ticketId}`;
    const msg = `Namaste ${loanData.customerName}! Aapki F2 Fintech Loan Application (Ticket #${loanData.ticketId}) ka live status yahan track karein: ${url}\nCurrent Status: ${loanData.ticketStatus}`;
    const phone = loanData.customerContact ? loanData.customerContact.replace(/\D/g, "") : "";
    window.open(`https://wa.me/${phone.length === 10 ? "91" + phone : phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Determine stage progression
  const getMilestones = (statusStr: string): Milestone[] => {
    const s = (statusStr || "").toUpperCase();
    const isDisbursed = s.includes("DISBURSE");
    const isApproved = s.includes("APPROV") || isDisbursed;
    const isRejected = s.includes("REJECT");
    const isFileSend = s.includes("FILE SEND") || s.includes("PROCESS") || isApproved;

    return [
      {
        title: "Application Received",
        desc: "File successfully logged in the system",
        status: "completed",
        date: loanData?.createdAt ? new Date(loanData.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : undefined
      },
      {
        title: "Document Verification",
        desc: "KYC & income criteria verified by credit team",
        status: isRejected ? "failed" : "completed"
      },
      {
        title: "Bank Credit Review",
        desc: `File submitted to ${loanData?.provider || "Partner Bank"} for underwriting`,
        status: isRejected ? "failed" : (isFileSend ? "completed" : "current")
      },
      {
        title: isRejected ? "Application Rejected" : "Sanction / Approval",
        desc: isRejected
          ? "File did not meet current credit underwriting criteria"
          : (isApproved ? `Sanction Letter generated for ₹${Number(loanData?.approvedAmount || loanData?.applicationAmount || 0).toLocaleString("en-IN")}` : "Awaiting credit decision from lender"),
        status: isRejected ? "failed" : (isApproved ? "completed" : (isFileSend ? "current" : "upcoming"))
      },
      {
        title: "Disbursement",
        desc: isDisbursed
          ? `₹${Number(loanData?.disbursedAmount || loanData?.approvedAmount || loanData?.applicationAmount || 0).toLocaleString("en-IN")} credited to your bank account`
          : "Loan agreement signing & final bank transfer",
        status: isRejected ? "upcoming" : (isDisbursed ? "completed" : (isApproved ? "current" : "upcoming"))
      }
    ];
  };

  const status = loanData?.ticketStatus || "";
  const isDisbursed = status.includes("DISBURSE");
  const isApproved = status.includes("APPROV") || isDisbursed;
  const isRejected = status.includes("REJECT");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/30 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20">
              F2
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 block leading-tight">F2 Fintech</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Live Application Tracker</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://f2fintech.in"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              f2fintech.in <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section & Search Form */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles size={14} className="text-amber-500" />
            24/7 Real-Time Customer Status Journey
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Track Your Loan Application
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Apna Ticket ID ya Registered Mobile Number daal kar dekhein aapki file ka live bank status.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto mt-6">
            <div className="relative flex items-center shadow-lg shadow-indigo-500/5 rounded-2xl overflow-hidden border-2 border-indigo-200/80 focus-within:border-indigo-600 transition-all bg-white">
              <div className="pl-4 text-slate-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Ticket ID (e.g. 7580) or Mobile Number"
                className="w-full py-4 pl-3 pr-28 text-sm sm:text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Track Now
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-2 flex items-center justify-center gap-3">
              <span>Example Ticket: <strong>7580</strong></span>
              <span>•</span>
              <span>Direct Link Support: <code>?ticket=7580</code></span>
            </div>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 flex items-start gap-3.5 shadow-sm animate-shake">
            <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-red-900">Application Not Found</h4>
              <p className="text-xs font-semibold text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result Container */}
        {loanData && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Hero Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
                isDisbursed
                  ? "bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 shadow-emerald-500/20"
                  : isRejected
                  ? "bg-gradient-to-tr from-rose-600 via-red-600 to-rose-700 shadow-rose-500/20"
                  : isApproved
                  ? "bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 shadow-indigo-500/20"
                  : "bg-gradient-to-tr from-indigo-700 via-purple-700 to-indigo-800 shadow-indigo-500/20"
              }`}
            >
              {/* Background Shapes */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black tracking-wider uppercase">
                    <ShieldCheck size={14} /> Ticket #{loanData.ticketId} • {loanData.loanType || "Loan"}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {loanData.customerName}
                  </h2>
                  <div className="text-xs sm:text-sm font-medium text-white/80 flex items-center gap-3">
                    <span>{loanData.customerContact || "Verified"}</span>
                    <span>•</span>
                    <span>Provider: <strong>{loanData.provider}</strong></span>
                  </div>
                </div>

                {/* Big Status Badge */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 text-right flex flex-col justify-center min-w-[200px]">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70 block">
                    Current Live Status
                  </span>
                  <span className="text-xl sm:text-2xl font-black uppercase tracking-tight block mt-0.5">
                    {isDisbursed
                      ? "Disbursed"
                      : isRejected
                      ? "Rejected"
                      : isApproved
                      ? "Approved"
                      : status}
                  </span>
                  <span className="text-xs font-semibold text-white/90 mt-1 block">
                    {isDisbursed
                      ? `₹${Number(loanData.disbursedAmount || loanData.applicationAmount).toLocaleString("en-IN")} credited`
                      : isApproved
                      ? `₹${Number(loanData.approvedAmount || loanData.applicationAmount).toLocaleString("en-IN")} sanctioned`
                      : `Applied for ₹${Number(loanData.applicationAmount).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Share & Copy Strip */}
              <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-white/80 font-medium">
                  Direct Tracking URL for this case
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md font-bold transition-all flex items-center gap-1.5"
                  >
                    <Copy size={13} />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <MessageCircle size={13} />
                    Share on WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Step-by-Step Milestone Tracker */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">Application Progress Journey</h3>
                  <p className="text-xs text-slate-500 font-medium">Step-by-step verification and disbursement lifecycle</p>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  Live Stage
                </div>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3.5 sm:before:left-4.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {getMilestones(status).map((m, idx) => {
                  let iconBg = "bg-slate-200 text-slate-500 border-white";
                  let cardBorder = "border-slate-100 bg-slate-50/50";
                  let titleColor = "text-slate-500";

                  if (m.status === "completed") {
                    iconBg = "bg-emerald-500 text-white ring-4 ring-emerald-100 border-white";
                    cardBorder = "border-emerald-100 bg-emerald-50/30";
                    titleColor = "text-slate-900";
                  } else if (m.status === "current") {
                    iconBg = "bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse border-white";
                    cardBorder = "border-indigo-200 bg-indigo-50/40 shadow-xs";
                    titleColor = "text-indigo-900";
                  } else if (m.status === "failed") {
                    iconBg = "bg-red-500 text-white ring-4 ring-red-100 border-white";
                    cardBorder = "border-red-200 bg-red-50/40";
                    titleColor = "text-red-900";
                  }

                  return (
                    <div key={idx} className="relative flex items-start gap-4 group">
                      {/* Milestone Icon Bullet */}
                      <span
                        className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-all border-2 ${iconBg}`}
                      >
                        {m.status === "completed" ? (
                          <CheckCircle2 size={16} />
                        ) : m.status === "failed" ? (
                          <XCircle size={16} />
                        ) : m.status === "current" ? (
                          <Clock size={16} />
                        ) : (
                          idx + 1
                        )}
                      </span>

                      {/* Milestone Card Content */}
                      <div className={`flex-1 rounded-2xl p-4 sm:p-5 border transition-all ${cardBorder}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-sm sm:text-base font-extrabold ${titleColor}`}>
                            {m.title}
                          </h4>
                          {m.date && (
                            <span className="text-[11px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                              {m.date}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Details Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Application Amount</span>
                <span className="text-lg font-black text-slate-900 block mt-1">
                  ₹{Number(loanData.applicationAmount || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Requested</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sanctioned Amount</span>
                <span className="text-lg font-black text-emerald-700 block mt-1">
                  {loanData.approvedAmount ? `₹${Number(loanData.approvedAmount).toLocaleString("en-IN")}` : "Under Review"}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">By Underwriter</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lending Partner</span>
                <span className="text-base font-black text-slate-900 block mt-1 truncate">
                  {loanData.provider || "Partner Bank"}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Bank / NBFC</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tenure</span>
                <span className="text-lg font-black text-indigo-700 block mt-1">
                  {loanData.tenure ? `${loanData.tenure} Years` : "Flexible"}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">Repayment Term</span>
              </div>
            </div>

            {/* Action History Audit Trail (OMS live events) */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" />
                    Detailed Status Timeline ({timeline.length} Updates)
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">Verified Bank & OMS Log</span>
                </div>

                <div className="space-y-3">
                  {timeline.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                            #{timeline.length - idx}
                          </span>
                          {item.action || item.title || "Status Updated"}
                        </div>
                        {item.description && (
                          <div className="text-slate-600 font-medium pl-7">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 shrink-0 text-right">
                        {item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Need Help / Advisor Support Box */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-lg font-black text-indigo-950">Koi sawaal ya document upload karna hai?</h4>
                <p className="text-xs sm:text-sm text-indigo-800/80 font-medium max-w-md">
                  Aapke dedicated loan manager {loanData.appliedByName ? <strong>({loanData.appliedByName})</strong> : ""} se directly WhatsApp par baat karein.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`https://wa.me/91${(loanData.customerContact || "").replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp Support
                </a>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 transition-all shadow-2xs"
                >
                  Print Summary
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white">
        <p>© {new Date().getFullYear()} F2 Fintech Private Limited. All rights reserved. Secure 256-bit SSL encrypted loan tracking.</p>
      </footer>
    </div>
  );
}

export default function TrackLoanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 font-bold">Loading Loan Tracker...</div>}>
      <TrackLoanContent />
    </Suspense>
  );
}
