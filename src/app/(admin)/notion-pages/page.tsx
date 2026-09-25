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
  UserPlus,
  X,
} from "lucide-react";
import useNotionPages, { NotionPageItem } from "@/hooks/useNotionPages";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import NotionPageView from "@/components/notion/NotionPageView";
import TrashDialog from "@/components/notion/dialogs/TrashDialog";

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
    deletePage,
    assignPage,
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

  // Delete page
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Trash
  const [trashOpen, setTrashOpen] = useState(false);

  // Assign page
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");

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
        setLoadingPage(true);
        fetchPageDetails(queryPageId).then((page: any) => {
          if (page?.title) setSelectedPageTitle(page.title);
        }).finally(() => setLoadingPage(false));
      } else if (treeData?.shared?.length) {
        const first = treeData.shared[0];
        const id = first._id || first.id;
        if (id) {
          setSelectedPageId(id);
          setSelectedPageTitle(first.title);
          setLoadingPage(true);
          fetchPageDetails(id).finally(() => setLoadingPage(false));
        }
      }
    }
  }, [treeData, selectedPageId, fetchPageDetails]);

  useEffect(() => {
    if (!activePage) return;
    setRowsData(Array.isArray(activePage.rows) ? activePage.rows : []);
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
  const r = role?.toUpperCase();
  const canUploadData = editable;
  const canCreatePage = true;

  const isSyntheticNode = useMemo(() => {
    const isTeam = treeData?.shared?.some(t => t.id === selectedPageId || t._id === selectedPageId);
    const isUser = selectedPageId?.startsWith("user_");
    return isTeam || isUser;
  }, [treeData, selectedPageId]);

  const findPath = useCallback((
    nodes: NotionPageItem[],
    targetId: string,
    currentPath: NotionPageItem[] = []
  ): NotionPageItem[] | null => {
    if (!nodes) return null;
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === targetId || node._id === targetId) return newPath;
      if (node.children && node.children.length > 0) {
        const found = findPath(node.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const breadcrumbs = useMemo(() => {
    if (!selectedPageId) return [];
    const allRoots = [...(treeData?.shared || []), ...(treeData?.private || [])];
    return findPath(allRoots, selectedPageId) || [];
  }, [treeData, selectedPageId, findPath]);

  /* ---------------- actions ---------------- */

  const assignableUsers = useMemo(() => {
    const users: { id: string; name: string }[] = [];
    treeData?.shared?.forEach(team => {
      team.children?.forEach(child => {
        if (child.id?.startsWith("user_")) {
          users.push({ id: child.id.replace("user_", ""), name: child.title });
        }
      });
    });
    return users;
  }, [treeData]);

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

  const handleSaveRemark = async (rowIndex: number, value: string) => {
    if (!activePage || !selectedPageId) return;
    const remark = value.trim();
    
    const updatedRows = [...activePage.rows];
    const row = { ...updatedRows[rowIndex] };
    
    if (row.feedback_notes === remark) return;

    row.feedback_notes = remark;
    updatedRows[rowIndex] = row;

    try {
      setActivePage({ ...activePage, rows: updatedRows });
      await api.patch(`/notion-pages/${selectedPageId}`, {
        rows: updatedRows,
      });
      notify("Remark saved");
    } catch (e) {
      console.error(e);
      notify("Couldn’t save the remark.", "error");
      await fetchPageDetails(selectedPageId);
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

              {canCreatePage && canEdit(nodeKey) && (
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
        {user?.role && ["SUPER_ADMIN", "ADMIN"].includes(user.role) && (
          <Button
            fullWidth
            startIcon={<Trash2 size={15} />}
            onClick={() => setTrashOpen(true)}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              color: c.textMuted,
              fontSize: "13.5px",
              fontWeight: 500,
              py: 1.25,
              px: 2,
              borderRadius: 0,
              borderTop: `1px solid ${c.border}`,
              "&:hover": { bgcolor: c.hover, color: c.textMain },
            }}
          >
            Trash
          </Button>
        )}
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
            sx={{ alignItems: "center", gap: 0.75, color: c.textMuted, minWidth: 0, overflow: "hidden" }}
          >
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id || crumb._id}>
                  {idx > 0 && <Typography sx={{ color: c.textFaint, fontSize: "13px" }}>/</Typography>}
                  {idx === breadcrumbs.length - 1 && editable ? (
                    <InputBase
                      value={selectedPageTitle}
                      onChange={(e) => setSelectedPageTitle(e.target.value)}
                      onBlur={(e) => handleRenamePage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") {
                          setSelectedPageTitle(activePage?.title || crumb.title);
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
                      onClick={() => {
                        if (idx !== breadcrumbs.length - 1) {
                          const node = breadcrumbs[idx];
                          const id = node.id || node._id;
                          if (id) {
                            setSelectedPageTitle(node.title);
                            setSelectedPageId(id);
                            setSearchQuery("");
                            setLoadingPage(true);
                            fetchPageDetails(id).finally(() => setLoadingPage(false));
                          }
                        }
                      }}
                      sx={{
                        fontSize: "13px",
                        fontWeight: idx === breadcrumbs.length - 1 ? 500 : 400,
                        color: idx === breadcrumbs.length - 1 ? c.textMain : c.textMuted,
                        px: 0.5,
                        borderRadius: "4px",
                        cursor: idx === breadcrumbs.length - 1 ? "default" : "pointer",
                        "&:hover": idx === breadcrumbs.length - 1 ? {} : { bgcolor: c.hover, color: c.textMain },
                        maxWidth: "150px",
                      }}
                    >
                      {idx === breadcrumbs.length - 1 ? selectedPageTitle : crumb.title}
                    </Typography>
                  )}
                </React.Fragment>
              ))
            ) : (
              <>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "13px",
                    px: 0.5,
                    borderRadius: "4px",
                    color: c.textMuted,
                  }}
                >
                  {workspaceName}
                </Typography>
                <Typography sx={{ color: c.textFaint, fontSize: "13px" }}>/</Typography>
                <Typography noWrap sx={{ color: c.textMain, fontSize: "13px", fontWeight: 500 }}>
                  {selectedPageTitle}
                </Typography>
              </>
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
          slotProps={{
            paper: {
              sx: {
                minWidth: 210,
                borderRadius: "10px",
                border: `1px solid ${c.border}`,
                boxShadow: "0 10px 30px rgba(15, 15, 15, 0.12)",
                "& .MuiMenuItem-root": { fontSize: "13.5px", gap: 1.25, py: 0.9 },
              },
            }
          }}
        >
          {canCreatePage && (
            <MenuItem
              onClick={() => {
                setPageMenuAnchor(null);
                openCreateDialog(selectedPageId || undefined);
              }}
              disabled={!editable}
            >
              <Plus size={15} /> Add a page inside
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setPageMenuAnchor(null);
              setUploadOpen(true);
            }}
            disabled={!editable || !canUploadData || activePage?.pageType !== "SHEET"}
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

          {!isSyntheticNode && (r === "MANAGER" || r === "TEAM_LEADER" || r === "SUPER_ADMIN" || r === "ADMIN") && (
            <MenuItem
              onClick={() => {
                setPageMenuAnchor(null);
                setAssignOpen(true);
              }}
              disabled={!editable}
            >
              <UserPlus size={15} /> Assign page
            </MenuItem>
          )}

          {!isSyntheticNode && (r === "SUPER_ADMIN" || r === "ADMIN") && (
            <MenuItem
              onClick={() => {
                setPageMenuAnchor(null);
                setDeleteOpen(true);
              }}
              sx={{ color: c.danger }}
            >
              <Trash2 size={15} /> Delete page
            </MenuItem>
          )}
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
          {loadingPage || deleting ? (
            <Stack sx={{ alignItems: "center", justifyContent: "center", height: "40vh" }}>
              <CircularProgress size={32} sx={{ color: c.textMuted }} />
            </Stack>
          ) : !selectedPageId ? (
            <Stack sx={{ alignItems: "center", justifyContent: "center", height: "40vh" }}>
              <FileText size={48} color={c.borderStrong} />
              <Typography sx={{ mt: 2, color: c.textMuted, fontWeight: 500 }}>No page selected</Typography>
            </Stack>
          ) : (
            <>
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
                {canCreatePage && (
                  <Button
                    size="small"
                    startIcon={<Plus size={15} />}
                    onClick={() => openCreateDialog(selectedPageId || undefined)}
                    sx={outlineBtn}
                  >
                    Add a page inside
                  </Button>
                )}
                {activePage?.pageType === "SHEET" && (
                  <>
                    {canUploadData && (
                      <Button
                        size="small"
                        startIcon={<TableIcon size={15} />}
                        onClick={() => setUploadOpen(true)}
                        sx={outlineBtn}
                      >
                        Paste leads
                      </Button>
                    )}
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
                          sx={{ ...headCell, minWidth: 200, textAlign: "left" }}
                        >
                          Remarks
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map(({ row, i }) => {
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

                            <TableCell sx={{ ...bodyCell, textAlign: "left", py: 0.4 }}>
                              <InputBase
                                defaultValue={row.feedback_notes || ""}
                                onBlur={(e) => handleSaveRemark(i, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                placeholder="Add remark..."
                                sx={{
                                  fontSize: "13px",
                                  color: c.textMain,
                                  width: "100%",
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: "4px",
                                  border: "1px solid transparent",
                                  "&:hover, &.Mui-focused": {
                                    border: `1px solid ${c.border}`,
                                    bgcolor: c.sidebarBg,
                                  },
                                }}
                              />
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
                {editable && canUploadData && (
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
            </>
          )}
        </Box>
      </Box>

      {/* ========================= Create page ========================= */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        slotProps={{ paper: { sx: dialogPaper(420) } }}
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
        slotProps={{ paper: { sx: dialogPaper(560) } }}
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
        slotProps={{ paper: { sx: dialogPaper(420) } }}
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



      {/* ========================= Delete confirm ========================= */}
      <Dialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        slotProps={{ paper: { sx: dialogPaper(420) } }}
      >
        <DialogTitle sx={dialogTitle}>Delete this page?</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          <Typography variant="body2" sx={{ color: c.textMuted }}>
            This will permanently delete the page and all of its contents. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button onClick={() => setDeleteOpen(false)} sx={ghostBtn}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!selectedPageId) return;
              setDeleting(true);
              try {
                await deletePage(selectedPageId);
                notify("Page deleted successfully", "success");
                setDeleteOpen(false);
              } catch (e: any) {
                notify(e?.message || "Failed to delete page", "error");
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
            sx={{
              ...primaryBtn,
              bgcolor: c.danger,
              "&:hover": { bgcolor: "#b93c33" },
            }}
          >
            {deleting ? "Deleting..." : "Delete Page"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================= Assign page ========================= */}
      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        slotProps={{ paper: { sx: dialogPaper(420) } }}
      >
        <DialogTitle sx={dialogTitle}>Assign Page</DialogTitle>
        <DialogContent sx={{ px: 3, pt: 1 }}>
          <Typography variant="body2" sx={{ color: c.textMuted, mb: 2 }}>
            Assign this page to a team member.
          </Typography>
          <TextField
            select
            fullWidth
            label="Select Team Member"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          >
            {assignableUsers.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={dialogActions}>
          <Button onClick={() => setAssignOpen(false)} sx={ghostBtn}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!selectedPageId || !selectedAssignee) return;
              setAssigning(true);
              try {
                await assignPage(selectedPageId, selectedAssignee);
                notify("Page assigned successfully", "success");
                setAssignOpen(false);
                setSelectedAssignee("");
              } catch (e: any) {
                notify(e?.message || "Failed to assign page", "error");
              } finally {
                setAssigning(false);
              }
            }}
            disabled={assigning || !selectedAssignee}
            sx={{ ...primaryBtn, bgcolor: c.accent, "&:hover": { bgcolor: c.accentHover } }}
          >
            {assigning ? "Assigning..." : "Assign"}
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

      <TrashDialog open={trashOpen} onClose={() => setTrashOpen(false)} />
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