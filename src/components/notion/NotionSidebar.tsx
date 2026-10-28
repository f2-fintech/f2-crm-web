import React from "react";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { ChevronRight, ChevronDown, FileText, Plus, Table as TableIcon } from "lucide-react";
import { NotionPageItem } from "@/hooks/useNotionPages";

export const notionColors = {
  bgLight: "#ffffff",
  sidebarBg: "#f7f7f5",
  sidebarHover: "rgba(55, 53, 47, 0.08)",
  textMain: "#37352f",
  textMuted: "rgba(55, 53, 47, 0.6)",
  borderLight: "rgba(55, 53, 47, 0.16)",
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
              py: 0.5,
              pl: 1 + depth * 1.5,
              pr: 1,
              cursor: "pointer",
              bgcolor: isSelected ? notionColors.sidebarHover : "transparent",
              color: notionColors.textMain,
              "&:hover": {
                bgcolor: notionColors.sidebarHover,
              },
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => onToggleExpand(nodeKey, e)}
              sx={{ p: 0.2, color: notionColors.textMuted, visibility: hasChildren ? 'visible' : 'hidden' }}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </IconButton>

            {node.pageType === "SHEET" ? (
              <TableIcon size={16} style={{ color: notionColors.textMuted, marginRight: 4 }} />
            ) : (
              <FileText size={16} style={{ color: notionColors.textMuted, marginRight: 4 }} />
            )}

            <Typography variant="body2" sx={{ fontSize: "14px", fontWeight: 500, flexGrow: 1 }} noWrap>
              {node.title}
            </Typography>

            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCreateSubpage(); }} sx={{ p: 0.2, color: notionColors.textMuted, opacity: 0, '.MuiStack-root:hover &': { opacity: 1 } }}>
              <Plus size={16} />
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
        width: 260,
        bgcolor: notionColors.sidebarBg,
        borderRight: `1px solid ${notionColors.borderLight}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", p: 2, cursor: "pointer", "&:hover": { bgcolor: notionColors.sidebarHover } }}>
        <Box sx={{ width: 24, height: 24, borderRadius: 1, bgcolor: "#eb5757", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold" }}>
          V
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "14px", color: notionColors.textMain }}>
          VINEET TEAM
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
        <Typography variant="caption" sx={{ color: notionColors.textMuted, fontWeight: 600, px: 2, mb: 0.5, display: "block" }}>
          Shared Workspaces
        </Typography>
        {renderTreeNodes(treeData.shared || [])}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: notionColors.textMuted, fontWeight: 600, px: 2, mb: 0.5, display: "block" }}>
            Private Pages
          </Typography>
          {renderTreeNodes(treeData.private || [])}
        </Box>
      </Box>
    </Box>
  );
}
