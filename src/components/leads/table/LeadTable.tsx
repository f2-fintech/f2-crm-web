"use client";

import React from "react";
import LeadRowActions from "./LeadRowActions";
import { Building, Phone, User, Activity, Calendar, FileText } from "lucide-react";

interface LeadTableProps {
  rows: any[];
  loading?: boolean;
  page: number;
  pageSize: number;
  rowCount: number;
  onPaginationChange: (model: any) => void;
  onViewJourney?: (lead: any) => void;
  onDelete?: (lead: any) => void;
  onAssign?: (lead: any) => void;
  onStatusChange?: (lead: any) => void;
  isDoctorView?: boolean;
}

// Helper to generate consistent avatar colors based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-amber-100 text-amber-700",
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

export default function LeadTable({
  rows,
  loading = false,
  onViewJourney,
  onDelete,
  onAssign,
  onStatusChange,
  isDoctorView,
}: LeadTableProps) {
  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Customer Details</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Origin & Location</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Loan Request</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Provider & Status</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">{isDoctorView ? "Information" : "Activity"}</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-10 w-48 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-32 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-20 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-8 w-8 bg-gray-100 rounded-full mx-auto"></div></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <User size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-semibold text-gray-500">No leads found in this view</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const initial = row.fullName ? row.fullName.charAt(0).toUpperCase() : "?";
                const avatarColor = getAvatarColor(row.fullName || "");
                
                return (
                  <tr key={row._id} className="hover:bg-indigo-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg ${avatarColor}`}>
                          {initial}
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 mb-0.5">{row.fullName}</div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="flex items-center gap-1"><Phone size={12}/> {row.phone}</span>
                            {row.assignedTo?.firstName && (
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1">
                                @{row.assignedTo.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          {row.leadSource || "Website"}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-1">
                          <Building size={12} className="text-gray-400" />
                          {row.city || "Unknown City"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900">
                        ₹ {Number(row.loanAmount || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1">
                        <FileText size={12} /> {row.loanType || "Professional Loan"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 mb-1">
                        {row.omsProvider || "-"}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        (() => {
                          const s = (row.omsTicketStatus || '').toUpperCase();
                          if (s.includes('DISBURSE') || s.includes('APPROV')) return 'bg-emerald-100 text-emerald-800';
                          if (s.includes('CARRY FORWARD')) return 'bg-blue-100 text-blue-800';
                          if (s.includes('REJECT')) return 'bg-red-100 text-red-800';
                          if (s.includes('FILE SEND')) return 'bg-amber-100 text-amber-800';
                          return 'bg-gray-100 text-gray-700';
                        })()
                      }`}>
                        {row.omsTicketStatus || "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onViewJourney?.(row)}
                        className="flex items-center gap-2 group/btn"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover/btn:bg-blue-600 group-hover/btn:text-white transition-colors">
                          {isDoctorView ? <User size={14} className="stroke-[3px]" /> : <Activity size={14} className="stroke-[3px]" />}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-xs font-bold text-gray-700 group-hover/btn:text-blue-600">
                            {isDoctorView ? "Basic Details" : `${row.touchpointsCount || 0} Actions`}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400">
                            {isDoctorView ? "View Info" : "View Journey"}
                          </span>
                        </div>
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <LeadRowActions 
                          lead={row} 
                          onViewJourney={onViewJourney}
                          onDelete={onDelete}
                          onAssign={onAssign}
                          onStatusChange={onStatusChange}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}