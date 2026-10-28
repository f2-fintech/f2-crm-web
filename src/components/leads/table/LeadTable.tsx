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
              <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-500">T.ID</th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Source</th>
              <th className="px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Lead Type</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500">Customer Details</th>
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
                  <td className="px-5 py-5"><div className="h-6 w-14 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-5 py-5"><div className="h-8 w-20 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-5 py-5"><div className="h-8 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-48 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-24 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-10 w-20 bg-gray-100 rounded-lg"></div></td>
                  <td className="px-6 py-5"><div className="h-8 w-8 bg-gray-100 rounded-full mx-auto"></div></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <User size={40} className="mb-3 opacity-20" />
                    <p className="text-sm font-semibold text-gray-500">No leads found in this view</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const displayName = row.fullName || row.clientName || `${row.firstName || ''} ${row.lastName || ''}`.trim() || `Lead #${row.leadId || row.omsTicketId || ''}`;
                const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";
                const avatarColor = getAvatarColor(displayName);
                
                const isDrive = Boolean((row.leadSource || '').toUpperCase().includes('DRIVE'));
                const agentName = !isDrive ? (row.omsAppliedByName || row.appliedByName || null) : null;

                return (
                  <tr key={row._id} className="hover:bg-indigo-50/40 transition-colors group">
                    {/* T.ID */}
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-sm text-gray-900 tracking-tight">
                        {row.omsTicketId ? row.omsTicketId : (row.leadId ? `#${row.leadId.slice(-4)}` : "-")}
                      </span>
                    </td>

                    {/* Source & Submitter */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        {(() => {
                          const rawSrc = (row.leadSource || '').toUpperCase();
                          let badgeLabel = 'WEBSITE';
                          let badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                          let agentColor = 'text-blue-700';

                          if (rawSrc.includes('LENDGRID')) {
                            badgeLabel = 'LENDGRID';
                            badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
                            agentColor = 'text-purple-700';
                          } else if (rawSrc.includes('WEBSITE')) {
                            badgeLabel = 'WEBSITE';
                            badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                            agentColor = 'text-blue-700';
                          } else if (row.omsTicketId || rawSrc.includes('OMS')) {
                            badgeLabel = 'OMS';
                            badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
                            agentColor = 'text-teal-700';
                          } else if (rawSrc.includes('DRIVE')) {
                            badgeLabel = rawSrc;
                            badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
                          } else if (rawSrc) {
                            badgeLabel = rawSrc;
                          }

                          const cleanAgent = (!isDrive && agentName && agentName !== 'N/A' && agentName !== 'null' && agentName.trim().length > 0) ? agentName.trim() : null;
                          const formattedAgent = cleanAgent ? cleanAgent.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : null;

                          return (
                            <>
                              <span className={`inline-flex text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                                {badgeLabel}
                              </span>
                              {formattedAgent && (
                                <span className={`text-xs font-black tracking-tight ${agentColor}`}>
                                  {formattedAgent}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Lead Type (Dedicated Column) */}
                    <td className="px-5 py-4">
                      {(() => {
                        const rawType = (row.omsLeadType || '').toLowerCase().trim();
                        if (rawType.includes('dial')) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-700 border-rose-200 shadow-[0_1px_2px_rgba(244,63,94,0.08)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              Dialer
                            </span>
                          );
                        } else if (rawType.includes('notion')) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_1px_2px_rgba(16,185,129,0.08)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                              Notion
                            </span>
                          );
                        } else if (rawType.includes('ref')) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-amber-50 text-amber-700 border-amber-200 shadow-[0_1px_2px_rgba(245,158,11,0.08)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              Referral
                            </span>
                          );
                        } else if (rawType.includes('field')) {
                          return (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-200 shadow-[0_1px_2px_rgba(99,102,241,0.08)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                              Field Visit
                            </span>
                          );
                        } else if (rawType && rawType !== 'null') {
                          return (
                            <span className="inline-flex items-center text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-gray-50 text-gray-700 border-gray-200">
                              {rawType}
                            </span>
                          );
                        }
                        return <span className="text-gray-300 font-bold text-sm">-</span>;
                      })()}
                    </td>

                    {/* Customer Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center font-bold text-lg ${avatarColor}`}>
                          {initial}
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 mb-0.5 uppercase tracking-tight">{displayName}</div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                            <span className="flex items-center gap-1"><Phone size={12}/> {row.phone}</span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1"><Building size={12} className="text-gray-400" /> {row.city || "Unknown City"}</span>
                            {row.assignedTo?.firstName && (
                              <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-1 font-bold">
                                @{row.assignedTo.firstName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Loan Request */}
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900">
                        ₹ {Number(row.loanAmount || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1">
                        <FileText size={12} /> {row.loanType || "Professional Loan"}
                      </div>
                    </td>

                    {/* Provider & Status */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 mb-1">
                        {row.omsProvider || "-"}
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          (() => {
                            const s = (row.omsTicketStatus || '').toUpperCase();
                            if (s.includes('DISBURSE') || s.includes('APPROV')) return 'bg-emerald-100 text-emerald-800';
                            if (s.includes('CARRY FORWARD')) return 'bg-blue-100 text-blue-800';
                            if (s.includes('REJECT')) return 'bg-red-100 text-red-800';
                            if (s.includes('FILE SEND') || s.includes('OPERATION')) return 'bg-amber-100 text-amber-800';
                            return 'bg-gray-100 text-gray-700';
                          })()
                        }`}>
                          {row.omsTicketStatus || "Pending"}
                        </span>
                        {(Number(row.omsApprovedAmount) > 0 || Number(row.omsDisbursedAmount) > 0) && (
                          <span className="text-[10px] font-bold text-emerald-700">
                            {Number(row.omsDisbursedAmount) > 0 ? `Disb: ₹${Number(row.omsDisbursedAmount).toLocaleString('en-IN')}` : `Appr: ₹${Number(row.omsApprovedAmount).toLocaleString('en-IN')}`}
                          </span>
                        )}
                      </div>
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