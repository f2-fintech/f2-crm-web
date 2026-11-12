import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Typography, CircularProgress } from "@mui/material";
import {
  X,
  UserCheck,
  MessageSquare,
  Briefcase,
  FileText,
  CheckCircle,
  Activity,
  Rocket,
  Clock,
  ArrowUpDown,
  LayoutGrid,
  GitCommit,
  Share2,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Mail,
  IndianRupee,
  Layers,
  Sparkles
} from "lucide-react";
import api from "@/lib/axios";

interface LeadJourneyDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
}

export default function LeadJourneyDialog({ open, onClose, leadId }: LeadJourneyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [lead, setLead] = useState<any>(null);
  const [liveOmsData, setLiveOmsData] = useState<any>(null);

  // View & Filter States
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological Step 1 -> N

  useEffect(() => {
    if (open && leadId) {
      fetchTimeline();
    }
  }, [open, leadId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const leadRes = await api.get(`/leads/${leadId}`);
      const leadData = leadRes.data.data || leadRes.data;
      setLead(leadData);

      const omsTicketId = leadData?.omsTicketId || (!isNaN(Number(leadData?.leadId)) ? leadData.leadId : null);

      if (omsTicketId) {
        // Fetch Live OMS Data via Proxy with direct fallback
        api.get(`/leads/oms/detail/${omsTicketId}`)
          .then(async (res) => {
            if (res.data?.data) {
              setLiveOmsData(res.data.data);
            } else {
              const directOmsBase = process.env.NEXT_PUBLIC_OMS_BASE_URL || 'https://admin.f2fintech.in';
              const companyId = process.env.NEXT_PUBLIC_OMS_COMPANY_ID || '101';
              const dRes = await fetch(`${directOmsBase}/api/v1/get-ticket-with-detail/${omsTicketId}`, {
                headers: { companyid: companyId }
              });
              if (dRes.ok) {
                const dData = await dRes.json();
                if (dData?.data) setLiveOmsData(dData.data);
              }
            }
          })
          .catch(console.error);

        // Fetch OMS Ticket History via Proxy with direct fallback
        try {
          let historyList: any[] = [];
          const histRes = await api.get(`/leads/oms/history/${omsTicketId}`);
          const histData = histRes.data;
          if (histData?.data && Array.isArray(histData.data)) {
            historyList = histData.data;
          }

          if (historyList.length === 0) {
            try {
              const directOmsBase = process.env.NEXT_PUBLIC_OMS_BASE_URL || 'https://admin.f2fintech.in';
              const companyId = process.env.NEXT_PUBLIC_OMS_COMPANY_ID || '101';
              const directRes = await fetch(`${directOmsBase}/api/v1/get-ticket-histories/${omsTicketId}`, {
                headers: { companyid: companyId }
              });
              if (directRes.ok) {
                const dJson = await directRes.json();
                if (Array.isArray(dJson?.data)) {
                  historyList = dJson.data;
                }
              }
            } catch (dErr) {
              console.warn("Direct history fallback error:", dErr);
            }
          }

          if (historyList.length > 0) {
            const omsHistories = historyList.map((h: any) => ({
              _id: `oms-${h.id}`,
              action: 'OMS_ACTION',
              title: 'OMS Action',
              description: h.action,
              createdAt: h.created_at,
              isOms: true,
              performedBy: {
                firstName: h.user_name || (typeof h.action === 'string' ? h.action.split(' ')[0] : '')
              }
            }));
            setTimeline(omsHistories);
          } else {
            setTimeline([]);
          }
        } catch (err) {
          console.error("Failed to fetch OMS history", err);
          setTimeline([]);
        }
      } else {
        setTimeline([]);
      }
    } catch (error) {
      console.error("Failed to fetch lead data:", error);
      setTimeline([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (description: string) => {
    const text = (description || '').toLowerCase();
    if (text.includes('created') || text.includes('submit')) return <Rocket size={15} />;
    if (text.includes('assign') || text.includes('allocated')) return <UserCheck size={15} />;
    if (text.includes('status') || text.includes('rejected') || text.includes('approved') || text.includes('operations')) return <CheckCircle size={15} />;
    if (text.includes('follow') || text.includes('comment') || text.includes('note')) return <MessageSquare size={15} />;
    return <Activity size={15} />;
  };

  const displayTimeline = [...timeline].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  const customerName = liveOmsData?.customerName || lead?.fullName || 'N/A';
  const customerContact = liveOmsData?.customerContact || lead?.phone || 'N/A';
  const customerEmail = liveOmsData?.customerEmail || lead?.email || 'N/A';
  const customerAmount = liveOmsData?.applicationAmount
    ? `₹${Number(liveOmsData.applicationAmount).toLocaleString('en-IN')}`
    : (lead?.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString('en-IN')}` : 'N/A');
  const provider = liveOmsData?.provider || lead?.omsProvider || 'N/A';
  const leadType = liveOmsData?.leadType || lead?.omsLeadType || 'N/A';
  const ticketStatus = liveOmsData?.ticketStatus || lead?.omsTicketStatus || lead?.status || 'Unknown';

  const isDoctor = ((lead?.loanType || '').toLowerCase().includes('doctor') ||
    (lead?.fullName || '').toLowerCase().startsWith('dr') ||
    (liveOmsData?.leadType || '').toLowerCase().includes('doctor'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      scroll="paper"
      sx={{
        zIndex: 100000,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
          }
        },
        paper: {
          sx: {
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
            width: { xs: "96vw", lg: "92vw" },
            maxWidth: "1400px",
            height: { xs: "94vh", md: "88vh" },
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#ffffff",
            position: 'relative'
          }
        }
      }}
    >
      {/* 1. Top Header - Clean, Crisp White SaaS Theme */}
      <div className="bg-white border-b border-slate-200/90 flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">OMS Action Journey</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Verified OMS Flow
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live verified chronological history & event audit trail
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-200"
          aria-label="Close dialog"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      </div>

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          bgcolor: "#f8fafc",
          position: 'relative',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          }
        }}
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full w-full min-h-[380px] gap-3">
            <CircularProgress size={38} thickness={4} sx={{ color: '#f97316' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
              Loading journey records...
            </Typography>
          </div>
        ) : (
          <>
            {/* 2. Customer Details Card Strip */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-2xs">
              {/* Customer Profile */}
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-700 flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
                  {customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                    {customerName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Phone size={12} className="text-slate-400" /> {customerContact}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1"><Mail size={12} className="text-slate-400" /> {customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Metrics & Status Badges */}
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Amount</div>
                  <div className="text-sm font-black text-slate-900">{customerAmount}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Provider</div>
                  <div className="text-sm font-extrabold text-slate-800">{provider}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Lead Type</div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {leadType}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Ticket Status</div>
                  <div className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {ticketStatus}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const ticketId = liveOmsData?.ticketId || lead?.omsTicketId || lead?.leadId || '';
                      const url = `${window.location.origin}/track-loan?ticket=${ticketId}`;
                      navigator.clipboard.writeText(url);
                      alert('Tracking link copied to clipboard:\n' + url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer hover:border-slate-300"
                    title="Copy Live Tracker Link to Clipboard"
                  >
                    <Share2 size={13} className="text-slate-500" />
                    Copy Tracker Link
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const ticketId = liveOmsData?.ticketId || lead?.omsTicketId || lead?.leadId || '';
                      const url = `${window.location.origin}/track-loan?ticket=${ticketId}`;
                      const phone = (customerContact || '').replace(/\D/g, '');
                      const name = customerName || 'Customer';
                      const st = ticketStatus || 'In Process';
                      const msg = `Namaste ${name}! Aapki F2 Fintech Loan Application (Ticket #${ticketId}) ka live status yahan track karein: ${url}\nCurrent Status: ${st}`;
                      window.open(`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    title="Send Live Status to Customer on WhatsApp"
                  >
                    <MessageSquare size={13} />
                    WhatsApp Customer
                  </button>

                  {isDoctor && (
                    <button
                      type="button"
                      onClick={() => window.open('/doctors', '_blank')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      title="Open Doctor Privilege Network & Offers"
                    >
                      <Stethoscope size={13} />
                      Doctor Offers
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Toolbar - Sticky underneath customer bar */}
            <div className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  OMS Actions ({timeline.length})
                </span>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  Live verified chronological action audit trail
                </span>
              </div>

              {/* View Mode & Sort Switches */}
              <div className="flex items-center gap-2">
                {/* Sort Order Toggle */}
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  title="Toggle Chronological Order"
                >
                  <ArrowUpDown size={12} className="text-slate-500" />
                  <span>{sortOrder === 'asc' ? 'Oldest First (Step 1→N)' : 'Latest First'}</span>
                </button>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid size={12} />
                    Grid Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'timeline'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <GitCommit size={12} />
                    Timeline Stream
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Main Content Area */}
            <div className="p-6 bg-[#f8fafc] flex-1">
              {displayTimeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-200">
                    <Activity size={28} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No OMS Actions Recorded</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    There are no recorded OMS action events for this ticket yet.
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                /* Grid Cards Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayTimeline.map((item, index) => {
                    const isOms = item.isOms;
                    return (
                      <div
                        key={item._id || index}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-4.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          {/* Step Pill & Action Icon */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-200">
                                #{index + 1}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                isOms
                                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {isOms ? 'OMS Action' : item.action}
                              </span>
                            </div>

                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs ${
                              isOms
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                                : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                            }`}>
                              {getActionIcon(item.action)}
                            </div>
                          </div>

                          {/* Action Title */}
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </h4>

                          {/* Description */}
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                            {item.description}
                          </p>

                          {/* Metadata (if any) */}
                          {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] space-y-1">
                              {Object.entries(item.metadata).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center">
                                  <span className="text-slate-400 font-semibold uppercase">{k}:</span>
                                  <span className="text-slate-800 font-bold">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            {new Date(item.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>

                          {item.performedBy?.firstName && (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                              <UserCheck size={11} className="text-indigo-600" />
                              {item.performedBy.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Timeline Stream Mode */
                <div className="max-w-3xl mx-auto py-2">
                  <div className="relative pl-6 space-y-5 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200">
                    {displayTimeline.map((item, index) => {
                      const isOms = item.isOms;
                      return (
                        <div key={item._id || index} className="relative flex items-start gap-4 group">
                          {/* Timeline Node Icon */}
                          <div className={`relative z-10 w-9 h-9 -ml-6 rounded-xl flex items-center justify-center text-white shadow-xs border-2 border-white shrink-0 ${
                            isOms
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                              : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                          }`}>
                            {getActionIcon(item.action)}
                          </div>

                          {/* Timeline Card */}
                          <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-400">Step #{index + 1}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isOms
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}>
                                  {isOms ? 'OMS Action' : item.action}
                                </span>
                              </div>

                              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(item.createdAt).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </span>
                            </div>

                            <h4 className="text-sm font-extrabold text-slate-900 mt-1">{item.title}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{item.description}</p>

                            {item.performedBy?.firstName && (
                              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                                <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                                  <UserCheck size={11} className="text-indigo-600" />
                                  Performed by {item.performedBy.firstName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
