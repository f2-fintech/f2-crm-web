import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Typography, CircularProgress, IconButton, Chip, Stack, Slide, Fade } from "@mui/material";
import { X, UserCheck, MessageSquare, Briefcase, FileText, CheckCircle, Activity, Rocket, Building } from "lucide-react";
import api from "@/lib/axios";

interface LeadJourneyDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
}

export default function LeadJourneyDialog({ open, onClose, leadId }: LeadJourneyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ timeToResponse: "", conversionTime: "" });
  const [lead, setLead] = useState<any>(null);
  const [liveOmsData, setLiveOmsData] = useState<any>(null);

  useEffect(() => {
    if (open && leadId) {
      fetchTimeline();
    }
  }, [open, leadId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const [timelineRes, leadRes] = await Promise.all([
        api.get(`/timeline/lead/${leadId}`),
        api.get(`/leads/${leadId}`)
      ]);

      const leadData = leadRes.data.data || leadRes.data;
      setLead(leadData);

      let localTimeline = timelineRes.data.data || timelineRes.data;
      if (!Array.isArray(localTimeline)) localTimeline = [];

      // Re-inject synthetic events based on lead state (as they were in the old dummy timeline)
      const syntheticEvents = [];

      // Only inject CREATED if not already present from DB
      if (!localTimeline.some((t: any) => t.action === 'CREATED')) {
        syntheticEvents.push({
          _id: 'synth-created',
          action: 'CREATED',
          title: 'Lead Created',
          description: 'Lead was created in CRM.',
          createdAt: leadData.createdAt || new Date(),
          performedBy: { firstName: leadData.createdBy?.firstName || leadData.createdBy?.fullName || 'System' }
        });
      }

      // Inject Assigned event
      if (leadData.assignedTo || leadData.omsUserId || leadData.omsAppliedByName) {
        let agentName = leadData.omsAppliedByName || (leadData.assignedTo ? (leadData.assignedTo.firstName || leadData.assignedTo.fullName) : `Agent ID: ${leadData.omsUserId}`);
        syntheticEvents.push({
          _id: 'synth-assigned',
          action: 'ASSIGNED',
          title: 'Lead Assigned',
          description: `Assigned to ${agentName}`,
          createdAt: leadData.updatedAt || new Date(),
          performedBy: { firstName: leadData.updatedBy?.firstName || leadData.updatedBy?.fullName || 'System' }
        });
      }

      // Inject Follow Up event
      if (leadData.nextFollowUp) {
        syntheticEvents.push({
          _id: 'synth-followup',
          action: 'FOLLOWUP',
          title: 'Follow Up Scheduled',
          description: `Next Follow Up: ${new Date(leadData.nextFollowUp).toLocaleString()}`,
          createdAt: leadData.updatedAt || leadData.nextFollowUp,
          performedBy: { firstName: leadData.updatedBy?.firstName || leadData.updatedBy?.fullName || 'System' }
        });
      }

      localTimeline = [...localTimeline, ...syntheticEvents];

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
        api.get(`/leads/oms/history/${omsTicketId}`)
          .then(res => {
            const data = res.data;
            if (data?.data && Array.isArray(data.data)) {
              const omsHistories = data.data.map((h: any) => ({
                _id: `oms-${h.id}`,
                action: 'OMS_HISTORY',
                title: 'OMS Action',
                description: h.action,
                createdAt: h.created_at,
                isOms: true
              }));

              // Merge and sort
              const merged = [...localTimeline, ...omsHistories].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setTimeline(merged);
              calculateMetrics(merged);
            } else {
              setTimeline(localTimeline);
              calculateMetrics(localTimeline);
            }
          })
          .catch(err => {
            console.error("Failed to fetch OMS history", err);
            setTimeline(localTimeline);
            calculateMetrics(localTimeline);
          });
      } else {
        setTimeline(localTimeline);
        calculateMetrics(localTimeline);
      }
    } catch (error) {
      console.error("Failed to fetch timeline or lead data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data: any[]) => {
    if (data.length < 2) return;

    // Calculate simple metrics based on timestamps (ascending order logic)
    const firstActivity = new Date(data[data.length - 1]?.createdAt);
    const lastActivity = new Date(data[0]?.createdAt);

    const diffHours = Math.round((lastActivity.getTime() - firstActivity.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.round(diffHours / 24);

    setMetrics({
      timeToResponse: diffHours > 0 ? `${diffHours} hours` : "Instant",
      conversionTime: diffDays > 0 ? `${diffDays} days` : (diffHours > 0 ? `${diffHours} hours` : "In Progress")
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED": return <Rocket size={20} className="text-blue-500" />;
      case "ASSIGNED": return <UserCheck size={20} className="text-purple-500" />;
      case "OMS_HISTORY": return <Activity size={20} className="text-orange-500" />;
      case "COMMENT":
      case "FOLLOWUP": return <MessageSquare size={20} className="text-orange-500" />;
      case "PIPELINE_CHANGED": return <Briefcase size={20} className="text-indigo-500" />;
      case "STAGE_CHANGED": return <Activity size={20} className="text-brand-500" />;
      case "STATUS_CHANGED": return <CheckCircle size={20} className="text-green-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(8px)',
          }
        },
        paper: {
          sx: {
            borderRadius: "24px",
            boxShadow: "0 40px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#f4f7f9",
            position: 'relative'
          }
        }
      }}
    >
      {/* Dynamic Header */}
      <div className="bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-6 py-4 shrink-0 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-500 blur-[80px] opacity-40 rounded-full"></div>
        <div className="absolute bottom-[-50px] right-[10%] w-40 h-40 bg-purple-500 blur-[80px] opacity-30 rounded-full"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xl shadow-lg backdrop-blur-md">
            <Activity className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide">Customer Journey</h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">End-to-End Onboarding & Lifecycle Timeline</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="relative z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <DialogContent sx={{ p: 0, display: "flex", flex: 1, overflow: "hidden", position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%" }}>
            <CircularProgress size={40} thickness={4} sx={{ color: '#4f46e5' }} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" height="100%" width="100%">

            {/* Top Summary Area: Compact */}
            <div className="bg-white border-b border-gray-100 p-4 px-6 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-sm relative z-10">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{liveOmsData?.customerName || lead?.fullName || 'N/A'}</h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-0.5">
                    <span>{liveOmsData?.customerContact || lead?.phone || 'N/A'}</span>
                    <span className="text-gray-300">•</span>
                    <span>{liveOmsData?.customerEmail || lead?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Amount</div>
                  <div className="text-sm font-extrabold text-gray-900">
                    {liveOmsData?.applicationAmount ? `₹${Number(liveOmsData.applicationAmount).toLocaleString('en-IN')}` : (lead?.loanAmount ? `₹${Number(lead.loanAmount).toLocaleString('en-IN')}` : 'N/A')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Provider</div>
                  <div className="text-sm font-extrabold text-gray-900">{liveOmsData?.provider || lead?.omsProvider || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Status</div>
                  <div className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg uppercase tracking-wide">
                    {liveOmsData?.ticketStatus || lead?.omsTicketStatus || lead?.status || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area: Horizontal Timeline */}
            <Box flex={1} p={{ xs: 3, md: 3 }} sx={{ overflowY: "auto", overflowX: "hidden", bgcolor: "#f8fafc", position: 'relative' }}>
              <Box width="100%">
                <Box mb={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight={900} color="#0f172a" letterSpacing="-0.5px">Action Flow</Typography>
                  <Typography variant="body2" color="#64748b" mt={0.5}>Complete chronological history of events</Typography>
                </Box>

                {timeline.length === 0 ? (
                  <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: 300 }}>
                    <Activity size={48} className="text-gray-300 mb-4" />
                    <Typography color="#94a3b8" fontWeight={700} variant="h6">No Journey Data</Typography>
                    <Typography color="#94a3b8" variant="body2" mt={1}>Sync with OMS or wait for updates.</Typography>
                  </Box>
                ) : (
                  <Box position="relative">
                    {/* Dashed Connecting Line (Horizontal) */}
                    <Box position="absolute" top={32} left={40} right={40} height={0} sx={{ borderTop: "2px dashed #cbd5e1" }} zIndex={0} />

                    <Stack
                      direction="row"
                      spacing={4}
                      position="relative"
                      zIndex={1}
                      sx={{
                        overflowX: 'auto',
                        pb: 4, pt: 1, px: { xs: 1, md: 4 },
                        width: '100%',
                        justifyContent: timeline.length < 4 ? 'center' : 'flex-start',
                        '&::-webkit-scrollbar': { height: 8 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 4 }
                      }}
                    >
                      {timeline.map((item, index) => {
                        const isOms = item.isOms;
                        return (
                          <Box
                            key={item._id || index}
                            display="flex"
                            flexDirection="column"
                            gap={3}
                            sx={{
                              minWidth: 320,
                              maxWidth: 320,
                              animation: `slideRight 0.5s ease-out ${index * 0.1}s both`,
                              '@keyframes slideRight': {
                                '0%': { opacity: 0, transform: 'translateX(20px)' },
                                '100%': { opacity: 1, transform: 'translateX(0)' }
                              }
                            }}
                          >
                            {/* Node Icon */}
                            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'flex-start' }}>
                              <Box
                                sx={{
                                  width: 56, height: 56, borderRadius: "50%",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  background: isOms ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                  color: '#fff', flexShrink: 0,
                                  boxShadow: `0 4px 16px ${isOms ? 'rgba(245,158,11,0.4)' : 'rgba(79,70,229,0.4)'}`,
                                  border: '4px solid #f8fafc',
                                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': { transform: 'scale(1.15) rotate(5deg)' }
                                }}
                              >
                                {getActionIcon(item.action)}
                              </Box>
                            </Box>

                            <Box
                              flex={1}
                              sx={{
                                p: 3,
                                bgcolor: "#fff",
                                border: "1px solid rgba(0,0,0,0.04)",
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
                                position: 'relative',
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                '&:hover': {
                                  boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                                  transform: "translateY(-4px)"
                                }
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5} flexWrap="wrap" gap={1}>
                                <Box>
                                  <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: '1.1rem', letterSpacing: '-0.3px' }}>{item.title}</Typography>
                                  <Typography variant="body2" color="#475569" mt={0.5} sx={{ lineHeight: 1.6, fontWeight: 500 }}>{item.description}</Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  label={item.action}
                                  sx={{
                                    height: 26, fontSize: "11px", fontWeight: 800, letterSpacing: '0.5px',
                                    bgcolor: isOms ? "rgba(245,158,11,0.1)" : "rgba(79,70,229,0.1)",
                                    color: isOms ? "#ea580c" : "#4f46e5",
                                    borderRadius: 2
                                  }}
                                />
                              </Box>

                              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} pt={2} borderTop="1px dashed #e2e8f0">
                                <Typography variant="caption" fontWeight={700} color="#94a3b8">
                                  {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </Typography>
                                {item.performedBy?.firstName && (
                                  <Chip
                                    size="small"
                                    icon={<UserCheck size={14} style={{ marginLeft: 6 }} />}
                                    label={item.performedBy.firstName}
                                    sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '11px', borderRadius: 1.5 }}
                                  />
                                )}
                              </Box>

                              {/* Display Meta Data if exists */}
                              {item.metadata && Object.keys(item.metadata).length > 0 && (
                                <Box mt={2.5} p={2} bgcolor="#f8fafc" borderRadius={3} border="1px solid #f1f5f9">
                                  {Object.entries(item.metadata).map(([key, val]) => (
                                    <Box key={key} display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                                      <Typography variant="caption" color="#64748b" fontWeight={600} textTransform="uppercase">{key}</Typography>
                                      <Typography variant="caption" color="#0f172a" fontWeight={800}>{String(val)}</Typography>
                                    </Box>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
