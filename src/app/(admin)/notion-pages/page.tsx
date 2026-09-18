"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Smile,
  Table as TableIcon,
  Trash2,
  X,
} from "lucide-react";
import useNotionPages, { NotionPageItem } from "@/hooks/useNotionPages";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";

/* ------------------------------------------------------------------ *
 * Tokens
 * ------------------------------------------------------------------ */

const c = {
  bg: "#ffffff",
  sidebarBg: "#fbfbfa",
  hover: "rgba(55, 53, 47, 0.055)",
  active: "rgba(35, 131, 226, 0.09)",
  textMain: "#37352f",
  textMuted: "rgba(55, 53, 47, 0.55)",
  textFaint: "rgba(55, 53, 47, 0.36)",
  border: "rgba(55, 53, 47, 0.1)",
  borderStrong: "rgba(55, 53, 47, 0.16)",
  accent: "#2383e2",
  accentSoft: "rgba(35, 131, 226, 0.1)",
  accentHover: "#1b6bbd",
  danger: "#d5493f",
  dangerSoft: "rgba(213, 73, 63, 0.08)",
};

const FONT_SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif';
const FONT_SERIF = 'ui-serif, Lyon-Text, Georgia, "Times New Roman", serif';
const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const AVATAR_COLORS = ["#eb5757", "#e08840", "#2383e2", "#9b6bd6", "#0f9d8c"];

function hashColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/* Feedback is stored as "[timestamp]: text" blocks joined by blank lines.
   Parse it back into entries so history can render as a real log. */
type FeedbackEntry = { time: string; text: string };

function parseFeedback(notes?: string): FeedbackEntry[] {
  if (!notes) return [];
  return notes
    .split("\n\n")
    .map((chunk) => {
      const m = chunk.match(/^\[(.*?)\]:\s*([\s\S]*)$/);
      return m
        ? { time: m[1].trim(), text: m[2].trim() }
        : { time: "", text: chunk.trim() };
    })
    .filter((e) => e.text.length > 0);
}

