import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Box, Typography, CircularProgress, IconButton, Chip } from "@mui/material";
import { X, UserCheck, MessageSquare, Briefcase, FileText, CheckCircle, Activity, Rocket } from "lucide-react";
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

  useEffect(() => {
    if (open && leadId) {
      fetchTimeline();
    }
  }, [open, leadId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/timeline/lead/${leadId}`);
      if (res.data) {
        setTimeline(res.data);
        calculateMetrics(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
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
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: { borderRadius: "16px", boxShadow: "0 24px 60px rgba(0,0,0,0.15)", maxHeight: "90vh", display: "flex", flexDirection: "column" }
        }
      }}
    >
      <Box sx={{ flexShrink: 0, p: 3, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", bg: "#f9fafb" }}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="#111827">Customer Journey Timeline</Typography>
          <Typography variant="caption" color="text.secondary">Complete Onboard to Offboard Flow</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "text.secondary", "&:hover": { color: "text.primary", bgcolor: "rgba(0,0,0,0.04)" } }}>
          <X size={20} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: "#fcfcfd" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress size={30} />
          </Box>
        ) : timeline.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="text.secondary">No journey data available for this lead.</Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection={{ xs: "column", md: "row" }} height="100%">

            {/* Left side: Metrics Panel */}
            <Box width={{ xs: "100%", md: "250px" }} p={3} borderRight={{ xs: "none", md: "1px dashed #e5e7eb" }} borderBottom={{ xs: "1px dashed #e5e7eb", md: "none" }}>
              <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary" textTransform="uppercase">Journey Insights</Typography>
              <Box mb={3}>
                <Typography variant="caption" color="text.secondary">Time to First Response</Typography>
                <Typography variant="body1" fontWeight={600} color="#111827">{metrics.timeToResponse}</Typography>
              </Box>
              <Box mb={3}>
                <Typography variant="caption" color="text.secondary">Active Duration</Typography>
                <Typography variant="body1" fontWeight={600} color="#111827">{metrics.conversionTime}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Touchpoints</Typography>
                <Typography variant="body1" fontWeight={600} color="#111827">{timeline.length} actions</Typography>
              </Box>
            </Box>

            {/* Right side: Vertical Timeline */}
            <Box flex={1} p={3} sx={{ overflowY: "auto" }}>
              <Box position="relative">
                {/* Vertical Line */}
                <Box position="absolute" top={16} bottom={16} left={20} width={2} bgcolor="#e5e7eb" zIndex={0} />

                <Stack spacing={4} position="relative" zIndex={1}>
                  {timeline.map((item, index) => (
                    <Box key={item._id || index} display="flex" gap={3}>
                      <Box
                        sx={{
                          width: 40, height: 40, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          bgcolor: "#fff", border: "2px solid #e5e7eb", flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                        }}
                      >
                        {getActionIcon(item.action)}
                      </Box>
                      <Box pt={0.5}>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="body2" fontWeight={600} color="#111827">{item.title}</Typography>
                          <Chip size="small" label={item.action} sx={{ height: 20, fontSize: "10px", fontWeight: 600, bgcolor: "rgba(99,102,241,0.1)", color: "#4f46e5" }} />
                        </Box>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary" mb={1}>{item.description}</Typography>
                        )}
                        <Typography variant="caption" color="text.disabled">
                          {new Date(item.createdAt).toLocaleString()} {item.performedBy?.firstName && `• by ${item.performedBy.firstName}`}
                        </Typography>

                        {/* Display Meta Data if exists */}
                        {item.metadata && Object.keys(item.metadata).length > 0 && (
                          <Box mt={1} p={1.5} bgcolor="#f3f4f6" borderRadius="8px">
                            {Object.entries(item.metadata).map(([key, val]) => (
                              <Typography key={key} variant="caption" display="block" color="text.secondary">
                                <span style={{ fontWeight: 600, color: '#374151' }}>{key}:</span> {String(val)}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
