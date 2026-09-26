"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  RefreshCcw,
  Trash2,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Table2,
  X,
} from "lucide-react";
import useNotionPages from "@/hooks/useNotionPages";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

export default function TrashDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { fetchDeletedPages, restorePage } = useNotionPages();
  const [deletedPages, setDeletedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (open) loadTrash();
  }, [open]);

  const loadTrash = async () => {
    try {
      setLoading(true);
      const pages = await fetchDeletedPages();
      setDeletedPages(pages || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setRestoring(id);
      await restorePage(id);
      setDeletedPages((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setRestoring(null);
    }
  };

  const getDaysLeft = (deletedAt: string | Date) => {
    const date = new Date(deletedAt);
    return Math.max(0, 45 - differenceInDays(new Date(), date));
  };

  const urgencyStyle = (daysLeft: number) => {
    if (daysLeft <= 5)  return { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" };
    if (daysLeft <= 15) return { bg: "#fffbeb", text: "#d97706", border: "#fde68a" };
    return                     { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "14px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.14)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
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
          bgcolor: "#fff",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {/* Title row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                bgcolor: "#fee2e2",
                border: "1px solid #fecaca",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Trash2 size={18} color="#dc2626" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                Trash — Deleted Pages
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6b7280", mt: 0.2 }}>
                Pages are kept here for 45 days, then permanently removed.
              </Typography>
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

        {/* Warning banner */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            px: 1.75,
            py: 0.875,
          }}
        >
          <AlertTriangle size={13} color="#d97706" style={{ flexShrink: 0 }} />
          <Typography sx={{ fontSize: "11.5px", color: "#b45309" }}>
            Pages with <strong>≤ 5 days</strong> remaining will be permanently deleted soon. Restore them to keep the data.
          </Typography>
        </Box>
      </Box>

      {/* ── Body (scrollable) ──────────────────────────────── */}
      <DialogContent sx={{ p: 0, overflowY: "auto", bgcolor: "#f9fafb" }}>
        {loading ? (
          /* skeleton */
          <Box sx={{ px: 3, py: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  height: 68,
                  borderRadius: "10px",
                  bgcolor: "#e5e7eb",
                  animation: "pulse 1.4s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.45 },
                  },
                }}
              />
            ))}
          </Box>
        ) : deletedPages.length === 0 ? (
          /* empty */
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 10,
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={28} color="#d1d5db" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#1f2937" }}>
              Trash is empty
            </Typography>
            <Typography sx={{ fontSize: "12.5px", color: "#9ca3af", textAlign: "center", maxWidth: 290 }}>
              Deleted pages will appear here and can be restored within 45 days.
            </Typography>
          </Box>
        ) : (
          /* list */
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 1.25 }}>
            {deletedPages.map((page) => {
              const daysLeft = getDaysLeft(page.deletedAt);
              const u = urgencyStyle(daysLeft);
              const deletedAt = page.deletedAt ? new Date(page.deletedAt) : new Date();
              const isRestoring = restoring === page._id;

              return (
                <Box
                  key={page._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.75,
                    bgcolor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    px: 2,
                    py: 1.5,
                    transition: "box-shadow 0.15s",
                    "&:hover": { boxShadow: "0 3px 12px rgba(0,0,0,0.07)" },
                  }}
                >
                  {/* page icon */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      bgcolor: page.pageType === "SHEET" ? "#eff6ff" : "#f5f3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {page.pageType === "SHEET" ? (
                      <Table2 size={16} color="#3b82f6" />
                    ) : (
                      <FileText size={16} color="#8b5cf6" />
                    )}
                  </Box>

                  {/* info */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.4 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "13.5px",
                          color: "#1f2937",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {page.title}
                      </Typography>
                      <Chip
                        label={page.pageType}
                        size="small"
                        sx={{
                          height: 17,
                          fontSize: "9.5px",
                          fontWeight: 600,
                          bgcolor: page.pageType === "SHEET" ? "#dbeafe" : "#ede9fe",
                          color: page.pageType === "SHEET" ? "#1d4ed8" : "#7c3aed",
                          "& .MuiChip-label": { px: 0.6 },
                          flexShrink: 0,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                      {page.createdBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <User size={10} color="#9ca3af" />
                          <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                            By <strong>{page.createdBy.firstName} {page.createdBy.lastName}</strong>
                            {page.createdBy?.teamId?.name && <span> · {page.createdBy.teamId.name}</span>}
                          </Typography>
                        </Box>
                      )}
                      {page.deletedBy && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Trash2 size={10} color="#ef4444" />
                          <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                            Deleted by <strong style={{ color: "#dc2626" }}>{page.deletedBy.firstName} {page.deletedBy.lastName}</strong>
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <Clock size={10} color="#9ca3af" />
                        <Typography sx={{ fontSize: "11px", color: "#6b7280" }}>
                          {format(deletedAt, "dd MMM yyyy")} ({formatDistanceToNow(deletedAt, { addSuffix: true })})
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* days left */}
                  <Tooltip title={`${daysLeft} day${daysLeft !== 1 ? "s" : ""} until permanent deletion`} arrow>
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.4,
                        borderRadius: "20px",
                        bgcolor: u.bg,
                        border: `1px solid ${u.border}`,
                        flexShrink: 0,
                        minWidth: 58,
                        textAlign: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: u.text }}>
                        {daysLeft}d left
                      </Typography>
                    </Box>
                  </Tooltip>

                  {/* restore */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleRestore(page._id)}
                    disabled={isRestoring}
                    startIcon={isRestoring ? undefined : <RefreshCcw size={12} />}
                    sx={{
                      textTransform: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "7px",
                      borderColor: "#d1d5db",
                      color: "#374151",
                      flexShrink: 0,
                      minWidth: 84,
                      "&:hover": { borderColor: "#4f46e5", color: "#4f46e5", bgcolor: "#eef2ff" },
                      "&.Mui-disabled": { opacity: 0.55 },
                    }}
                  >
                    {isRestoring ? (
                      <CircularProgress size={12} sx={{ color: "inherit" }} />
                    ) : (
                      "Restore"
                    )}
                  </Button>
                </Box>
              );
            })}
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
          {deletedPages.length} page{deletedPages.length !== 1 ? "s" : ""} in trash
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
            px: 2.25,
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