function matchesQuery(node: NotionPageItem, q: string): boolean {
  if (!q) return true;
  if (node.title?.toLowerCase().includes(q)) return true;
  return (node.children || []).some((child) => matchesQuery(child, q));
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function NotionPagesClientPage() {
  const {
    treeData,
    activePage,
    fetchTree,
    fetchPageDetails,
    createPage,
    updatePageTitle,
    setActivePage,
  } = useNotionPages();

  const { user, role } = useAuth();
  const currentUser = user;

  const [selectedPageTitle, setSelectedPageTitle] = useState("Untitled");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [rowsData, setRowsData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [loadingPage, setLoadingPage] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pageMenuAnchor, setPageMenuAnchor] = useState<null | HTMLElement>(null);

  // Upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pastedData, setPastedData] = useState("");
  const [replaceData, setReplaceData] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Create page
  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | undefined>();
  const [createTitle, setCreateTitle] = useState("");
  const [creating, setCreating] = useState(false);

  // Clear confirm
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [newRowRemark, setNewRowRemark] = useState("");
  const [savingFeedback, setSavingFeedback] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    severity: "success" | "error";
  } | null>(null);

  const historyRef = useRef<HTMLDivElement | null>(null);

  const notify = useCallback(
    (msg: string, severity: "success" | "error" = "success") =>
      setToast({ msg, severity }),
    []
  );

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (!selectedPageId) {
      let queryPageId = null;
      if (typeof window !== "undefined") {
        queryPageId = new URLSearchParams(window.location.search).get("pageId");
      }
      
      if (queryPageId) {
        setSelectedPageId(queryPageId);
        fetchPageDetails(queryPageId).then((page: any) => {
          if (page?.title) setSelectedPageTitle(page.title);
        });
      } else if (treeData?.shared?.length) {
        const first = treeData.shared[0];
        const id = first._id || first.id;
        if (id) {
          setSelectedPageId(id);
          setSelectedPageTitle(first.title);
          fetchPageDetails(id);
        }
      }
    }
  }, [treeData, selectedPageId, fetchPageDetails]);

  useEffect(() => {
    if (!activePage) return;
    if (Array.isArray(activePage.rows)) setRowsData(activePage.rows);
    if (activePage.title) setSelectedPageTitle(activePage.title);
  }, [activePage]);

  /* ---------------- permissions ---------------- */

  const canEdit = useCallback(
    (nodeId?: string, pageObj: any = null) => {
      if (!user) return false;
      const r = role?.toUpperCase();
      if (r === "SUPER_ADMIN" || r === "ADMIN") return true;
      const isElevated = r === "MANAGER" || r === "TEAM_LEADER";

      if (nodeId?.startsWith("user_")) {
        const target = nodeId.replace("user_", "");
        if (target === user.id || target === (user as any)._id) return true;
        return isElevated;
      }
      if (pageObj?.assignedMemberId) {
        const a = pageObj.assignedMemberId;
        if (a === user.id || a === (user as any)._id) return true;
        return isElevated;
      }
      return isElevated;
    },
    [user, role]
  );

  const editable = canEdit(selectedPageId || undefined, activePage);

  /* ---------------- actions ---------------- */

  const handleShareClick = () => {
    if (!selectedPageId) return;
    const shareUrl = `${window.location.origin}/notion-pages?pageId=${selectedPageId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => notify("Link copied to clipboard!", "success"))
      .catch(() => notify("Failed to copy link", "error"));
  };

  const handleSelectPage = async (node: NotionPageItem) => {
    const pageId = node._id || node.id;
    if (!pageId || pageId === selectedPageId) return;
    setSelectedPageTitle(node.title);
    setSelectedPageId(pageId);
    setSearchQuery("");
    setLoadingPage(true);
    try {
      await fetchPageDetails(pageId);
    } finally {
      setLoadingPage(false);
    }
  };

  const openCreateDialog = (parentId?: string) => {
    setCreateParentId(parentId);
    setCreateTitle("");
    setCreateOpen(true);
  };

  const handleCreatePage = async () => {
    setCreating(true);
    try {
      const title = createTitle.trim() || "Untitled";
      const created = await createPage({
        title,
        pageType: "SHEET",
        section: "SHARED",
        parentId: createParentId || undefined,
      });
      const newId = created?._id || created?.id;
      if (newId) {
        if (createParentId) {
          setExpandedNodes((p) => ({ ...p, [createParentId]: true }));
        }
        setSelectedPageId(newId);
        setSelectedPageTitle(title);
        await fetchPageDetails(newId);
      }
      setCreateOpen(false);
      notify(`Created “${title}”`);
    } catch (e) {
      console.error(e);
      notify("Couldn’t create the page. Try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleRenamePage = async (newTitle: string) => {
    const next = newTitle.trim();
    if (!selectedPageId || !next || next === activePage?.title) {
      setSelectedPageTitle(activePage?.title || "Untitled");
      return;
    }
    try {
      await api.patch(`/notion-pages/${selectedPageId}`, { title: next });
      setSelectedPageTitle(next);
      if (activePage) setActivePage({ ...activePage, title: next });
      await fetchTree(); // refresh sidebar titles
    } catch (e) {
      console.error(e);
      setSelectedPageTitle(activePage?.title || "Untitled");
      notify("Couldn’t rename the page.", "error");
    }
  };

  const handleUpload = async () => {
    if (!pastedData.trim() || !selectedPageId) return;
    const lines = pastedData.trim().split("\n").filter((l) => l.trim());
    if (!lines.length) return;

    const split = (line: string) =>
      line.split("\t").length > 1 ? line.split("\t") : line.split(",");

    let finalColumns: any[] = replaceData ? [] : activePage?.columns || [];
    const firstParts = split(lines[0]);
    let startIndex = 0;

    if (finalColumns.length === 0) {
      finalColumns = firstParts.map((header, idx) => ({
        key: `col_${idx}`,
        name: header.trim() || `Column ${idx + 1}`,
        type: "text",
      }));
      startIndex = 1;
    } else if (
      firstParts[0]?.trim().toLowerCase() ===
      finalColumns[0]?.name?.toLowerCase()
    ) {
      startIndex = 1;
    }

    const newRows = lines.slice(startIndex).map((line, rowIndex) => {
      const parts = split(line);
      const rowObj: any = { id: `row_${Date.now()}_${rowIndex}` };
      finalColumns.forEach((col, idx) => {
        rowObj[col.key] = parts[idx]?.trim() || "";
      });
      return rowObj;
    });

    const updatedRows = replaceData
      ? newRows
      : [...(activePage?.rows || []), ...newRows];

    setUploading(true);
    try {
      const res = await api.patch(`/notion-pages/${selectedPageId}`, {
        columns: finalColumns,
        rows: updatedRows,
      });
      setActivePage(res.data?.data ?? res.data);
      setUploadOpen(false);
      setPastedData("");
      setReplaceData(false);
      notify(
        `${newRows.length} ${newRows.length === 1 ? "lead" : "leads"} added`
      );
    } catch (e: any) {
      console.error(e);
      notify(
        e?.response?.data?.message || "Upload failed. Check the format and retry.",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClearData = async () => {
    if (!selectedPageId) return;
    setClearing(true);
    try {
      const res = await api.patch(`/notion-pages/${selectedPageId}`, {
        columns: [],
        rows: [],
      });
      setActivePage(res.data?.data ?? res.data);
      setClearOpen(false);
      notify("All rows removed");
    } catch (e) {
      console.error(e);
      notify("Couldn’t clear the data.", "error");
    } finally {
      setClearing(false);
    }
  };

  const openFeedback = (index: number) => {
    setSelectedRowIndex(index);
    setNewRowRemark("");
    setFeedbackOpen(true);
  };

  const handleSaveFeedback = async () => {
    if (selectedRowIndex === null || !activePage || !selectedPageId) return;
    const remark = newRowRemark.trim();
    if (!remark) return;

    const updatedRows = [...activePage.rows];
    const row = { ...updatedRows[selectedRowIndex] };
    const stamp = new Date().toLocaleString();
    row.feedback_notes = row.feedback_notes
      ? `${row.feedback_notes}\n\n[${stamp}]: ${remark}`
      : `[${stamp}]: ${remark}`;
    updatedRows[selectedRowIndex] = row;

    setSavingFeedback(true);
    try {
      const res = await api.patch(`/notion-pages/${selectedPageId}`, {
        rows: updatedRows,
      });
      setActivePage(res.data?.data ?? res.data);
      setNewRowRemark("");
      notify("Feedback added");
      requestAnimationFrame(() => {
        historyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      });
    } catch (e) {
      console.error(e);
      notify("Couldn’t save the feedback.", "error");
    } finally {
      setSavingFeedback(false);
    }
  };

  /* ---------------- derived ---------------- */

  const pageColumns = activePage?.columns || [];

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rowsData.map((row, i) => ({ row, i }));
    return rowsData
      .map((row, i) => ({ row, i }))
      .filter(({ row }) =>
        pageColumns.some((col: any) =>
          String(row[col.key] ?? "").toLowerCase().includes(q)
        )
      );
  }, [rowsData, searchQuery, pageColumns]);

  const activeFeedback = useMemo(
    () =>
      selectedRowIndex !== null
        ? parseFeedback(activePage?.rows?.[selectedRowIndex]?.feedback_notes)
        : [],
    [activePage, selectedRowIndex]
  );

  const feedbackRowLabel = useMemo(() => {
    if (selectedRowIndex === null) return "";
    const row = activePage?.rows?.[selectedRowIndex];
    const firstCol = pageColumns[0];
    const val = firstCol ? row?.[firstCol.key] : "";
    return val ? String(val) : `Row ${selectedRowIndex + 1}`;
  }, [activePage, selectedRowIndex, pageColumns]);

  const workspaceName = currentUser?.firstName
    ? `${currentUser.firstName}’s Team`
    : "Workspace";
  const initials = currentUser?.firstName?.charAt(0)?.toUpperCase() || "W";
  const avatarColor = hashColor(currentUser?.firstName || "workspace");

  /* ---------------- sidebar tree ---------------- */

  const renderTreeNodes = (nodes: NotionPageItem[], depth = 0) => {
    const q = sidebarQuery.trim().toLowerCase();
    return nodes
      .filter((node) => matchesQuery(node, q))
      .map((node) => {
        const nodeKey = node._id || node.id;
        const hasChildren = !!node.children?.length;
        const isExpanded = q ? true : expandedNodes[nodeKey] !== false;
        const isSelected = selectedPageId === nodeKey;

        return (
          <Box key={nodeKey}>
            <Stack
              className="tree-row"
              direction="row"
              onClick={() => handleSelectPage(node)}
              sx={{
                alignItems: "center",
                gap: 0.25,
                height: 28,
                pl: 0.75 + depth * 1.25,
                pr: 0.75,
                mx: 0.75,
                borderRadius: "6px",
                cursor: "pointer",
                bgcolor: isSelected ? c.active : "transparent",
                color: isSelected ? c.accent : c.textMain,
                "&:hover": { bgcolor: isSelected ? c.active : c.hover },
                "&:focus-visible": {
                  outline: `2px solid ${c.accent}`,
                  outlineOffset: 1,
                },
              }}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelectPage(node);
              }}
            >
              <IconButton
                size="small"
                aria-label={isExpanded ? "Collapse" : "Expand"}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedNodes((p) => ({ ...p, [nodeKey]: !isExpanded }));
                }}
                sx={{
                  p: 0.2,
                  color: c.textFaint,
                  visibility: hasChildren ? "visible" : "hidden",
                  "&:hover": { bgcolor: c.hover },
                }}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </IconButton>

              {node.pageType === "SHEET" ? (
                <TableIcon
                  size={15}
                  style={{
                    color: isSelected ? c.accent : c.textMuted,
                    marginRight: 6,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <FileText
                  size={15}
                  style={{
                    color: isSelected ? c.accent : c.textMuted,
                    marginRight: 6,
                    flexShrink: 0,
                  }}
                />
              )}

              <Typography
                noWrap
                sx={{
                  fontSize: "13.5px",
                  fontWeight: isSelected ? 600 : 450,
                  flexGrow: 1,
                  letterSpacing: "-0.08px",
                }}
              >
                {node.title}
              </Typography>

              {canEdit(nodeKey) && (
                <Tooltip title="Add a page inside" placement="top" arrow>
                  <IconButton
                    size="small"
                    aria-label="Add a page inside"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateDialog(nodeKey);
                    }}
                    sx={{
                      p: 0.2,
                      color: c.textMuted,
                      opacity: 0,
                      ".tree-row:hover &": { opacity: 1 },
                      "&:focus-visible": { opacity: 1 },
                    }}
                  >
                    <Plus size={14} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {hasChildren && isExpanded && renderTreeNodes(node.children!, depth + 1)}
          </Box>
        );
      });
  };

  const sectionLabel = (text: string) => (
    <Typography
      sx={{
        color: c.textFaint,
        fontWeight: 600,
        fontSize: "11.5px",
        px: 2,
        mb: 0.5,
        display: "block",
        letterSpacing: "0.01em",
      }}
    >
      {text}
    </Typography>
  );

  /* ---------------- render ---------------- */

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: c.bg,
        fontFamily: FONT_SANS,
        color: c.textMain,
        "@media (prefers-reduced-motion: no-preference)": {
          "& .tree-row, & button": { transition: "background-color 120ms ease" },
        },
      }}
    >
      {/* ============================ Sidebar ============================ */}
      <Box
        component="nav"
        sx={{
          width: 264,
          flexShrink: 0,
          bgcolor: c.sidebarBg,
          borderRight: `1px solid ${c.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1.2,
            height: 44,
            px: 1.25,
            mx: 0.75,
            mt: 1,
            borderRadius: "8px",
            cursor: "pointer",
            "&:hover": { bgcolor: c.hover },
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              bgcolor: avatarColor,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 12.5,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </Box>
          <Typography
            noWrap
            sx={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.1px" }}
          >
            {workspaceName}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 1,
            height: 30,
            px: 1.25,
            mx: 0.75,
            mt: 1,
            mb: 1.5,
            borderRadius: "6px",
            color: c.textMuted,
            "&:hover": { bgcolor: c.hover },
            "&:focus-within": { bgcolor: c.hover },
          }}
        >
          <Search size={14} />
          <InputBase
            placeholder="Find a page"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            sx={{ fontSize: "13.5px", color: c.textMain, flexGrow: 1 }}
          />
          {sidebarQuery && (
            <IconButton
              size="small"
              aria-label="Clear"
              onClick={() => setSidebarQuery("")}
              sx={{ p: 0.2, color: c.textFaint }}
            >
              <X size={13} />
            </IconButton>
          )}
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: "auto", pb: 2 }}>
          {sectionLabel("Shared")}
          {treeData?.shared?.length ? (
            renderTreeNodes(treeData.shared)
          ) : (
            <Skeleton
              variant="rounded"
              height={22}
              sx={{ mx: 2, mb: 0.75, bgcolor: c.hover }}
            />
          )}

          <Box sx={{ mt: 2.5 }}>
            {sectionLabel("Private")}
            {treeData?.private?.length ? (
              renderTreeNodes(treeData.private)
            ) : (
              <Typography sx={{ px: 2, fontSize: "12.5px", color: c.textFaint }}>
                Nothing here yet
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ borderColor: c.border }} />
        <Button
          fullWidth
          startIcon={<Plus size={15} />}
          onClick={() => openCreateDialog(undefined)}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            color: c.textMuted,
            fontSize: "13.5px",
            fontWeight: 500,
            py: 1.25,
            px: 2,
            borderRadius: 0,
            "&:hover": { bgcolor: c.hover, color: c.textMain },
          }}
        >
          New page
        </Button>
      </Box>

      {/* ========================= Main column ========================= */}
      <Box
        onScroll={(e) => setScrolled((e.target as HTMLElement).scrollTop > 4)}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}
      >
        {/* Topbar */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            height: 45,
            px: { xs: 2, md: 3 },
            position: "sticky",
            top: 0,
            zIndex: 3,
            bgcolor: c.bg,
            borderBottom: `1px solid ${scrolled ? c.border : "transparent"}`,
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: "center", gap: 0.75, color: c.textMuted, minWidth: 0 }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: "13px",
                px: 0.5,
                borderRadius: "4px",
                cursor: "pointer",
                "&:hover": { bgcolor: c.hover, color: c.textMain },
              }}
            >
              {workspaceName}
            </Typography>
            <Typography sx={{ color: c.textFaint, fontSize: "13px" }}>/</Typography>
            {editable ? (
              <InputBase
                value={selectedPageTitle}
                onChange={(e) => setSelectedPageTitle(e.target.value)}
                onBlur={(e) => handleRenamePage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                  if (e.key === "Escape") {
                    setSelectedPageTitle(activePage?.title || "Untitled");
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                sx={{
                  color: c.textMain,
                  fontSize: "13px",
                  fontWeight: 500,
                  minWidth: 60,
                  px: 0.5,
                  borderRadius: "4px",
                  "&:hover, &.Mui-focused": { bgcolor: c.hover },
                }}
              />
            ) : (
              <Typography
                noWrap
                sx={{ color: c.textMain, fontSize: "13px", fontWeight: 500 }}
              >
                {selectedPageTitle}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center", gap: 0.25 }}>
            <Button
              startIcon={<Share2 size={14} />}
              onClick={handleShareClick}
              sx={{
                color: c.textMuted,
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 500,
                minWidth: 0,
                px: 1.25,
                borderRadius: "6px",
                "&:hover": { bgcolor: c.hover, color: c.textMain },
              }}
            >
              Share
            </Button>
            <IconButton
              size="small"
              aria-label="More actions"
              onClick={(e) => setPageMenuAnchor(e.currentTarget)}
              sx={{ color: c.textMuted, borderRadius: "6px", "&:hover": { bgcolor: c.hover } }}
            >
              <MoreHorizontal size={18} />
            </IconButton>
          </Stack>
        </Stack>

        <Menu
          anchorEl={pageMenuAnchor}
          open={!!pageMenuAnchor}
          onClose={() => setPageMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              minWidth: 210,
              borderRadius: "10px",
              border: `1px solid ${c.border}`,
              boxShadow: "0 10px 30px rgba(15, 15, 15, 0.12)",
              "& .MuiMenuItem-root": { fontSize: "13.5px", gap: 1.25, py: 0.9 },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setPageMenuAnchor(null);
              openCreateDialog(selectedPageId || undefined);
            }}
            disabled={!editable}
          >
            <Plus size={15} /> Add a page inside
          </MenuItem>
          <MenuItem
            onClick={() => {
              setPageMenuAnchor(null);
              setUploadOpen(true);
            }}
            disabled={!editable || activePage?.pageType !== "SHEET"}
          >
            <TableIcon size={15} /> Paste leads
          </MenuItem>
          <Divider sx={{ borderColor: c.border }} />
          <MenuItem
            onClick={() => {
              setPageMenuAnchor(null);
              setClearOpen(true);
            }}
            disabled={!editable || !rowsData.length}
            sx={{ color: c.danger }}
          >
            <Trash2 size={15} /> Remove all rows
          </MenuItem>
        </Menu>

        {/* Page body */}
        <Box
          sx={{
            px: { xs: 3, md: 8, lg: 12 },
            pt: 5,
            pb: 10,
            width: "100%",
            maxWidth: 1180,
            mx: "auto",
          }}
        >
          {/* Title block */}
          <Box className="title-block" sx={{ mb: 3 }}>
            {editable && (
              <Button
                size="small"
                startIcon={<Smile size={14} />}
                sx={{
                  ml: -1,
                  mb: 0.5,
                  color: c.textFaint,
                  textTransform: "none",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  borderRadius: "6px",
                  opacity: 0,
                  ".title-block:hover &": { opacity: 1 },
                  "&:focus-visible": { opacity: 1 },
                  "&:hover": { bgcolor: c.hover, color: c.textMuted },
                }}
              >
                Add icon
              </Button>
            )}

            <InputBase
              value={selectedPageTitle}
              onChange={(e) => setSelectedPageTitle(e.target.value)}
              onBlur={() => {
                if (selectedPageId && !selectedPageId.startsWith("user_")) {
                  updatePageTitle(selectedPageId, selectedPageTitle.trim() || "Untitled");
                }
              }}
              placeholder="Untitled"
              readOnly={!editable}
              sx={{
                width: "100%",
                fontFamily: FONT_SERIF,
                fontWeight: 700,
                fontSize: { xs: "30px", md: "40px" },
                lineHeight: 1.15,
                letterSpacing: "-0.6px",
                color: c.textMain,
                "& input": { p: 0 },
                "& input::placeholder": { color: "rgba(55,53,47,0.16)", opacity: 1 },
              }}
            />

            {/* Page meta */}
            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 2, mt: 1.5, color: c.textMuted }}
            >
              <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                <TableIcon size={14} />
                <Typography sx={{ fontSize: "13px" }}>
                  {rowsData.length
                    ? `${rowsData.length} ${rowsData.length === 1 ? "lead" : "leads"}`
                    : "No leads"}
                </Typography>
              </Stack>
              {pageColumns.length > 0 && (
                <Typography sx={{ fontSize: "13px" }}>
                  {pageColumns.length}{" "}
                  {pageColumns.length === 1 ? "column" : "columns"}
                </Typography>
              )}
            </Stack>

            {/* Actions */}
            {editable && (
              <Stack
                direction="row"
                sx={{
                  gap: 1,
                  flexWrap: "wrap",
                  mt: 2.5,
                  pb: 2.5,
                  borderBottom: `1px solid ${c.border}`,
                }}
              >
                <Button
                  size="small"
                  startIcon={<Plus size={15} />}
                  onClick={() => openCreateDialog(selectedPageId || undefined)}
                  sx={outlineBtn}
                >
                  Add a page inside
                </Button>
                {activePage?.pageType === "SHEET" && (
                  <>
                    <Button
                      size="small"
                      startIcon={<TableIcon size={15} />}
                      onClick={() => setUploadOpen(true)}
                      sx={outlineBtn}
                    >
                      Paste leads
                    </Button>
                    {rowsData.length > 0 && (
                      <Button
                        size="small"
                        startIcon={<Trash2 size={15} />}
                        onClick={() => setClearOpen(true)}
                        sx={{
                          ...outlineBtn,
                          color: c.danger,
                          "&:hover": {
                            bgcolor: c.dangerSoft,
                            borderColor: "rgba(213,73,63,0.4)",
                          },
                        }}
                      >
                        Remove all rows
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            )}
          </Box>

          {/* Sheet */}
          {activePage?.pageType === "SHEET" &&
            (loadingPage ? (
              <Stack sx={{ gap: 1 }}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={36}
                    sx={{ bgcolor: c.hover }}
                  />
                ))}
              </Stack>
            ) : rowsData.length > 0 && pageColumns.length > 0 ? (
              <Box>
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                    px: 1.25,
                    height: 34,
                    border: `1px solid ${c.border}`,
                    borderRadius: "8px",
                    bgcolor: c.sidebarBg,
                    "&:focus-within": {
                      borderColor: c.accent,
                      boxShadow: `0 0 0 3px ${c.accentSoft}`,
                    },
                  }}
                >
                  <Search size={15} color={c.textFaint} />
                  <InputBase
                    placeholder="Search leads"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, fontSize: "13.5px", color: c.textMain }}
                  />
                  {searchQuery && (
                    <>
                      <Typography sx={{ fontSize: "12px", color: c.textMuted }}>
                        {filteredRows.length} of {rowsData.length}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="Clear search"
                        onClick={() => setSearchQuery("")}
                        sx={{ p: 0.3, color: c.textFaint }}
                      >
                        <X size={14} />
                      </IconButton>
                    </>
                  )}
                </Stack>

                <TableContainer
                  sx={{
                    border: `1px solid ${c.border}`,
                    borderRadius: "10px",
                    maxHeight: "62vh",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...headCell, width: 44, textAlign: "right", pr: 1.5 }}>
                          #
                        </TableCell>
                        {pageColumns.map((col: any) => (
                          <TableCell key={col.key} sx={headCell}>
                            {col.name}
                          </TableCell>
                        ))}
                        <TableCell
                          sx={{ ...headCell, width: 92, textAlign: "center" }}
                        >
                          Feedback
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map(({ row, i }) => {
                        const count = parseFeedback(row.feedback_notes).length;
                        return (
                          <TableRow
                            key={row.id || i}
                            sx={{
                              "&:hover": { bgcolor: c.hover },
                              "&:last-child td": { borderBottom: 0 },
                            }}
                          >
                            <TableCell
                              sx={{
                                ...bodyCell,
                                color: c.textFaint,
                                fontFamily: FONT_MONO,
                                fontSize: "12px",
                                textAlign: "right",
                                pr: 1.5,
                              }}
                            >
                              {i + 1}
                            </TableCell>

                            {pageColumns.map((col: any) => {
                              const val = row[col.key];
                              return (
                                <TableCell key={col.key} sx={bodyCell}>
                                  {val ? (
                                    String(val)
                                  ) : (
                                    <Box component="span" sx={{ color: c.textFaint }}>
                                      —
                                    </Box>
                                  )}
                                </TableCell>
                              );
                            })}

                            <TableCell sx={{ ...bodyCell, textAlign: "center", py: 0.4 }}>
                              <Tooltip
                                title={
                                  count
                                    ? `${count} ${count === 1 ? "note" : "notes"} — open`
                                    : "Add feedback"
                                }
                                placement="left"
                                arrow
                              >
                                <Button
                                  size="small"
                                  onClick={() => openFeedback(i)}
                                  startIcon={<MessageSquare size={14} />}
                                  sx={{
                                    minWidth: 0,
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: "6px",
                                    textTransform: "none",
                                    fontSize: "12.5px",
                                    fontWeight: 600,
                                    color: count ? c.accent : c.textFaint,
                                    bgcolor: count ? c.accentSoft : "transparent",
                                    "& .MuiButton-startIcon": { mr: count ? 0.5 : 0 },
                                    "&:hover": {
                                      bgcolor: c.accentSoft,
                                      color: c.accent,
                                    },
                                  }}
                                >
                                  {count || ""}
                                </Button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}

                      {filteredRows.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={pageColumns.length + 2}
                            sx={{ ...bodyCell, textAlign: "center", py: 5, color: c.textMuted }}
                          >
                            <Typography sx={{ fontSize: "13.5px" }}>
                              Nothing matches “{searchQuery}”.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography
                  sx={{ mt: 1.25, fontSize: "12.5px", color: c.textFaint, px: 0.5 }}
                >
                  {filteredRows.length}{" "}
                  {filteredRows.length === 1 ? "row" : "rows"}
                  {searchQuery ? ` of ${rowsData.length}` : ""}
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  gap: 1,
                  py: 8,
                  px: 3,
                  border: `1px dashed ${c.borderStrong}`,
                  borderRadius: "12px",
                  bgcolor: c.sidebarBg,
                  textAlign: "center",
                }}
              >
                <Inbox size={26} color={c.textFaint} />
                <Typography sx={{ fontSize: "14.5px", fontWeight: 600 }}>
                  This sheet is empty
                </Typography>
                <Typography
                  sx={{ fontSize: "13.5px", color: c.textMuted, maxWidth: 380 }}
                >
                  Copy rows straight from Excel or Google Sheets and paste them
                  here. The first row becomes your column names.
                </Typography>
                {editable && (
                  <Button
                    variant="contained"
                    disableElevation
                    startIcon={<TableIcon size={15} />}
                    onClick={() => setUploadOpen(true)}
                    sx={{ ...primaryBtn, mt: 1 }}
                  >
                    Paste leads
                  </Button>
                )}
              </Box>
            ))}

          {/* Child pages */}
          {activePage?.children?.length > 0 && (
            <Box sx={{ mt: 5 }}>
              <Typography
                sx={{ fontSize: "12.5px", color: c.textFaint, fontWeight: 600, mb: 0.75 }}
              >
                Pages inside
              </Typography>
              {activePage.children.map((child: any) => (
                <Stack
                  key={child._id || child.id}
                  direction="row"
                  onClick={() => handleSelectPage(child)}
                  sx={{
                    alignItems: "center",
                    gap: 1.25,
                    py: 1,
                    px: 1,
                    mx: -1,
                    borderRadius: "6px",
                    cursor: "pointer",
                    "&:hover": { bgcolor: c.hover },
                  }}
                >
                  {child.pageType === "SHEET" ? (
                    <TableIcon size={16} color={c.textMuted} />
                  ) : (
                    <FileText size={16} color={c.textMuted} />
                  )}
                  <Typography
                    sx={{
                      fontSize: "14.5px",
                      fontWeight: 500,
                      borderBottom: `1px solid ${c.border}`,
                    }}
                  >
                    {child.title}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* ========================= Create page ========================= */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: dialogPaper(420) }}
      >
        <DialogTitle sx={dialogTitle}>New page</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          <Typography sx={{ fontSize: "13.5px", color: c.textMuted, mb: 1.5 }}>
            {createParentId
              ? "This page will live inside the page you selected."
              : "This page will be added to your shared workspace."}
          </Typography>
          <TextField
            fullWidth
            autoFocus
            placeholder="Untitled"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !creating) handleCreatePage();
            }}
            sx={textFieldSx}
          />
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button onClick={() => setCreateOpen(false)} sx={ghostBtn}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleCreatePage}
            disabled={creating}
            startIcon={creating ? <CircularProgress size={14} color="inherit" /> : null}
            sx={primaryBtn}
          >
            Create page
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= Paste leads ========================= */}
      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        PaperProps={{ sx: dialogPaper(560) }}
      >
        <DialogTitle sx={dialogTitle}>Paste leads</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          <Typography sx={{ fontSize: "13.5px", color: c.textMuted, mb: 1.75 }}>
            Copy a block of cells from Excel or Google Sheets and paste it below.
            Tabs and commas both work as separators.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            autoFocus
            placeholder={"ID\tPhone\tName\tPAN\tCity\n1042\t9876543210\tAsha Rao\tABCDE1234F\tNoida"}
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            sx={{
              ...textFieldSx,
              "& .MuiOutlinedInput-root": {
                ...(textFieldSx["& .MuiOutlinedInput-root"] as object),
                fontFamily: FONT_MONO,
                fontSize: "12.5px",
                lineHeight: 1.7,
                bgcolor: c.sidebarBg,
              },
            }}
          />
          <FormControlLabel
            sx={{ mt: 1.25, ml: 0 }}
            control={
              <Checkbox
                size="small"
                checked={replaceData}
                onChange={(e) => setReplaceData(e.target.checked)}
                sx={{ color: c.borderStrong, "&.Mui-checked": { color: c.accent } }}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontSize: "13.5px", fontWeight: 500 }}>
                  Replace what’s already here
                </Typography>
                <Typography sx={{ fontSize: "12.5px", color: c.textMuted }}>
                  Existing rows and columns are removed first. Feedback on those
                  rows goes with them.
                </Typography>
              </Box>
            }
          />
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button onClick={() => setUploadOpen(false)} sx={ghostBtn}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleUpload}
            disabled={!pastedData.trim() || uploading}
            startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : null}
            sx={primaryBtn}
          >
            {replaceData ? "Replace leads" : "Add leads"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================== Remove all rows ======================= */}
      <Dialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        PaperProps={{ sx: dialogPaper(420) }}
      >
        <DialogTitle sx={dialogTitle}>Remove all rows?</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          <Typography sx={{ fontSize: "13.5px", color: c.textMuted }}>
            This clears all {rowsData.length} rows and their columns from{" "}
            <Box component="span" sx={{ color: c.textMain, fontWeight: 600 }}>
              {selectedPageTitle}
            </Box>
            , including any feedback saved on them. It can’t be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button onClick={() => setClearOpen(false)} sx={ghostBtn}>
            Keep them
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleClearData}
            disabled={clearing}
            startIcon={clearing ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{
              ...primaryBtn,
              bgcolor: c.danger,
              "&:hover": { bgcolor: "#b93c33" },
            }}
          >
            Remove all rows
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================== Feedback =========================== */}
      <Dialog
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        PaperProps={{ sx: dialogPaper(500) }}
      >
        <DialogTitle
          sx={{
            ...dialogTitle,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            Feedback
            <Typography
              noWrap
              sx={{ fontSize: "13px", fontWeight: 400, color: c.textMuted, mt: 0.25 }}
            >
              {feedbackRowLabel}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Close"
            onClick={() => setFeedbackOpen(false)}
            sx={{ color: c.textMuted, mt: -0.5, "&:hover": { bgcolor: c.hover } }}
          >
            <X size={16} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* History */}
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.75 }}
            >
              <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: c.textMuted }}>
                History
              </Typography>
              {activeFeedback.length > 1 && (
                <Typography sx={{ fontSize: "12px", color: c.textFaint }}>
                  Newest first
                </Typography>
              )}
            </Stack>

            <Box
              ref={historyRef}
              sx={{
                border: `1px solid ${c.border}`,
                borderRadius: "10px",
                bgcolor: c.sidebarBg,
                maxHeight: 190,
                minHeight: 110,
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 8 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: c.borderStrong,
                  borderRadius: 4,
                  border: "2px solid transparent",
                  backgroundClip: "content-box",
                },
              }}
            >
              {activeFeedback.length === 0 ? (
                <Stack
                  sx={{
                    minHeight: 110,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                    color: c.textMuted,
                    px: 3,
                    textAlign: "center",
                  }}
                >
                  <Clock size={18} color={c.textFaint} />
                  <Typography sx={{ fontSize: "13px" }}>
                    No feedback on this row yet
                  </Typography>
                </Stack>
              ) : (
                [...activeFeedback].reverse().map((entry, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      px: 1.75,
                      py: 1.25,
                      borderBottom: idx === activeFeedback.length - 1 ? 0 : `1px solid ${c.border}`,
                    }}
                  >
                    {entry.time && (
                      <Typography
                        sx={{
                          fontSize: "11.5px",
                          color: c.textFaint,
                          fontFamily: FONT_MONO,
                          mb: 0.4,
                        }}
                      >
                        {entry.time}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: "13.5px",
                        lineHeight: 1.55,
                        color: c.textMain,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {entry.text}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* New note */}
          <Box>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 0.75 }}
            >
              <Typography sx={{ fontSize: "12.5px", fontWeight: 600, color: c.textMuted }}>
                Add a note
              </Typography>
              <Typography
                sx={{
                  fontSize: "11.5px",
                  color: newRowRemark.length > 450 ? c.danger : c.textFaint,
                  fontFamily: FONT_MONO,
                }}
              >
                {newRowRemark.length}/500
              </Typography>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={3}
              autoFocus
              inputProps={{ maxLength: 500 }}
              placeholder="What happened on this lead?"
              value={newRowRemark}
              onChange={(e) => setNewRowRemark(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSaveFeedback();
              }}
              sx={textFieldSx}
            />
            <Typography sx={{ mt: 0.75, fontSize: "11.5px", color: c.textFaint }}>
              Notes are timestamped and kept — they never overwrite earlier ones.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={dialogActions}>
          <Button onClick={() => setFeedbackOpen(false)} sx={ghostBtn}>
            Close
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSaveFeedback}
            disabled={!newRowRemark.trim() || savingFeedback}
            startIcon={savingFeedback ? <CircularProgress size={14} color="inherit" /> : null}
            sx={primaryBtn}
          >
            Add note
          </Button>
        </DialogActions>
      </Dialog>

      {/* =========================== Toast ============================ */}
      <Snackbar
        open={!!toast}
        autoHideDuration={3200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast?.severity || "success"}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{
            borderRadius: "8px",
            fontSize: "13.5px",
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(15,15,15,0.2)",
            ...(toast?.severity === "success" && { bgcolor: c.textMain }),
          }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ------------------------------------------------------------------ *
 * Shared style objects
 * ------------------------------------------------------------------ */

