import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from "@mui/material";
import { RefreshCcw, Trash2 } from "lucide-react";
import useNotionPages from "@/hooks/useNotionPages";
import { formatDistanceToNow, differenceInDays } from "date-fns";

const dialogTitle = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: "#1f2937",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: "12px",
  marginBottom: "16px",
};

const cancelBtn = {
  textTransform: "none",
  color: "#4b5563",
  "&:hover": { backgroundColor: "#f3f4f6" },
};

export default function TrashDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const { fetchDeletedPages, restorePage } = useNotionPages();
  const [deletedPages, setDeletedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTrash();
    }
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
      setDeletedPages(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ ...dialogTitle, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Trash2 size={20} className="text-error-500" />
        Trash (45 Days Retention)
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography className="text-gray-500 py-4 text-center">Loading trash...</Typography>
        ) : deletedPages.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Trash2 size={48} className="text-gray-300 mb-4" />
            <Typography>Trash is empty</Typography>
          </Box>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHead className="bg-gray-50">
                <TableRow>
                  <TableCell className="font-semibold text-gray-600">Page Title</TableCell>
                  <TableCell className="font-semibold text-gray-600">Owner</TableCell>
                  <TableCell className="font-semibold text-gray-600">Team</TableCell>
                  <TableCell className="font-semibold text-gray-600">Deleted By</TableCell>
                  <TableCell className="font-semibold text-gray-600">Time</TableCell>
                  <TableCell className="font-semibold text-gray-600">Days Left</TableCell>
                  <TableCell className="font-semibold text-gray-600 text-right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deletedPages.map((page) => {
                  const deletedAt = page.deletedAt ? new Date(page.deletedAt) : new Date();
                  const daysLeft = Math.max(0, 45 - differenceInDays(new Date(), deletedAt));
                  
                  return (
                    <TableRow key={page._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{page.title}</TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {page.createdBy?.firstName} {page.createdBy?.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {page.createdBy?.teamId?.name || '-'}
                      </TableCell>
                      <TableCell className="text-error-600 text-sm font-medium">
                        {page.deletedBy?.firstName} {page.deletedBy?.lastName}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {formatDistanceToNow(deletedAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${daysLeft <= 7 ? 'bg-error-100 text-error-700' : 'bg-success-100 text-success-700'}`}>
                          {daysLeft} days
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="small"
                          onClick={() => handleRestore(page._id)}
                          disabled={restoring === page._id}
                          startIcon={<RefreshCcw size={14} />}
                          className="text-brand-600 hover:bg-brand-50 normal-case"
                        >
                          {restoring === page._id ? 'Restoring...' : 'Restore'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <Button onClick={onClose} sx={cancelBtn}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
