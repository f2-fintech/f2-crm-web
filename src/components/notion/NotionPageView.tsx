import React from "react";
import {
  Box,
  Button,
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
} from "@mui/material";
import { Plus, MoreHorizontal, Search, Table as TableIcon, FileText } from "lucide-react";
import { notionColors } from "./NotionSidebar";

interface NotionPageViewProps {
  selectedPageTitle: string;
  activePage: any;
  rowsData: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateModal: () => void;
  onOpenUploadModal: () => void;
  onSelectChildPage: (child: any) => void;
}

export default function NotionPageView({
  selectedPageTitle,
  activePage,
  rowsData,
  searchQuery,
  setSearchQuery,
  onOpenCreateModal,
  onOpenUploadModal,
  onSelectChildPage,
}: NotionPageViewProps) {
  
  const filteredRows = rowsData.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
      {/* Topbar */}
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", px: 3, py: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: notionColors.textMuted }}>
          <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}>Vineet Team</Typography>
          <Typography variant="body2">/</Typography>
          <Typography variant="body2" sx={{ color: notionColors.textMain }}>{selectedPageTitle}</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button variant="text" sx={{ color: notionColors.textMuted, textTransform: "none", minWidth: 0, px: 1 }}>Share</Button>
          <IconButton size="small" sx={{ color: notionColors.textMuted }}><MoreHorizontal size={18} /></IconButton>
        </Stack>
      </Stack>

      {/* Page Content */}
      <Box sx={{ px: { xs: 4, md: 10, lg: 15 }, py: 5, maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <Box sx={{ mb: 4, position: "relative" }}>
          <Box sx={{ position: "absolute", top: -35, left: 0 }}>
            <Button size="small" sx={{ color: notionColors.textMuted, textTransform: "none", fontSize: "12px", bgcolor: "transparent", "&:hover": { bgcolor: notionColors.sidebarHover } }}>
              Change icon
            </Button>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 700, color: notionColors.textMain, mb: 2, fontSize: "40px", fontFamily: "ui-serif, Georgia, serif" }}>
            {selectedPageTitle}
          </Typography>

          {/* Audit Logs & Properties */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1, py: 2, borderBottom: `1px solid ${notionColors.borderLight}` }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography sx={{ width: 120, color: notionColors.textMuted, fontSize: '14px' }}>Created By</Typography>
              <Typography sx={{ color: notionColors.textMain, fontSize: '14px' }}>
                {activePage?.createdBy?.firstName 
                  ? `${activePage.createdBy.firstName} ${activePage.createdBy.lastName || ""}` 
                  : activePage?.createdBy || "System"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography sx={{ width: 120, color: notionColors.textMuted, fontSize: '14px' }}>Created At</Typography>
              <Typography sx={{ color: notionColors.textMain, fontSize: '14px' }}>
                {activePage?.createdAt ? new Date(activePage.createdAt).toLocaleString() : "-"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography sx={{ width: 120, color: notionColors.textMuted, fontSize: '14px' }}>Assigned To</Typography>
              <Typography sx={{ color: notionColors.textMain, fontSize: '14px' }}>
                {activePage?.assignedMemberId?.firstName 
                  ? `${activePage.assignedMemberId.firstName} ${activePage.assignedMemberId.lastName || ""}` 
                  : activePage?.assignedMemberId || "Unassigned"}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Typography sx={{ width: 120, color: notionColors.textMuted, fontSize: '14px' }}>Last Updated</Typography>
              <Typography sx={{ color: notionColors.textMain, fontSize: '14px' }}>
                {activePage?.updatedAt ? new Date(activePage.updatedAt).toLocaleString() : "-"}
              </Typography>
            </Stack>
          </Box>
          
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 4, borderBottom: `1px solid ${notionColors.borderLight}`, pb: 2 }}>
            <Button variant="outlined" size="small" startIcon={<Plus size={16} />} onClick={onOpenCreateModal} sx={{ textTransform: "none", borderColor: notionColors.borderLight, color: notionColors.textMain, "&:hover": { bgcolor: notionColors.sidebarHover } }}>
              Add Sub-page
            </Button>
            <Button variant="outlined" size="small" startIcon={<TableIcon size={16} />} onClick={onOpenUploadModal} sx={{ textTransform: "none", borderColor: notionColors.borderLight, color: notionColors.textMain, "&:hover": { bgcolor: notionColors.sidebarHover } }}>
              Paste / Upload Leads
            </Button>
          </Stack>
        </Box>

        {/* Leads Data Table (if data exists) */}
        {rowsData.length > 0 ? (
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}>
              <Search size={16} color={notionColors.textMuted} />
              <InputBase 
                placeholder="Search in database..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, fontSize: "14px", color: notionColors.textMain }} 
              />
            </Stack>
            <TableContainer sx={{ border: `1px solid ${notionColors.borderLight}`, borderRadius: 1 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: notionColors.sidebarBg }}>
                  <TableRow>
                    <TableCell sx={{ color: notionColors.textMuted, fontWeight: 500, fontSize: "13px", py: 1 }}>Name</TableCell>
                    <TableCell sx={{ color: notionColors.textMuted, fontWeight: 500, fontSize: "13px", py: 1 }}>Phone</TableCell>
                    <TableCell sx={{ color: notionColors.textMuted, fontWeight: 500, fontSize: "13px", py: 1 }}>Location</TableCell>
                    <TableCell sx={{ color: notionColors.textMuted, fontWeight: 500, fontSize: "13px", py: 1 }}>Details</TableCell>
                    <TableCell sx={{ color: notionColors.textMuted, fontWeight: 500, fontSize: "13px", py: 1 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((row, idx) => (
                    <TableRow key={idx} sx={{ "&:hover": { bgcolor: notionColors.sidebarHover } }}>
                      <TableCell sx={{ color: notionColors.textMain, fontSize: "14px", fontWeight: 500, py: 1 }}>{row.col2 || row.id}</TableCell>
                      <TableCell sx={{ color: notionColors.textMain, fontSize: "14px", py: 1 }}>{row.col1}</TableCell>
                      <TableCell sx={{ color: notionColors.textMain, fontSize: "14px", py: 1 }}>{row.col4} {row.col6}</TableCell>
                      <TableCell sx={{ color: notionColors.textMuted, fontSize: "14px", py: 1 }}>{row.col3}</TableCell>
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'inline-block', px: 1, py: 0.2, borderRadius: 1, bgcolor: "rgba(35, 131, 226, 0.1)", color: "#2383e2", fontSize: "12px" }}>
                          {row.feedback || "New"}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ color: notionColors.textMuted }}>No data in this view.</Typography>
            <Button size="small" onClick={onOpenUploadModal} sx={{ mt: 1, textTransform: "none", color: "#2383e2" }}>
              Click here to paste Leads
            </Button>
          </Box>
        )}

        {/* Child Pages Preview */}
        {activePage?.children?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            {activePage.children.map((child: any) => (
              <Stack 
                key={child._id} 
                direction="row" 
                spacing={1} 
                onClick={() => onSelectChildPage(child)}
                sx={{ alignItems: "center", py: 1, cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              >
                <FileText size={18} color={notionColors.textMuted} />
                <Typography sx={{ color: notionColors.textMain, fontWeight: 500 }}>{child.title}</Typography>
              </Stack>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
