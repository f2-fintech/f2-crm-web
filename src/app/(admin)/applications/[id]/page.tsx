"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, 
  CreditCard, Calendar, User, FileText, Download, 
  Activity, ShieldCheck, FileCheck, Check
} from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [params.id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/applications/${params.id}`);
      setApp(data.data || data);
    } catch (error) {
      console.error("Error fetching application details", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setStatusUpdating(true);
      await api.patch(`/applications/${params.id}/status`, { status: newStatus });
      await fetchApplicationDetails();
    } catch (error) {
      console.error("Error updating status", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-800">Application Not Found</h2>
        <button onClick={() => router.push("/applications")} className="mt-4 text-brand-600 hover:underline">
          Return to Pipeline
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const maps: Record<string, string> = {
      "SUBMITTED": "bg-blue-100 text-blue-700 border-blue-200",
      "UNDER_REVIEW": "bg-amber-100 text-amber-700 border-amber-200",
      "APPROVED": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "REJECTED": "bg-red-100 text-red-700 border-red-200",
      "DISBURSED": "bg-purple-100 text-purple-700 border-purple-200",
    };
    return maps[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/applications")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Application: {app.applicationId || "APP-UNKNOWN"}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusBadge(app.status)}`}>
                {app.status?.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Submitted on {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {app.status !== "APPROVED" && app.status !== "DISBURSED" && (
             <button 
                onClick={() => updateStatus("APPROVED")}
                disabled={statusUpdating}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={18} /> Approve
              </button>
          )}
          {app.status === "APPROVED" && (
             <button 
                onClick={() => updateStatus("DISBURSED")}
                disabled={statusUpdating}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={18} /> Disburse Funds
              </button>
          )}
          {app.status !== "REJECTED" && (
            <button 
              onClick={() => updateStatus("REJECTED")}
              disabled={statusUpdating}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              <XCircle size={18} /> Reject
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Core Info */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Applicant & Loan Overview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              Underwriting Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Applicant Name</p>
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-brand-500" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{app.applicantName || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Loan Type</p>
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-brand-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{app.loanType || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Requested Amount</p>
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-500" />
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      ₹{app.loanAmount?.toLocaleString('en-IN') || "0"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tenure / EMI Pref</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-brand-500" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                       {app.loanAmount > 1000000 ? "120 Months" : "36 Months"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KYC & Documents Verification */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500" />
                  KYC & Document Verification
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Check size={14} /> System Verified
                </span>
             </div>

             <div className="space-y-4">
                {[
                  { name: "PAN Card (Front)", status: "VERIFIED", match: "98%" },
                  { name: "Aadhaar Card", status: "VERIFIED", match: "99%" },
                  { name: "6-Month Bank Statement", status: "PENDING_REVIEW", match: "N/A" }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                        <FileCheck className="text-brand-600 dark:text-brand-400" size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{doc.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Confidence Match: {doc.match}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {doc.status === "VERIFIED" ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-wider">Verified</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase tracking-wider">Review Required</span>
                      )}
                      <button className="text-brand-600 hover:text-brand-800 p-2"><Download size={18} /></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column - Credit Bureau & Actions */}
        <div className="space-y-6">
          
          {/* Credit Bureau Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl shadow-lg border border-slate-800 p-6 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Activity size={150} />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-1">CIBIL Score</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold text-emerald-400">785</span>
                <span className="text-sm text-slate-400">/ 900</span>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Risk Assessment</span>
                  <span className="font-medium text-emerald-400 px-2 py-0.5 bg-emerald-400/10 rounded">LOW RISK</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Active Defaults</span>
                  <span className="font-medium text-white">0</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Credit Enquiries</span>
                  <span className="font-medium text-white">2 in last 6 months</span>
                </div>
              </div>
              
              <button className="w-full mt-6 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-semibold py-2.5 rounded-lg">
                Fetch Latest Report
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              Underwriter Notes
            </h3>
            <textarea 
              className="w-full h-32 p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Add your remarks regarding this application..."
            ></textarea>
            <button className="mt-3 w-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 font-semibold text-sm py-2 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors">
              Save Note
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
