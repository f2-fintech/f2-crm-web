import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Typography, CircularProgress, Tooltip } from "@mui/material";
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
  Gift
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
        // Fetch Live OMS Data via Proxy
        api.get(`/leads/oms/detail/${omsTicketId}`)
          .then(res => {
            if (res.data?.data) {
              setLiveOmsData(res.data.data);
            }
          })
          .catch(console.error);

        // Fetch OMS Ticket History via Proxy
        try {
          const histRes = await api.get(`/leads/oms/history/${omsTicketId}`);
          const histData = histRes.data;
          if (histData?.data && Array.isArray(histData.data)) {
            const omsHistories = histData.data.map((h: any) => ({
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
    if (text.includes('created') || text.includes('submit')) return <Rocket size={16} />;
    if (text.includes('assign') || text.includes('allocated')) return <UserCheck size={16} />;
    if (text.includes('status') || text.includes('rejected') || text.includes('approved') || text.includes('operations')) return <CheckCircle size={16} />;
    if (text.includes('follow') || text.includes('comment') || text.includes('note')) return <MessageSquare size={16} />;
    return <Activity size={16} />;
  };

  const displayTimeline = [...timeline].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
          }
        },
        paper: {
          sx: {
            borderRadius: "24px",
            boxShadow: "0 30px 90px rgba(0,0,0,0.4)",
            width: { xs: "96vw", lg: "92vw" },
            maxWidth: "1440px",
            height: { xs: "94vh", md: "88vh" },
            maxHeight: "94vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#f8fafc",
            position: 'relative'
          }
        }
      }}
    >
      {/* Top Banner Header */}
      <div className="bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 py-4 shrink-0 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-[-50px] left-[-30px] w-48 h-48 bg-indigo-500 blur-[80px] opacity-40 rounded-full pointer-events-none" />
        <div className="absolute bottom-[-50px] right-[10%] w-56 h-56 bg-amber-500 blur-[90px] opacity-25 rounded-full pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-wide">OMS Action Journey</h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                Verified OMS Flow
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 mt-0.5">Live verified chronological history of OMS events</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} />
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
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#94a3b8',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#64748b',
          }
        }}
      >
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full w-full min-h-[380px] gap-2">
            <CircularProgress size={42} thickness={4} sx={{ color: '#6366f1' }} />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>Loading journey records...</Typography>
          </div>
        ) : (
          <>
            {/* Customer Details Strip - Sticky */}
            <div className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100 shadow-sm">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {liveOmsData?.customerName || lead?.fullName || 'N/A'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5">
                    <span>{liveOmsData?.customerContact || lead?.phone || 'N/A'}</span>
                    <span className="text-slate-300">•</span>
                    <span>{liveOmsData?.customerEmail || lead?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-8 flex-wrap">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Amount</div>
                  <div className="text-sm font-black text-slate-900">
                    {liveOmsData?.applicationAmount ? `₹${Number(liveOmsData.applicationAmount).toLocaleString('en-IN')}` : (lead?.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString('en-IN')}` : 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Provider</div>
                  <div className="text-sm font-black text-slate-900">{liveOmsData?.provider || lead?.omsProvider || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ticket Status</div>
                  <div className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-lg uppercase tracking-wide">
                    {liveOmsData?.ticketStatus || lead?.omsTicketStatus || lead?.status || 'Unknown'}
                  </div>
                </div>

                {/* Share Live Tracking With Customer */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const ticketId = liveOmsData?.ticketId || lead?.omsTicketId || lead?.leadId || '';
                      const url = `${window.location.origin}/track-loan?ticket=${ticketId}`;
                      navigator.clipboard.writeText(url);
                      alert('Tracking link copied to clipboard:\n' + url);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                    title="Copy Live Tracker Link to Clipboard"
                  >
                    <Share2 size={13} />
                    Copy Tracker Link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const ticketId = liveOmsData?.ticketId || lead?.omsTicketId || lead?.leadId || '';
                      const url = `${window.location.origin}/track-loan?ticket=${ticketId}`;
                      const phone = (liveOmsData?.customerContact || lead?.phone || '').replace(/\D/g, '');
                      const name = liveOmsData?.customerName || lead?.fullName || 'Customer';
                      const st = liveOmsData?.ticketStatus || lead?.omsTicketStatus || lead?.status || 'In Process';
                      const msg = `Namaste ${name}! Aapki F2 Fintech Loan Application (Ticket #${ticketId}) ka live status yahan track karein: ${url}\nCurrent Status: ${st}`;
                      window.open(`https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                    title="Send Live Status to Customer on WhatsApp"
                  >
                    <MessageSquare size={13} />
                    WhatsApp Customer
                  </button>
                  {((lead?.loanType || '').toLowerCase().includes('doctor') ||
                    (lead?.fullName || '').toLowerCase().startsWith('dr') ||
                    (liveOmsData?.leadType || '').toLowerCase().includes('doctor')) && (
                    <button
                      type="button"
                      onClick={() => window.open('/doctors', '_blank')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                      title="Open Doctor Privilege Network & Offers"
                    >
                      <Stethoscope size={13} />
                      Doctor Offers
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Toolbar - Sticky underneath customer bar */}
            <div className="sticky top-[69px] z-20 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  OMS Actions ({timeline.length})
                </span>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  Live verified OMS action audit trail
                </span>
              </div>

              {/* View Mode & Sort Switches */}
              <div className="flex items-center gap-2">
                {/* Sort Order Toggle */}
                <button
                  type="button"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                  title="Toggle Chronological Order"
                >
                  <ArrowUpDown size={13} className="text-slate-500" />
                  <span>{sortOrder === 'asc' ? 'Oldest First (Step 1→N)' : 'Latest First'}</span>
                </button>

                {/* View Mode (Grid vs Timeline) */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    Grid Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('timeline')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <GitCommit size={13} />
                    Timeline Stream
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 md:p-6 bg-[#f8fafc] pb-24">
              {displayTimeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-3 border border-amber-200">
                    <Activity size={32} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No OMS Actions Found</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">There are no recorded OMS actions for this ticket yet.</p>
                </div>
              ) : viewMode === 'grid' ? (
                /* 1. ULTRA-CLEAN RESPONSIVE GRID (SAB EK SATH DIKHEGA, ZERO CUT-OFF!) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayTimeline.map((item, index) => {
                    const isOms = item.isOms;
                    return (
                      <div
                        key={item._id || index}
                        className="group relative bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
                      >
                        {/* Top Step Counter & Action Pill */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black border border-slate-200">
                                #{index + 1}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                isOms
                                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                              }`}>
                                {isOms ? 'OMS Action' : item.action}
                              </span>
                            </div>

                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm ${
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

                        {/* Bottom Row: Performer & Exact Date */}
                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
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
                /* 2. CLASSIC VERTICAL TIMELINE STREAM */
                <div className="max-w-3xl mx-auto py-2">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[17px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200">
                    {displayTimeline.map((item, index) => {
                      const isOms = item.isOms;
                      return (
                        <div key={item._id || index} className="relative flex items-start gap-4 group">
                          {/* Timeline Node Dot */}
                          <div className={`relative z-10 w-9 h-9 -ml-6 rounded-xl flex items-center justify-center text-white shadow-md border-2 border-white shrink-0 ${
                            isOms
                              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/20'
                              : 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/20'
                          }`}>
                            {getActionIcon(item.action)}
                          </div>

                          {/* Timeline Card */}
                          <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-400">Step #{index + 1}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                                  isOms
                                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
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

