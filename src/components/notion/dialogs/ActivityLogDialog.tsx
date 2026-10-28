"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Activity,
  FilePlus,
  UserCheck,
  PenLine,
  Trash2,
  Clock,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { formatDistanceToNow, format } from "date-fns";

interface LogEntry {
  type: "CREATED" | "ASSIGNED" | "UPDATED" | "DELETED";
  action: string;
  actor?: { firstName: string; lastName: string; email: string };
  target?: { firstName: string; lastName: string; email: string };
  timestamp: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  pageId: string | null;
  pageTitle?: string;
}

const logConfig = {
  CREATED:  { icon: FilePlus,  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", chip: "#dcfce7", chipText: "#15803d", label: "Created"  },
  ASSIGNED: { icon: UserCheck, color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", chip: "#dbeafe", chipText: "#1d4ed8", label: "Assigned" },
  UPDATED:  { icon: PenLine,   color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", chip: "#ede9fe", chipText: "#6d28d9", label: "Updated"  },
  DELETED:  { icon: Trash2,    color: "#dc2626", bg: "#fef2f2", border: "#fecaca", chip: "#fee2e2", chipText: "#b91c1c", label: "Deleted"  },
};

export default function ActivityLogDialog({ open, onClose, pageId, pageTitle }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && pageId && !pageId.startsWith("user_")) {
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [open, pageId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notion-pages/${pageId}/activity-log`);
      setLogs(res.data?.logs || []);
    } catch (err) {
      console.error("Failed to fetch activity log", err);
    } finally {
      setLoading(false);
    }
  };

  const actorName = (u?: { firstName: string; lastName: string }) =>
    u ? `${u.firstName} ${u.lastName}` : "Unknown";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "85vh",
          },
        },
      }}
    >
      {/* ── Header (fixed) ─────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: "1px solid #e5e7eb",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "9px",
              bgcolor: "#eef2ff",
              border: "1px solid #c7d2fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={17} color="#4f46e5" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
              Activity Log
            </Typography>
            {pageTitle && (
              <Typography sx={{ fontSize: "11.5px", color: "#6b7280", mt: 0.2, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {pageTitle}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "#9ca3af", "&:hover": { bgcolor: "#f3f4f6", color: "#374151" } }}
        >
          <X size={16} />
        </IconButton>
      </Box>

      {/* ── Body (scrollable) ──────────────────────────────── */}
      <DialogContent sx={{ p: 0, overflowY: "auto", bgcolor: "#f9fafb" }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 1.5 }}>
            <CircularProgress size={26} sx={{ color: "#4f46e5" }} />
            <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>Loading activity…</Typography>
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 9, gap: 1.5 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={22} color="#d1d5db" />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "#374151" }}>No activity yet</Typography>
            <Typography sx={{ fontSize: "12.5px", color: "#9ca3af", textAlign: "center", maxWidth: 260 }}>
              Actions on this page — creation, edits, assignments — will appear here.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ px: 2.5, py: 2.5 }}>
            {/* Vertical timeline */}
            <Box sx={{ position: "relative" }}>
              {/* connecting line */}
              <Box
                sx={{
                  position: "absolute",
                  left: 16,
                  top: 18,
                  bottom: 18,
                  width: 2,
                  bgcolor: "#e5e7eb",
                  borderRadius: 2,
                }}
              />

              {logs.map((log, idx) => {
                const cfg = logConfig[log.type] ?? logConfig.UPDATED;
                const Icon = cfg.icon;
                const ts = new Date(log.timestamp);

                return (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: idx < logs.length - 1 ? 2 : 0,
                      position: "relative",
                    }}
                  >
                    {/* dot */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        border: `2px solid ${cfg.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        zIndex: 1,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <Icon size={14} color={cfg.color} />
                    </Box>

                    {/* card */}
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        px: 2,
                        py: 1.5,
                        transition: "box-shadow 0.15s",
                        "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.07)" },
                      }}
                    >
                      {/* top row: badge + action + time */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{ height: 18, fontSize: "10px", fontWeight: 700, bgcolor: cfg.chip, color: cfg.chipText, "& .MuiChip-label": { px: 0.75 } }}
                          />
                          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#1f2937" }}>
                            {log.action}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, flexShrink: 0, ml: 1 }}>
                          <Clock size={10} color="#9ca3af" />
                          <Typography sx={{ fontSize: "10.5px", color: "#9ca3af", whiteSpace: "nowrap" }}>
                            {formatDistanceToNow(ts, { addSuffix: true })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* actor */}
                      <Typography sx={{ fontSize: "12px", color: "#6b7280" }}>
                        By <strong style={{ color: "#374151" }}>{actorName(log.actor)}</strong>
                        {log.type === "ASSIGNED" && log.target && (
                          <>
                            {" → "}
                            <strong style={{ color: "#2563eb" }}>{actorName(log.target)}</strong>
                          </>
                        )}
                      </Typography>

                      {/* exact time */}
                      <Typography sx={{ fontSize: "10.5px", color: "#d1d5db", mt: 0.25 }}>
                        {format(ts, "dd MMM yyyy, hh:mm a")}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Footer ────────────────────────────────────────── */}
      <DialogActions
        sx={{
          flexShrink: 0,
          px: 3,
          py: 1.75,
          borderTop: "1px solid #e5e7eb",
          bgcolor: "#fff",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "12px", color: "#9ca3af" }}>
          {logs.length} event{logs.length !== 1 ? "s" : ""}
        </Typography>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            textTransform: "none",
            fontSize: "13px",
            fontWeight: 500,
            color: "#374151",
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