const outlineBtn = {
  textTransform: "none",
  fontSize: "13px",
  fontWeight: 500,
  color: c.textMain,
  border: `1px solid ${c.border}`,
  borderRadius: "7px",
  px: 1.5,
  py: 0.6,
  "&:hover": { bgcolor: c.hover, borderColor: c.borderStrong },
} as const;

const primaryBtn = {
  textTransform: "none",
  fontSize: "13.5px",
  fontWeight: 600,
  bgcolor: c.accent,
  color: "#fff",
  borderRadius: "8px",
  px: 2.25,
  py: 0.7,
  boxShadow: "none",
  "&:hover": { bgcolor: c.accentHover, boxShadow: "none" },
  "&.Mui-disabled": { bgcolor: "rgba(35,131,226,0.35)", color: "#fff" },
} as const;

const ghostBtn = {
  textTransform: "none",
  fontSize: "13.5px",
  fontWeight: 500,
  color: c.textMuted,
  borderRadius: "8px",
  px: 1.75,
  "&:hover": { bgcolor: c.hover, color: c.textMain },
} as const;

const dialogPaper = (minWidth: number) =>
  ({
    bgcolor: c.bg,
    width: "100%",
    maxWidth: minWidth,
    borderRadius: "14px",
    border: `1px solid ${c.border}`,
    boxShadow: "0 16px 48px rgba(15, 15, 15, 0.16)",
  } as const);

const dialogTitle = {
  fontFamily: FONT_SANS,
  fontWeight: 600,
  fontSize: "16.5px",
  color: c.textMain,
  px: 3,
  pt: 2.5,
  pb: 0.5,
} as const;

const dialogActions = { px: 3, pb: 2.5, pt: 1.5, gap: 0.5 } as const;

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: "13.5px",
    borderRadius: "9px",
    bgcolor: c.bg,
    "& fieldset": { borderColor: c.border },
    "&:hover fieldset": { borderColor: c.borderStrong },
    "&.Mui-focused fieldset": {
      borderColor: c.accent,
      borderWidth: "1px",
      boxShadow: `0 0 0 3px ${c.accentSoft}`,
    },
  },
} as const;

const headCell = {
  color: c.textMuted,
  fontWeight: 600,
  fontSize: "12.5px",
  py: 1.15,
  bgcolor: c.sidebarBg,
  borderBottom: `1px solid ${c.border}`,
  whiteSpace: "nowrap",
} as const;

const bodyCell = {
  color: c.textMain,
  fontSize: "13.5px",
  py: 0.9,
  borderBottom: `1px solid ${c.border}`,
  maxWidth: 260,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;