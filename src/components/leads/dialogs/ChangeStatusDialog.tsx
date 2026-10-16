"use client";
import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, TextField, Alert } from "@mui/material";
import { LeadStatus } from "@/types/lead";
import api from "@/lib/axios";

interface ChangeStatusDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onSuccess?: () => void;
}

export default function ChangeStatusDialog({ open, onClose, leadId, onSuccess }: ChangeStatusDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const [values, setValues] = React.useState({
    status: LeadStatus.NEW,
    remarks: "",
    lastFollowUp: "",
    nextFollowUp: "",
  });

  React.useEffect(() => {
    if (open) {
      setValues({ status: LeadStatus.NEW, remarks: "", lastFollowUp: "", nextFollowUp: "" });
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!values.status) {
      setError("Status is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/leads/${leadId}`, { 
        status: values.status,
        remarks: values.remarks,
        lastFollowUp: values.lastFollowUp,
        nextFollowUp: values.nextFollowUp
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!leadId) return null;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Change Lead Status</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField select fullWidth required label="Lead Status" value={values.status} onChange={(e) => setValues({...values, status: e.target.value as LeadStatus})}>
              {Object.values(LeadStatus).map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="datetime-local" label="Last Follow Up" value={values.lastFollowUp} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => setValues({...values, lastFollowUp: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="datetime-local" label="Next Follow Up" value={values.nextFollowUp} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => setValues({...values, nextFollowUp: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={4} label="Remarks" value={values.remarks} onChange={(e) => setValues({...values, remarks: e.target.value})} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? "Updating..." : "Update Status"}</Button>
      </DialogActions>
    </Dialog>
  );
}