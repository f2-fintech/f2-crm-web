"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, CircularProgress, Box, Alert, Dialog } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ReactMarkdown from "react-markdown";
import api from "@/lib/axios";

export default function AiLeadSummary({ leadId }: { leadId: string }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/ai-summary/lead/${leadId}`);
      setSummary(response.data.summary);
      setOpen(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Failed to fetch AI summary. Please make sure the API key is set.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={fetchSummary}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
          background: 'linear-gradient(135deg, #9c27b0 0%, #d81b60 100%)',
          color: 'white',
          fontWeight: 'bold',
          '&:hover': {
            background: 'linear-gradient(135deg, #8e24aa 0%, #c2185b 100%)',
          }
        }}
      >
        {loading ? "Generating Insight..." : "AI Insight"}
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ p: 3, background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AutoAwesomeIcon color="secondary" />
            <Typography variant="h6" fontWeight={700} color="secondary.main">
              AI Generated Insight
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {summary && (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontSize: '0.95rem', '& p': { mt: 0, mb: 1.5 }, '& ul': { pl: 3, m: 0 } }}>
              <ReactMarkdown>{summary}</ReactMarkdown>
            </Box>
          )}
          
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button onClick={() => setOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
              Close
            </Button>
            <Button onClick={fetchSummary} variant="outlined" color="secondary" disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>
              {loading ? "Regenerating..." : "Regenerate"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
