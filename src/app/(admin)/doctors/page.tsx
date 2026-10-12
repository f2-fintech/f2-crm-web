"use client";

import { useEffect, useState } from "react";
import { Box, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { ArrowBack, Close as CloseIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadTable from "@/components/leads/table/LeadTable";
import api from "@/lib/axios";
import { Sparkles, User } from "lucide-react";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, disbursed: 0, rejected: 0, pending: 0 });
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/leads", {
        params: { isDoctor: true, limit: 500 }
      });
      const list = response.data?.data || [];
      setDoctors(list);
      
      let a = 0, d = 0, r = 0, p = 0;
      list.forEach((lead: any) => {
        const s = (lead.omsTicketStatus || '').toLowerCase();
        if (s.includes('disburse')) d++;
        else if (s.includes('approv')) a++;
        else if (s.includes('reject')) r++;
        else p++;
      });
      setStats({ total: list.length, approved: a, disbursed: d, rejected: r, pending: p });
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Doctor Applications" />

      <Stack spacing={3}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-20 -translate-y-20 rounded-full bg-white opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-blue-200" />
                <span className="text-sm font-bold uppercase tracking-widest text-blue-100">Specialized View</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Doctors Master List
              </h2>
              <p className="text-blue-100 max-w-2xl text-base leading-relaxed font-medium">
                Complete directory of all doctor applicants. Use this list to review statuses, assign agents, and initiate contact.
              </p>
            </div>
            <div className="shrink-0">
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="contained" 
                startIcon={<ArrowBack />}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.15)', 
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  borderRadius: 3,
                  py: 1.5,
                  px: 3,
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', boxShadow: 'none' }
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
            <p className="text-xs font-black uppercase text-gray-500 mb-1">Total Doctors</p>
            <p className="text-3xl font-black text-blue-700">{stats.total}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
            <p className="text-xs font-black uppercase text-emerald-700 mb-1">Approved</p>
            <p className="text-2xl font-black text-emerald-700">{stats.approved}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 shadow-sm">
            <p className="text-xs font-black uppercase text-purple-700 mb-1">Disbursed</p>
            <p className="text-2xl font-black text-purple-700">{stats.disbursed}</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 shadow-sm">
            <p className="text-xs font-black uppercase text-red-700 mb-1">Rejected</p>
            <p className="text-2xl font-black text-red-700">{stats.rejected}</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-black uppercase text-gray-600 mb-1">Pending/Other</p>
            <p className="text-2xl font-black text-gray-700">{stats.pending}</p>
          </div>
        </div>

        <Box sx={{ width: '100%' }}>
          <LeadTable 
            rows={doctors}
            loading={loading}
            page={1}
            pageSize={100}
            rowCount={doctors.length}
            onPaginationChange={() => {}}
            isDoctorView={true}
            onViewJourney={(lead) => setSelectedDoctor(lead)}
          />
        </Box>
      </Stack>

      {/* Doctor Info Dialog */}
      <Dialog 
        open={!!selectedDoctor} 
        onClose={() => setSelectedDoctor(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        {selectedDoctor && (
          <>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-xl">
                  <User size={20} />
                </div>
                <span className="font-extrabold text-gray-900">Doctor Information</span>
              </div>
              <IconButton onClick={() => setSelectedDoctor(null)} size="small" sx={{ color: 'gray' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.email || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{selectedDoctor.city || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Loan Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600/70">Loan Type</p>
                      <p className="font-semibold text-blue-900 capitalize">{selectedDoctor.loanType || "Professional Loan"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/70">Requested Amount</p>
                      <p className="font-semibold text-blue-900">₹ {Number(selectedDoctor.loanAmount || 0).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/70">Status</p>
                      <p className="font-semibold text-blue-900 uppercase">{selectedDoctor.omsTicketStatus || "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600/70">Provider</p>
                      <p className="font-semibold text-blue-900">{selectedDoctor.omsProvider || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => setSelectedDoctor(null)}
                sx={{ 
                  bgcolor: '#2563EB', 
                  borderRadius: 2, 
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' }
                }}
              >
                Close Information
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
