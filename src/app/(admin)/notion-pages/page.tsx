"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Tooltip,
  Fade,
  Chip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  MoreHorizontal,
  Search,
  Table as TableIcon,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import useNotionPages, { NotionPageItem } from "@/hooks/useNotionPages";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";

// Refined palette — closer to real Notion, but with a touch more warmth & contrast
const c = {
  bg: "#ffffff",
  sidebarBg: "#fbfbfa",
  sidebarHover: "rgba(55, 53, 47, 0.06)",
  sidebarActive: "rgba(35, 131, 226, 0.09)",
  textMain: "#37352f",
  textMuted: "rgba(55, 53, 47, 0.55)",
  textFaint: "rgba(55, 53, 47, 0.38)",
  border: "rgba(55, 53, 47, 0.11)",
  borderStrong: "rgba(55, 53, 47, 0.16)",
  accent: "#2383e2",
  accentSoft: "rgba(35, 131, 226, 0.10)",
  accentHover: "#1b6bbd",
};

const AVATAR_COLORS = ["#eb5757", "#e08840", "#2383e2", "#9b6bd6", "#0f9d8c"];

function hashColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function NotionPagesClientPage() {
  const {
    treeData,
    activePage,
    fetchTree,
    fetchPageDetails,
    createPage,
    addRecord,
    updatePageTitle,
    setActivePage,
  } = useNotionPages();

  const [selectedPageTitle, setSelectedPageTitle] = useState<string>("Untitled");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [rowsData, setRowsData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, role } = useAuth();
  const currentUser = user;

  // Modals
  const [uploadDataModalOpen, setUploadDataModalOpen] = useState(false);
  const [pastedData, setPastedData] = useState("");
  const [replaceData, setReplaceData] = useState(false);

  useEffect(() => {
    // Current user is provided by useAuth
  }, []);

  useEffect(() => {
    if (treeData?.shared && treeData.shared.length > 0 && !selectedPageId) {
      const firstRoot = treeData.shared[0];
      const targetId = firstRoot._id || firstRoot.id;
      if (targetId) {
        setSelectedPageId(targetId);
        setSelectedPageTitle(firstRoot.title);
        fetchPageDetails(targetId);
      }
    }
  }, [treeData, selectedPageId, fetchPageDetails]);

  useEffect(() => {
    if (activePage) {
      if (activePage.rows && Array.isArray(activePage.rows)) {
        setRowsData(activePage.rows);
      }
      if (activePage.title) {
        setSelectedPageTitle(activePage.title);
      }
    }
  }, [activePage]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectPage = async (node: NotionPageItem) => {
    const pageId = node._id || node.id;
    setSelectedPageTitle(node.title);
    setSelectedPageId(pageId);
    if (pageId) {
      await fetchPageDetails(pageId);
    }
  };

  const canAddSubPage = (nodeId: string | undefined, pageObj: any = null) => {
    if (!user) return false;
    const userRole = role?.toUpperCase();
    if (["SUPER_ADMIN", "ADMIN"].includes(userRole)) return true;

    if (nodeId?.startsWith("user_")) {
      const targetUserId = nodeId.replace("user_", "");
      if (targetUserId === user.id || targetUserId === user._id) return true;
      if (["MANAGER", "TEAM_LEADER"].includes(userRole)) return true;
      return false;
    }

    if (pageObj?.assignedMemberId) {
      const assignedTo = pageObj.assignedMemberId;
      if (assignedTo === user.id || assignedTo === user._id) return true;
      if (["MANAGER", "TEAM_LEADER"].includes(userRole)) return true;
      return false;
    }

    if (["MANAGER", "TEAM_LEADER"].includes(userRole)) return true;

    return false;
  };

  const handleCreateNewPage = async (parentId?: string) => {
    const pageName = prompt("Enter a name for the new page:", "Untitled");
    if (pageName === null) return;
    
    try {
      const created = await createPage({
        title: pageName || "Untitled",
        pageType: "SHEET",
        section: "SHARED",
        parentId: parentId || undefined,
      });

      const newId = created?._id || created?.id;
      if (newId) {
        setSelectedPageId(newId);
        setSelectedPageTitle(pageName || "Untitled");
        await fetchPageDetails(newId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenamePage = async (newTitle: string) => {
    if (!selectedPageId || newTitle.trim() === "") {
      setSelectedPageTitle(activePage?.title || "");
      return;
    }
    try {
      await api.patch(`/notion-pages/${selectedPageId}`, { title: newTitle.trim() });
      setSelectedPageTitle(newTitle.trim());
      if (activePage) setActivePage({ ...activePage, title: newTitle.trim() });
      const res = await api.get("/notion-pages/tree");
      setTreeData(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to rename page");
    }
  };

  const handleUploadDataToPage = async () => {
    if (!pastedData) return;
    const lines = pastedData.trim().split("\n");
    if (lines.length === 0) return;

    let finalColumns = replaceData ? [] : (activePage?.columns || []);
    let isNewStructure = finalColumns.length === 0;

    let startIndex = 0;
    const firstRowParts =
      lines[0].split("\t").length > 1 ? lines[0].split("\t") : lines[0].split(",");

    if (isNewStructure) {
      finalColumns = firstRowParts.map((header: string, idx: number) => ({
        key: `col_${idx}`,
        name: header.trim() || `Column ${idx + 1}`,
        type: "text",
      }));
      startIndex = 1;
    } else {
      if (firstRowParts[0]?.trim().toLowerCase() === finalColumns[0]?.name?.toLowerCase()) {
        startIndex = 1;
      }
    }

    const newRows = lines.slice(startIndex).map((line: string, rowIndex: number) => {
      const parts = line.split("\t").length > 1 ? line.split("\t") : line.split(",");
      const rowObj: any = { id: `row_${Date.now()}_${rowIndex}` };
      finalColumns.forEach((col: any, idx: number) => {
        rowObj[col.key] = parts[idx]?.trim() || "";
      });
      return rowObj;
    });

    const updatedRows = replaceData ? newRows : [...(activePage?.rows || []), ...newRows];

    try {
      if (selectedPageId) {
        const response = await api.patch(`/notion-pages/${selectedPageId}`, {
          columns: finalColumns,
          rows: updatedRows,
        });

        let updatedDoc = response.data;
        if (response.data?.data !== undefined) updatedDoc = response.data.data;

        setActivePage(updatedDoc);
      }
      setUploadDataModalOpen(false);
      setPastedData("");
    } catch (e: any) {
      console.error(e);
      const errMsg = e?.response?.data
        ? JSON.stringify(e.response.data)
        : e?.message || "Unknown error";
      alert("Error Details: " + errMsg);
    }
  };

  const handleClearData = async () => {
    if (!selectedPageId) return;
    if (!confirm("Are you sure you want to clear all data from this page?")) return;
    try {
      const response = await api.patch(`/notion-pages/${selectedPageId}`, {
        columns: [],
        rows: [],
      });
      let updatedDoc = response.data;
      if (response.data?.data !== undefined) updatedDoc = response.data.data;
      setActivePage(updatedDoc);
    } catch (e: any) {
      console.error(e);
      alert("Failed to clear data");
    }
  };

  const filteredRows = rowsData.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pageColumns = activePage?.columns || [];

  const renderTreeNodes = (nodes: NotionPageItem[], depth = 0) => {
    return nodes.map((node) => {
      const nodeKey = node._id || node.id;
      const isExpanded = expandedNodes[nodeKey] !== false;
      const hasChildren = node.children && node.children.length > 0;
      const isSelected = selectedPageId === nodeKey;

      return (
        <Box key={nodeKey}>
          <Stack
            className="tree-row"
            direction="row"
            spacing={0.25}
            onClick={() => handleSelectPage(node)}
            sx={{
              alignItems: "center",
              py: 0.6,
              pl: 1 + depth * 1.5,
              pr: 1,
              mx: 0.5,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: isSelected ? c.sidebarActive : "transparent",
              color: isSelected ? c.accent : c.textMain,
              transition: "background-color 120ms ease",
              "&:hover": {
                bgcolor: isSelected ? c.sidebarActive : c.sidebarHover,
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => toggleExpand(nodeKey, e)}
              sx={{
                p: 0.2,
                color: c.textFaint,
                visibility: hasChildren ? "visible" : "hidden",
              }}
            >
              {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </IconButton>

            {node.pageType === "SHEET" ? (
              <TableIcon
                size={15}
                style={{ color: isSelected ? c.accent : c.textMuted, marginRight: 6, flexShrink: 0 }}
              />
            ) : (
              <FileText
                size={15}
                style={{ color: isSelected ? c.accent : c.textMuted, marginRight: 6, flexShrink: 0 }}
              />
            )}

            <Typography
              variant="body2"
              sx={{
                fontSize: "13.5px",
                fontWeight: isSelected ? 600 : 500,
                flexGrow: 1,
                letterSpacing: "-0.1px",
              }}
              noWrap
            >
              {node.title}
            </Typography>

            {canAddSubPage(nodeKey) && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNewPage(nodeKey);
                }}
                className="add-child-btn"
                sx={{
                  p: 0.2,
                  color: c.textMuted,
                  opacity: 0,
                  transition: "opacity 120ms ease",
                  ".tree-row:hover &": { opacity: 1 },
                }}
              >
                <Plus size={14} />
              </IconButton>
            )}
          </Stack>

          {hasChildren && isExpanded && <Box>{renderTreeNodes(node.children!, depth + 1)}</Box>}
        </Box>
      );
    });
  };

  const initials = currentUser?.firstName?.charAt(0)?.toUpperCase() || "W";
  const avatarColor = hashColor(currentUser?.firstName || "workspace");

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: c.bg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 264,
          bgcolor: c.sidebarBg,
          borderRight: `1px solid ${c.border}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          sx={{
            alignItems: "center",
            p: 1.75,
            mx: 1,
            mt: 1,
            borderRadius: "8px",
            cursor: "pointer",
            "&:hover": { bgcolor: c.sidebarHover },
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "7px",
              bgcolor: avatarColor,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials}
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              color: c.textMain,
              letterSpacing: "-0.1px",
            }}
            noWrap
          >
            {currentUser?.firstName ? `${currentUser.firstName}'s Team` : "Workspace"}
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1, mt: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: c.textFaint,
              fontWeight: 600,
              fontSize: "11px",
              px: 2.25,
              mb: 0.5,
              display: "block",
            }}
          >
            Shared workspaces
          </Typography>
          {renderTreeNodes(treeData.shared || [])}

          <Box sx={{ mt: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: c.textFaint,
                fontWeight: 600,
                fontSize: "11px",
                px: 2.25,
                mb: 0.5,
                display: "block",
              }}
            >
              Private pages
            </Typography>
            {renderTreeNodes(treeData.private || [])}
          </Box>
        </Box>
      </Box>

      {/* Main Content View */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {/* Topbar */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 1.5,
            borderBottom: `1px solid transparent`,
            position: "sticky",
            top: 0,
            bgcolor: c.bg,
            zIndex: 2,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: c.textMuted, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ cursor: "pointer", fontSize: "13px", "&:hover": { color: c.textMain } }}
            >
              {currentUser?.firstName ? `${currentUser.firstName}'s Team` : "Workspace"}
            </Typography>
            <Typography variant="body2" sx={{ color: c.textFaint }}>
              /
            </Typography>
            {canAddSubPage(selectedPageId || undefined, activePage) ? (
              <InputBase
                value={selectedPageTitle}
                onChange={(e) => setSelectedPageTitle(e.target.value)}
                onBlur={(e) => handleRenamePage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenamePage((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                sx={{ 
                  color: c.textMain, 
                  fontSize: "13px", 
                  fontWeight: 500, 
                  minWidth: 50, 
                  px: 0.5, 
                  py: 0, 
                  borderRadius: "4px", 
                  "&:hover": { bgcolor: "rgba(55, 53, 47, 0.08)" }, 
                  "&.Mui-focused": { bgcolor: "rgba(55, 53, 47, 0.08)" } 
                }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: c.textMain, fontSize: "13px", fontWeight: 500 }}
                noWrap
              >
                {selectedPageTitle}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <Button
              variant="text"
              startIcon={<Share2 size={14} />}
              sx={{
                color: c.textMuted,
                textTransform: "none",
                fontSize: "13px",
                minWidth: 0,
                px: 1.25,
                borderRadius: "6px",
                "&:hover": { bgcolor: c.sidebarHover, color: c.textMain },
              }}
            >
              Share
            </Button>
            <IconButton
              size="small"
              sx={{ color: c.textMuted, borderRadius: "6px", "&:hover": { bgcolor: c.sidebarHover } }}
            >
              <MoreHorizontal size={18} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Page Content */}
        <Box sx={{ px: { xs: 3, md: 8, lg: 12 }, py: 3, maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <Box sx={{ mb: 3, position: "relative" }}>
            <Box sx={{ position: "absolute", top: -30, left: 0 }}>
              <Button
                size="small"
                sx={{
                  color: c.textFaint,
                  textTransform: "none",
                  fontSize: "12px",
                  bgcolor: "transparent",
                  borderRadius: "5px",
                  "&:hover": { bgcolor: c.sidebarHover, color: c.textMuted },
                }}
              >
                Change icon
              </Button>
            </Box>
            <InputBase
              value={selectedPageTitle}
              onChange={(e) => setSelectedPageTitle(e.target.value)}
              onBlur={() => {
                if (selectedPageId && !selectedPageId.startsWith("user_")) {
                  updatePageTitle(selectedPageId, selectedPageTitle);
                }
              }}
              placeholder="Untitled"
              sx={{
                fontWeight: 700,
                color: c.textMain,
                mb: 2.5,
                fontSize: "38px",
                fontFamily: "ui-serif, Georgia, serif",
                letterSpacing: "-0.5px",
                width: "100%",
                "& input": { padding: 0 },
              }}
            />

            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mb: 3.5, borderBottom: `1px solid ${c.border}`, pb: 2.5 }}
            >
              {canAddSubPage(selectedPageId || undefined, activePage) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Plus size={15} />}
                  onClick={() => handleCreateNewPage(selectedPageId as string)}
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderColor: c.border,
                    color: c.textMain,
                    borderRadius: "7px",
                    "&:hover": { bgcolor: c.sidebarHover, borderColor: c.borderStrong },
                  }}
                >
                  Add sub-page
                </Button>
              )}
              {activePage?.pageType === "SHEET" &&
                canAddSubPage(selectedPageId || undefined, activePage) && (
                  <>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TableIcon size={15} />}
                      onClick={() => setUploadDataModalOpen(true)}
                      sx={{
                        textTransform: "none",
                        fontSize: "13px",
                        fontWeight: 500,
                        borderColor: c.border,
                        color: c.textMain,
                        borderRadius: "7px",
                        "&:hover": { bgcolor: c.sidebarHover, borderColor: c.borderStrong },
                      }}
                    >
                      Paste / upload leads
                    </Button>
                    {activePage?.rows?.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Trash2 size={15} />}
                        onClick={handleClearData}
                        sx={{
                          textTransform: "none",
                          fontSize: "13px",
                          fontWeight: 500,
                          borderColor: c.border,
                          color: "#eb5757",
                          borderRadius: "7px",
                          "&:hover": { bgcolor: "rgba(235,87,87,0.1)", borderColor: "#eb5757" },
                        }}
                      >
                        Clear all data
                      </Button>
                    )}
                  </>
                )}
            </Stack>
          </Box>

          {/* Leads Data Table (if data exists and it's a SHEET) */}
          {activePage?.pageType === "SHEET" &&
            (rowsData.length > 0 && pageColumns.length > 0 ? (
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    mb: 2,
                    px: 1.25,
                    py: 0.75,
                    border: `1px solid ${c.border}`,
                    borderRadius: "7px",
                    bgcolor: c.sidebarBg,
                  }}
                >
                  <Search size={15} color={c.textFaint} />
                  <InputBase
                    placeholder="Search in database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1, fontSize: "13.5px", color: c.textMain }}
                  />
                  {searchQuery && (
                    <Chip
                      size="small"
                      label={`${filteredRows.length} result${filteredRows.length === 1 ? "" : "s"}`}
                      sx={{
                        height: 20,
                        fontSize: "11px",
                        bgcolor: c.accentSoft,
                        color: c.accent,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
                <TableContainer
                  sx={{
                    border: `1px solid ${c.border}`,
                    borderRadius: "8px",
                    maxHeight: "65vh",
                  }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {pageColumns.map((col: any) => (
                          <TableCell
                            key={col.key}
                            sx={{
                              color: c.textMuted,
                              fontWeight: 600,
                              fontSize: "12.5px",
                              py: 1.1,
                              bgcolor: c.sidebarBg,
                              borderBottom: `1px solid ${c.border}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRows.map((row, idx) => (
                        <TableRow
                          key={idx}
                          sx={{
                            "&:hover": { bgcolor: c.sidebarHover },
                            "&:last-child td": { borderBottom: 0 },
                          }}
                        >
                          {pageColumns.map((col: any) => (
                            <TableCell
                              key={col.key}
                              sx={{
                                color: c.textMain,
                                fontSize: "13.5px",
                                py: 0.9,
                                borderBottom: `1px solid ${c.border}`,
                              }}
                            >
                              {row[col.key]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Fade in>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 9,
                    border: `1px dashed ${c.border}`,
                    borderRadius: "10px",
                    bgcolor: c.sidebarBg,
                  }}
                >
                  <Sparkles size={22} color={c.textFaint} style={{ marginBottom: 10 }} />
                  <Typography sx={{ color: c.textMuted, fontSize: "14px", mb: 0.5 }}>
                    No data in this view yet.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setUploadDataModalOpen(true)}
                    sx={{
                      mt: 0.5,
                      textTransform: "none",
                      color: c.accent,
                      fontWeight: 500,
                      fontSize: "13.5px",
                      "&:hover": { bgcolor: c.accentSoft },
                    }}
                  >
                    Paste leads to get started
                  </Button>
                </Box>
              </Fade>
            ))}

          {/* Child Pages Preview */}
          {activePage?.children?.length > 0 && (
            <Box sx={{ mt: 4 }}>
              {activePage.children.map((child: any) => (
                <Stack
                  key={child._id}
                  direction="row"
                  spacing={1.25}
                  onClick={() => handleSelectPage(child)}
                  sx={{
                    alignItems: "center",
                    py: 1,
                    px: 1,
                    mx: -1,
                    borderRadius: "6px",
                    cursor: "pointer",
                    "&:hover": { bgcolor: c.sidebarHover },
                  }}
                >
                  <FileText size={17} color={c.textMuted} />
                  <Typography sx={{ color: c.textMain, fontWeight: 500, fontSize: "14.5px" }}>
                    {child.title}
                  </Typography>
                </Stack>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Upload Data Modal */}
      <Dialog
        open={uploadDataModalOpen}
        onClose={() => setUploadDataModalOpen(false)}
        PaperProps={{ sx: { bgcolor: c.bg, minWidth: 520, borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: c.textMain, fontSize: "17px", pb: 0.5 }}>
          Paste leads data
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: c.textMuted, mb: 2, fontSize: "13.5px" }}>
            Paste rows from Excel or Sheets — they'll be added to this page right away.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder={"ID\tPhone\tName\tPAN\tCity..."}
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            sx={{
              bgcolor: c.sidebarBg,
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "13px",
                borderRadius: "8px",
              },
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={replaceData} onChange={(e) => setReplaceData(e.target.checked)} size="small" />}
            label={<Typography sx={{ fontSize: "13.5px", color: c.textMain, fontWeight: 500 }}>Replace existing data</Typography>}
            sx={{ mt: 1, ml: 0 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setUploadDataModalOpen(false)}
            sx={{ color: c.textMuted, textTransform: "none", fontWeight: 500, borderRadius: "7px" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadDataToPage}
            disableElevation
            disabled={!pastedData.trim()}
            sx={{
              bgcolor: c.accent,
              textTransform: "none",
              fontWeight: 500,
              borderRadius: "7px",
              px: 2.5,
              "&:hover": { bgcolor: c.accentHover },
            }}
          >
            Upload to page
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}