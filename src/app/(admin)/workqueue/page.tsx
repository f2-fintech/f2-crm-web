"use client";

import React, { useState } from "react";
import { 
  Box, Typography, Stepper, Step, StepLabel, 
  Button, Paper, TextField, MenuItem, 
  Chip, Grid, Divider
} from "@mui/material";
import { CheckCircle2, ShieldCheck, CreditCard, Play } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const steps = [
  "Lead Verification",
  "KYC & Document Upload",
  "Convert to Customer",
  "Application Underwriting",
  "Final Disbursal"
];

export default function WorkqueueWorkflowPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLead, setSelectedLead] = useState<string>("L17098483");
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setActiveStep((prev) => prev + 1);
      setLoading(false);
    }, 600); // simulate API call
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <>
      <PageBreadcrumb pageTitle="Onboarding Workflow Engine" />
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          End-to-end customer onboarding and conversion wizard. Process leads seamlessly from initial contact to final loan disbursal.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        
        {/* Header selector */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Current Task:</Typography>
            <Chip label={selectedLead} color="primary" />
            <Typography variant="body2" color="text.secondary">John Doe Fintech (Personal Loan)</Typography>
          </Box>
          <Button variant="outlined" size="small">Select Different Lead</Button>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '300px', p: 3, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#fafafa' }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>Step 1: Lead Verification</Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                  Verify the contact details and initial requirements of the lead.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Verified Phone Number" defaultValue="9876543210" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Contact Status" defaultValue="Reached">
                  <MenuItem value="Reached">Reached</MenuItem>
                  <MenuItem value="Not Reachable">Not Reachable</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth multiline rows={3} label="Agent Remarks" placeholder="Customer is interested in 5L Personal Loan..." />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={600} mb={2}>Step 2: KYC & Document Upload</Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Upload and verify statutory documents (PAN, Aadhaar, Bank Statements).
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button variant="outlined" component="label" startIcon={<ShieldCheck size={18} />}>
                  Upload PAN Card
                  <input type="file" hidden />
                </Button>
                <Button variant="outlined" component="label" startIcon={<ShieldCheck size={18} />}>
                  Upload Aadhaar
                  <input type="file" hidden />
                </Button>
              </Box>
              <Box sx={{ p: 2, bgcolor: "#ecfdf5", color: "#065f46", borderRadius: 1, border: "1px solid #10b981", display: "inline-flex", alignItems: "center", gap: 1 }}>
                <CheckCircle2 size={20} />
                <Typography variant="body2" fontWeight={600}>AI KYC Check: Documents match successfully.</Typography>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Step 3: Convert Lead to Customer</Typography>
              <Typography variant="body2" color="text.secondary" mb={4} maxWidth={500} mx="auto">
                The lead has passed initial verification and KYC. They will now be migrated to the Customer database to begin the formal application process.
              </Typography>
              <Button variant="contained" color="success" size="large" startIcon={<Play size={18} />} onClick={handleNext}>
                Execute Conversion
              </Button>
            </Box>
          )}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>Step 4: Application Underwriting</Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                  Process the loan application based on credit scores and income.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="CIBIL Score" defaultValue="750" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Approved Amount" defaultValue="500000" />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Interest Rate (%)" defaultValue="11.5" />
              </Grid>
            </Grid>
          )}

          {activeStep === 4 && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
              <Typography variant="h5" fontWeight={700} mb={2}>Final Disbursal Ready</Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                All verifications complete. Funds will be routed to the customer's verified bank account.
              </Typography>
              <Button variant="contained" color="primary" size="large" startIcon={<CreditCard size={18} />} onClick={handleNext}>
                Disburse Funds Now
              </Button>
            </Box>
          )}

          {activeStep === steps.length && (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="h5" fontWeight={700} color="primary" mb={2}>Onboarding Complete!</Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                The customer journey has been successfully completed. 
              </Typography>
              <Button variant="outlined" onClick={handleReset}>Process Another Lead</Button>
            </Box>
          )}
        </Box>

        {activeStep < steps.length && activeStep !== 2 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              variant="contained" 
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Save & Continue'}
            </Button>
          </Box>
        )}
      </Paper>
    </>
  );
}
