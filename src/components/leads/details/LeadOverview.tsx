"use client";

import {
  User, Phone, Mail, MapPin, Briefcase, IndianRupee, Building2,
  Calendar, Clock, CheckCircle2, FileText, Globe, Target, BadgeCheck, Activity
} from "lucide-react";
import StatusChip from "../chips/StatusChip";
import PriorityChip from "../chips/PriorityChip";
import SourceChip from "../chips/SourceChip";

interface LeadOverviewProps {
  lead: any;
}

const SectionCard = ({ title, icon, colorClass, children }: { title: string, icon: React.ReactNode, colorClass: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group h-full flex flex-col">
    <div className={`absolute top-0 right-0 w-40 h-40 ${colorClass} rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-125 opacity-40 pointer-events-none`}></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100/60">
        {icon}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
      </div>
      <div className="space-y-1 flex-1">
        {children}
      </div>
    </div>
  </div>
);

const DataRow = ({ label, value, icon, valueComponent }: { label: string, value?: React.ReactNode, icon?: React.ReactNode, valueComponent?: React.ReactNode }) => (
  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-2.5 text-slate-500">
      {icon}
      <span className="text-sm font-bold tracking-wide">{label}</span>
    </div>
    <div className="text-sm font-black text-slate-800 text-right">
      {valueComponent || value || <span className="text-slate-400 font-medium">N/A</span>}
    </div>
  </div>
);

export default function LeadOverview({
  lead,
}: LeadOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
      
      {/* Personal Information */}
      <SectionCard 
        title="Personal Info" 
        icon={<div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><User size={20} strokeWidth={2.5} /></div>}
        colorClass="bg-blue-400"
      >
        <DataRow icon={<BadgeCheck size={16} />} label="Lead ID" value={lead.leadId} />
        <DataRow icon={<User size={16} />} label="Full Name" value={lead.fullName} />
        <DataRow icon={<Phone size={16} />} label="Phone" value={lead.phone} />
        {/* <DataRow icon={<Phone size={16} className="opacity-50" />} label="Alt Phone" value={lead.alternatePhone} /> */}
        <DataRow icon={<Mail size={16} />} label="Email" value={lead.email} />
        <DataRow icon={<MapPin size={16} />} label="City" value={lead.city} />
        <DataRow icon={<Globe size={16} />} label="State" value={lead.state} />
      </SectionCard>

      {/* Loan Information */}
      <SectionCard 
        title="Loan Details" 
        icon={<div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Briefcase size={20} strokeWidth={2.5} /></div>}
        colorClass="bg-purple-400"
      >
        <DataRow icon={<FileText size={16} />} label="Loan Type" value={<span className="capitalize">{lead.loanType}</span>} />
        <DataRow 
          icon={<IndianRupee size={16} />} 
          label="Loan Amount" 
          value={<span className="text-lg text-purple-700">₹{Number(lead.loanAmount || 0).toLocaleString("en-IN")}</span>} 
        />
        {/* <DataRow 
          icon={<IndianRupee size={16} className="opacity-50" />} 
          label="Monthly Income" 
          value={`₹${Number(lead.monthlyIncome || 0).toLocaleString("en-IN")}`} 
        /> */}
        {/* <DataRow icon={<Target size={16} />} label="Employment" value={<span className="capitalize">{lead.employmentType}</span>} />
        <DataRow icon={<Building2 size={16} />} label="Company" value={lead.companyName} /> */}
      </SectionCard>

      {/* Lead Status */}
      <SectionCard 
        title="Status & Assignment" 
        icon={<div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><CheckCircle2 size={20} strokeWidth={2.5} /></div>}
        colorClass="bg-indigo-400"
      >
        <DataRow 
          icon={<Target size={16} />} 
          label="Status" 
          valueComponent={<div className="scale-90 origin-right"><StatusChip status={lead.status} /></div>} 
        />
        <DataRow 
          icon={<Activity size={16} />} 
          label="Priority" 
          valueComponent={<div className="scale-90 origin-right"><PriorityChip priority={lead.priority} /></div>} 
        />
        <DataRow 
          icon={<Globe size={16} />} 
          label="Source" 
          valueComponent={
            <div className="flex items-center gap-2 justify-end">
              <div className="scale-90 origin-right"><SourceChip source={lead.leadSource} /></div>
              {lead.omsAppliedByName && (
                <span className="text-xs text-emerald-600 font-extrabold bg-emerald-50 px-2 py-1 rounded-lg">{lead.omsAppliedByName}</span>
              )}
            </div>
          } 
        />
        {/* <DataRow icon={<User size={16} />} label="Assigned To" value={lead.assignedTo?.fullName} />
        <DataRow icon={<Building2 size={16} />} label="Branch" value={lead.branchId?.branchName} />
        <DataRow icon={<Briefcase size={16} />} label="Department" value={lead.departmentId?.departmentName} /> */}
      </SectionCard>

      {/* Follow Up */}
      {/* <SectionCard 
        title="Timeline Tracking" 
        icon={<div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={20} strokeWidth={2.5} /></div>}
        colorClass="bg-emerald-400"
      >
        <DataRow 
          icon={<Clock size={16} />} 
          label="Last Follow Up" 
          value={lead.lastFollowUp ? new Date(lead.lastFollowUp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : undefined} 
        />
        <DataRow 
          icon={<Calendar size={16} />} 
          label="Next Follow Up" 
          value={lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : undefined} 
        />
        <DataRow 
          icon={<CheckCircle2 size={16} />} 
          label="Converted" 
          valueComponent={lead.isConverted ? <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">Yes</span> : <span className="text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">No</span>} 
        />
        <DataRow icon={<User size={16} />} label="Customer ID" value={lead.customerId} />
        <DataRow icon={<Globe size={16} />} label="OMS ID" value={lead.omsId} />
        <DataRow icon={<FileText size={16} />} label="App ID" value={lead.applicationId} />
      </SectionCard> */}

      {/* Remarks */}
      <div className="md:col-span-2">
        <SectionCard 
          title="Remarks & Notes" 
          icon={<div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><FileText size={20} strokeWidth={2.5} /></div>}
          colorClass="bg-amber-400"
        >
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 min-h-[100px]">
            {lead.remarks ? (
              <p className="text-slate-700 font-medium leading-relaxed">{lead.remarks}</p>
            ) : (
              <p className="text-amber-600/60 font-medium italic text-center mt-6">No remarks recorded for this lead yet.</p>
            )}
          </div>
        </SectionCard>
      </div>

    </div>
  );
}