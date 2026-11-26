import React from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { ChevronRight, ChevronDown, FileText, Plus, Table as TableIcon } from "lucide-react";
import { NotionPageItem } from "@/hooks/useNotionPages";

export const notionColors = {
  bgLight: "#ffffff",
  sidebarBg: "#f8fafc",
  sidebarHover: "rgba(241, 245, 249, 0.9)",
  sidebarActive: "rgba(99, 102, 241, 0.08)",
  textMain: "#0f172a",
  textMuted: "#64748b",
  borderLight: "#e2e8f0",
  accent: "#4f46e5",
};

interface NotionSidebarProps {
  treeData: any;
  selectedPageId: string | null;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onSelectPage: (node: NotionPageItem) => void;
  onCreateSubpage: () => void;
}

export default function NotionSidebar({
  treeData,
  selectedPageId,
  expandedNodes,
  onToggleExpand,
  onSelectPage,
  onCreateSubpage,
}: NotionSidebarProps) {

  const renderTreeNodes = (nodes: NotionPageItem[], depth = 0) => {
    return nodes.map((node) => {
      const nodeKey = node._id || node.id;
      const isExpanded = expandedNodes[nodeKey] !== false; // Default true
      const hasChildren = node.children && node.children.length > 0;
      const isSelected = selectedPageId === nodeKey;

      return (
        <Box key={nodeKey}>
          <Stack
            direction="row"
            spacing={0.5}
            onClick={() => onSelectPage(node)}
            sx={{
              alignItems: "center",
              py: 0.6,
              pl: 1 + depth * 1.5,
              pr: 1,
              mx: 0.75,
              my: 0.2,
              borderRadius: "6px",
              cursor: "pointer",
              bgcolor: isSelected ? notionColors.sidebarActive : "transparent",
              color: isSelected ? notionColors.accent : notionColors.textMain,
              borderLeft: isSelected ? `3px solid ${notionColors.accent}` : "3px solid transparent",
              transition: "all 120ms ease",
              "&:hover": {
                bgcolor: isSelected ? notionColors.sidebarActive : notionColors.sidebarHover,
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => onToggleExpand(nodeKey, e)}
              sx={{ p: 0.2, color: isSelected ? notionColors.accent : notionColors.textMuted, visibility: hasChildren ? 'visible' : 'hidden' }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </IconButton>

            {node.pageType === "SHEET" ? (
              <TableIcon size={15} style={{ color: isSelected ? notionColors.accent : notionColors.textMuted, marginRight: 6, flexShrink: 0 }} />
            ) : (
              <FileText size={15} style={{ color: isSelected ? notionColors.accent : notionColors.textMuted, marginRight: 6, flexShrink: 0 }} />
            )}

            <Typography variant="body2" sx={{ fontSize: "13.5px", fontWeight: isSelected ? 600 : 500, flexGrow: 1 }} noWrap>
              {node.title}
            </Typography>

            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCreateSubpage(); }} sx={{ p: 0.2, color: notionColors.textMuted, opacity: 0, '.MuiStack-root:hover &': { opacity: 1 } }}>
              <Plus size={14} />
            </IconButton>
          </Stack>

          {hasChildren && isExpanded && (
            <Box>
              {renderTreeNodes(node.children!, depth + 1)}
            </Box>
          )}
        </Box>
      );
    });
  };

  return (
    <Box
      sx={{
        width: 270,
        bgcolor: notionColors.sidebarBg,
        borderRight: `1px solid ${notionColors.borderLight}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", p: 2, borderBottom: `1px solid ${notionColors.borderLight}`, cursor: "pointer", "&:hover": { bgcolor: notionColors.sidebarHover } }}>
        <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: notionColors.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold" }}>
          V
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography sx={{ fontWeight: 600, fontSize: "13.5px", color: notionColors.textMain, lineHeight: 1.2 }}>
            VINEET TEAM
          </Typography>
          <Typography sx={{ fontSize: "11px", color: notionColors.textMuted }}>
            Workspace
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1.5 }}>
        <Typography variant="caption" sx={{ color: notionColors.textMuted, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", px: 2, mb: 1, display: "block" }}>
          Shared Workspaces
        </Typography>
        {renderTreeNodes(treeData.shared || [])}
        
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="caption" sx={{ color: notionColors.textMuted, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", px: 2, mb: 1, display: "block" }}>
            Private Pages
          </Typography>
          {renderTreeNodes(treeData.private || [])}
        </Box>
      </Box>
    </Box>
  );
}
