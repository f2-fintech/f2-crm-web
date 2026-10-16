"use client";
import * as React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, MenuItem, TextField, Alert } from "@mui/material";
import { LeadPriority } from "@/types/lead";
import api from "@/lib/axios";

interface AssignLeadDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  onSuccess?: () => void;
}

export default function AssignLeadDialog({ open, onClose, leadId, onSuccess }: AssignLeadDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [users, setUsers] = React.useState<any[]>([]);
  const [branches, setBranches] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [error, setError] = React.useState("");

  const [values, setValues] = React.useState({
    userId: "",
    branchId: "",
    departmentId: "",
    priority: LeadPriority.HIGH,
    nextFollowUp: "",
    assignmentRemark: "",
  });

  React.useEffect(() => {
    if (open) {
      setValues({ userId: "", branchId: "", departmentId: "", priority: LeadPriority.HIGH, nextFollowUp: "", assignmentRemark: "" });
      setError("");
      fetchDropdowns();
    }
  }, [open]);

  const fetchDropdowns = async () => {
    try {
      const [uRes, bRes, dRes] = await Promise.all([
        api.get("/users").catch(() => ({ data: { data: [] } })),
        api.get("/branches").catch(() => ({ data: { data: [] } })),
        api.get("/departments").catch(() => ({ data: { data: [] } })),
      ]);
      setUsers(uRes.data?.data || uRes.data || []);
      setBranches(bRes.data?.data || bRes.data || []);
      setDepartments(dRes.data?.data || dRes.data || []);
    } catch (err) {}
  };

  const handleSubmit = async () => {
    if (!values.userId) {
      setError("User is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.patch(`/leads/${leadId}`, { 
        assignedTo: values.userId,
        branchId: values.branchId,
        departmentId: values.departmentId,
        priority: values.priority,
        nextFollowUp: values.nextFollowUp,
        remarks: values.assignmentRemark
      });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign lead");
    } finally {
      setLoading(false);
    }
  };

  if (!leadId) return null;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Assign Lead</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField select fullWidth required label="Assign User" value={values.userId} onChange={(e) => setValues({...values, userId: e.target.value})}>
              <MenuItem value="">Select User</MenuItem>
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>{user.fullName || user.email}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Branch" value={values.branchId} onChange={(e) => setValues({...values, branchId: e.target.value})}>
              <MenuItem value="">Select Branch</MenuItem>
              {branches.map((item) => (
                <MenuItem key={item._id} value={item._id}>{item.branchName || item.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Department" value={values.departmentId} onChange={(e) => setValues({...values, departmentId: e.target.value})}>
              <MenuItem value="">Select Department</MenuItem>
              {departments.map((item) => (
                <MenuItem key={item._id} value={item._id}>{item.departmentName || item.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Priority" value={values.priority} onChange={(e) => setValues({...values, priority: e.target.value as LeadPriority})}>
              {Object.values(LeadPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth type="datetime-local" label="Next Follow Up" value={values.nextFollowUp} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => setValues({...values, nextFollowUp: e.target.value})} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth multiline rows={4} label="Assignment Remark" value={values.assignmentRemark} onChange={(e) => setValues({...values, assignmentRemark: e.target.value})} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>{loading ? "Assigning..." : "Assign Lead"}</Button>
      </DialogActions>
    </Dialog>
  );
}