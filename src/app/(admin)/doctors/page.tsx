"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Stethoscope,
  Sparkles,
  Share2,
  MessageSquare,
  Gift,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Building2,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  User,
  ShieldCheck,
  Award,
  Zap,
  RefreshCw,
  FileText,
  LayoutGrid,
  List,
  Calendar,
  X,
  Send,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, Box, Typography, IconButton } from "@mui/material";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadJourneyDialog from "@/components/leads/dialogs/LeadJourneyDialog";
import api from "@/lib/axios";

// 5 Dedicated High-Conversion WhatsApp Doctor Offer Templates
const OFFER_TEMPLATES = [
  {
    id: "topup",
    title: "Pre-Approved Top-Up Loan",
    badge: "Most Popular",
    badgeColor: "bg-emerald-100 text-emerald-800",
    icon: Zap,
    defaultAmount: "25,00,000",
    defaultRate: "10.25%",
    description: "Exclusive pre-approved top-up fund with zero collateral & instant disbursal.",
    getMessage: (doc: any, amount: string, rate: string, customNote: string) => 
`🩺 *F2 FINTECH VIP DOCTOR PRIVILEGE*

Respected *${doc.fullName}*,
Greetings from F2 Fintech!

Congratulations! In appreciation of your outstanding professional medical credentials and track record, we are pleased to inform you that you have an exclusive *Pre-Approved Top-Up Loan Offer*:

💰 *Pre-Approved Amount:* ₹${amount}
📊 *Special Privilege Rate:* ${rate} p.a.
⚡ *Collateral:* Zero (100% Unsecured)
⏱️ *Disbursal Time:* Within 24-48 Hours
📑 *Documentation:* Minimal / Fast-Track Paperless

${customNote ? `📌 *Special Note:* ${customNote}\n\n` : ''}You can check your loan profile & active tracker here:
🔗 ${window.location.origin}/track-loan?ticket=${doc.omsTicketId || doc.leadId || ''}

Would you like our Senior Banking Specialist to assist you with the one-click disbursal? Please reply *"YES"* to proceed.

Warm Regards,
*F2 Fintech Medical Banking Division*
📞 Contact: +91 8826884071 | info@f2fintech.in`
  },
  {
    id: "equipment",
    title: "Medical Equipment & Clinic Expansion",
    badge: "Clinic Growth",
    badgeColor: "bg-blue-100 text-blue-800",
    icon: Building2,
    defaultAmount: "50,00,000",
    defaultRate: "9.99%",
    description: "Financing for diagnostic machines, clinic renovation, ultrasound, dental chairs & ICU setup.",
    getMessage: (doc: any, amount: string, rate: string, customNote: string) => 
`🏥 *MEDICAL EQUIPMENT & CLINIC UPGRADE FACILITY*

Respected *${doc.fullName}*,
Greetings from F2 Fintech!

Looking to upgrade your medical practice or expand your clinic/hospital? We are offering specialized financing tailored exclusively for medical practitioners:

🔬 *Financing Up to:* ₹${amount}
📉 *Subsidized Interest Rate:* Starting from ${rate}
🩺 *Eligible Upgrades:* CT/MRI, Sonography, Dental Chairs, Pathology & Clinic Setup
⏳ *Flexible Repayment:* Up to 84 Months EMI tenure
💼 *Tax Benefit:* 100% Depreciation benefit on medical assets

${customNote ? `📌 *Note:* ${customNote}\n\n` : ''}Track your current F2 Fintech application:
🔗 ${window.location.origin}/track-loan?ticket=${doc.omsTicketId || doc.leadId || ''}

Reply with *"EQUIPMENT"* or call us to get an instant equipment sanction letter today!

Warm Regards,
*Medical Assets Team | F2 Fintech*`
  },
  {
    id: "balance_transfer",
    title: "Balance Transfer & Lower EMI",
    badge: "Save Interest",
    badgeColor: "bg-purple-100 text-purple-800",
    icon: Award,
    defaultAmount: "35,00,000",
    defaultRate: "9.75%",
    description: "Transfer current loans from high-interest lenders to lower your EMI by up to 30%.",
    getMessage: (doc: any, amount: string, rate: string, customNote: string) => 
`🔄 *DOCTOR BALANCE TRANSFER & EMI REDUCTION*

Respected *${doc.fullName}*,
Greetings from F2 Fintech!

Are you currently servicing a personal or professional loan at high interest rates? 

We have launched the *F2 Doctor Balance Transfer Privilege*:
📉 *Reduce your current EMI by up to 25% - 30%*
💰 *Additional Top-Up Capital:* Up to ₹${amount}
📊 *Reduced Interest Rate:* Starting at ${rate}
🚫 *Zero Hassle:* We manage the entire lender-to-lender paperwork takeover

${customNote ? `📌 *Note:* ${customNote}\n\n` : ''}Check your live loan profile:
🔗 ${window.location.origin}/track-loan?ticket=${doc.omsTicketId || doc.leadId || ''}

Reply *"REDUCE EMI"* to speak with our Debt Restructuring Desk.

Warm Regards,
*F2 Fintech Client Advisory*`
  },
  {
    id: "referral",
    title: "Doctor Colleague Referral Benefit",
    badge: "₹15,000 Cash Reward",
    badgeColor: "bg-amber-100 text-amber-800",
    icon: Gift,
    defaultAmount: "15,000",
    defaultRate: "N/A",
    description: "Refer a fellow doctor or clinic to receive an exclusive ₹15,000 referral reward per disbursal.",
    getMessage: (doc: any, amount: string, _rate: string, customNote: string) => 
`🤝 *F2 DOCTOR REFERRAL CIRCLE - PRIVILEGE REWARD*

Respected *${doc.fullName}*,
Greetings from F2 Fintech!

As a valued member of our Doctor Network, we invite you to join the *F2 Doctor Referral Circle*:

🎁 *Earn ₹${amount} Privilege Reward* for every fellow doctor colleague, clinic, or medical setup you refer to F2 Fintech who avails funding!
⚡ *Fast Disbursals for your colleague* with VIP Fast-Track status
📑 *Zero documentation hassle* for you — simply share their name & contact

${customNote ? `📌 *Note:* ${customNote}\n\n` : ''}Know a doctor colleague looking for working capital or clinic expansion? Simply reply with their Name & Number, and we will take care of the rest with complete VIP privilege.

Warm Regards,
*Doctor Relations Desk | F2 Fintech*`
  },
  {
    id: "processing_fee_waiver",
    title: "Zero Processing Fee Privilege",
    badge: "100% Fee Waiver",
    badgeColor: "bg-teal-100 text-teal-800",
    icon: ShieldCheck,
    defaultAmount: "30,00,000",
    defaultRate: "10.00%",
    description: "Special seasonal waiver: 100% processing fee waiver + priority queue disbursal.",
    getMessage: (doc: any, amount: string, rate: string, customNote: string) => 
`🎖️ *SPECIAL PRIVILEGE: 100% PROCESSING FEE WAIVER*

Respected *${doc.fullName}*,
Greetings from F2 Fintech!

To honor our medical community, F2 Fintech is offering a limited-period privilege exclusively for verified doctors:

🎟️ *100% Processing Fee Waiver* (Save ₹25,000 - ₹50,000 upfront)
💰 *Loan Facility:* Up to ₹${amount}
📊 *Privilege Rate:* ${rate}
🛡️ *Priority Green Channel Disbursal*

${customNote ? `📌 *Special Note:* ${customNote}\n\n` : ''}This privilege is valid for applications initiated this week. 
Live Tracking Portal:
🔗 ${window.location.origin}/track-loan?ticket=${doc.omsTicketId || doc.leadId || ''}

Reply *"CLAIM WAIVER"* to lock in your 100% processing fee waiver voucher.

Warm Regards,
*F2 Fintech Medical Banking Services*`
  }
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "disbursed" | "approved" | "repeat" | "operations">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Journey Dialog State
  const [activeJourneyLeadId, setActiveJourneyLeadId] = useState<string | null>(null);

  // WhatsApp Campaign Modal State
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("topup");
  const [customAmount, setCustomAmount] = useState("");
  const [customRate, setCustomRate] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sentOffers, setSentOffers] = useState<Record<string, { date: string; template: string }>>({});

  useEffect(() => {
    fetchDoctors();
    // Load sent offer history from local storage
    try {
      const stored = localStorage.getItem("f2_doctor_campaigns");
      if (stored) {
        setSentOffers(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get("/leads", {
        params: { isDoctor: true, limit: 200 }
      });
      const list = response.data?.data || [];
      setDoctors(list);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group and detect returning / repeat clients
  const processedDoctors = useMemo(() => {
    // Count phone occurrences
    const phoneCounts: Record<string, number> = {};
    doctors.forEach(d => {
      const p = (d.phone || "").replace(/\D/g, "");
      if (p) phoneCounts[p] = (phoneCounts[p] || 0) + 1;
    });

    return doctors.map(d => {
      const p = (d.phone || "").replace(/\D/g, "");
      const isMultiTicket = (phoneCounts[p] || 0) > 1;
      const status = (d.omsTicketStatus || d.status || "").toLowerCase();
      const isDisbursed = status.includes("disburse");
      const isApproved = status.includes("approv");
      const isRepeatClient = isMultiTicket || isDisbursed;

      return {
        ...d,
        isRepeatClient,
        isDisbursed,
        isApproved,
        displayStatus: d.omsTicketStatus || d.status || "Pending Review"
      };
    });
  }, [doctors]);

  // Filtered List
  const filteredDoctors = useMemo(() => {
    return processedDoctors.filter(doc => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (doc.fullName || "").toLowerCase().includes(q) ||
        (doc.phone || "").includes(q) ||
        (doc.email || "").toLowerCase().includes(q) ||
        (doc.city || "").toLowerCase().includes(q) ||
        String(doc.omsTicketId || "").includes(q) ||
        (doc.omsProvider || "").toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedFilter === "disbursed") return doc.isDisbursed;
      if (selectedFilter === "approved") return doc.isApproved;
      if (selectedFilter === "repeat") return doc.isRepeatClient;
      if (selectedFilter === "operations") {
        const s = (doc.omsTicketStatus || "").toLowerCase();
        return s.includes("operation") || s.includes("file") || s.includes("process");
      }

      return true;
    });
  }, [processedDoctors, searchQuery, selectedFilter]);

  // Overall Statistics
  const stats = useMemo(() => {
    let disbursedCount = 0;
    let approvedCount = 0;
    let repeatCount = 0;
    let totalPortfolio = 0;

    processedDoctors.forEach(d => {
      if (d.isDisbursed) disbursedCount++;
      if (d.isApproved) approvedCount++;
      if (d.isRepeatClient) repeatCount++;
      totalPortfolio += Number(d.loanAmount || 0);
    });

    return {
      total: processedDoctors.length,
      disbursed: disbursedCount,
      approved: approvedCount,
      repeat: repeatCount,
      portfolioCr: (totalPortfolio / 10000000).toFixed(2)
    };
  }, [processedDoctors]);

  // Open WhatsApp Offer Modal
  const handleOpenOfferModal = (doc: any) => {
    setActiveDoctor(doc);
    const tmpl = OFFER_TEMPLATES[0];
    setSelectedTemplateId(tmpl.id);
    setCustomAmount(tmpl.defaultAmount);
    setCustomRate(tmpl.defaultRate);
    setCustomNote("");
    setCopiedSuccess(false);
    setOfferModalOpen(true);
  };

  // Change Template in Modal
  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = OFFER_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setCustomAmount(tmpl.defaultAmount);
      setCustomRate(tmpl.defaultRate);
    }
  };

  // Current Active Template Object
  const currentTemplate = useMemo(() => {
    return OFFER_TEMPLATES.find(t => t.id === selectedTemplateId) || OFFER_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Generated WhatsApp Message
  const currentMessage = useMemo(() => {
    if (!activeDoctor) return "";
    return currentTemplate.getMessage(activeDoctor, customAmount, customRate, customNote);
  }, [activeDoctor, currentTemplate, customAmount, customRate, customNote]);

  // Trigger WhatsApp Web / App
  const handleSendWhatsApp = () => {
    if (!activeDoctor) return;
    const phone = (activeDoctor.phone || "").replace(/\D/g, "");
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(currentMessage)}`;

    // Save into history
    const updated = {
      ...sentOffers,
      [activeDoctor._id || activeDoctor.phone]: {
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        template: currentTemplate.title
      }
    };
    setSentOffers(updated);
    try {
      localStorage.setItem("f2_doctor_campaigns", JSON.stringify(updated));
    } catch {
      // ignore
    }

    window.open(url, "_blank");
  };

  // Copy Message to Clipboard
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <PageBreadcrumb pageTitle="Doctor Privilege Network & Offer Campaigns" />

      {/* Hero Banner with Medical / Fintech Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 p-7 sm:p-9 text-white shadow-2xl border border-teal-700/40">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-28 -translate-y-28 rounded-full bg-teal-400 opacity-15 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-emerald-500 opacity-10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-black tracking-wide uppercase">
              <Stethoscope size={14} className="text-teal-300" />
              Verified Doctor Client Directory & WhatsApp Campaign Hub
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Doctor Network & Privilege Rolodex
            </h1>
            <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed font-normal">
              Centralized rolodex of all medical practitioners. Automatically identify 
              <span className="font-bold text-amber-300"> returning & repeat doctor clients</span>, track verified disbursals, 
              and dispatch personalized <span className="font-bold text-emerald-300">WhatsApp pre-approved top-up offers & equipment financing</span> in 1-click.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={fetchDoctors}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Refreshing..." : "Refresh Rolodex"}
            </button>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-950/60 border border-teal-600/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck size={14} className="text-teal-400" />
              <span>5 Custom Doctor Offers Active</span>
            </div>
          </div>
        </div>

        {/* Real-time KPI Matrix Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-6 border-t border-teal-600/30">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-200">Total Doctors</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{stats.total}</p>
            <span className="text-[10px] text-teal-300 font-medium">In CRM Database</span>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-400/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Disbursed Doctors</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1">{stats.disbursed}</p>
            <span className="text-[10px] text-emerald-200 font-medium">Ready for Top-Up 🚀</span>
          </div>

          <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-3.5 border border-blue-400/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Sanctioned / Approved</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-300 mt-1">{stats.approved}</p>
            <span className="text-[10px] text-blue-200 font-medium">Awaiting Disbursal</span>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-md rounded-2xl p-3.5 border border-amber-400/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Repeat Clients</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">{stats.repeat}</p>
            <span className="text-[10px] text-amber-200 font-medium">⭐ Returning Doctors</span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-purple-500/10 backdrop-blur-md rounded-2xl p-3.5 border border-purple-400/20">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-300">Portfolio Value</p>
            <p className="text-2xl sm:text-3xl font-black text-purple-200 mt-1">₹ {stats.portfolioCr} Cr</p>
            <span className="text-[10px] text-purple-200 font-medium">Requested Capital</span>
          </div>
        </div>
      </div>

      {/* Search, Filter Tabs & View Mode Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Doctor Name, Mobile Number, City, Ticket ID, or Bank..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end md:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-800 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <LayoutGrid size={14} />
              Rolodex Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-800 shadow-2xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <List size={14} />
              Directory Table
            </button>
          </div>
        </div>

        {/* Filter Badges / Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter:
          </span>

          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Doctors ({stats.total})
          </button>

          <button
            onClick={() => setSelectedFilter("disbursed")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === "disbursed"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Zap size={12} />
            Disbursed / Top-Up Ready ({stats.disbursed})
          </button>

          <button
            onClick={() => setSelectedFilter("repeat")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedFilter === "repeat"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <Award size={12} />
            ⭐ Repeat / Returning Doctors ({stats.repeat})
          </button>

          <button
            onClick={() => setSelectedFilter("approved")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "approved"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Approved ({stats.approved})
          </button>

          <button
            onClick={() => setSelectedFilter("operations")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "operations"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            In Operations
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredDoctors.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Stethoscope size={28} />
          </div>
          <h3 className="text-lg font-black text-slate-800">No Doctor Records Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No doctors matched your current filter criteria &apos;{searchQuery}&apos;. Try resetting your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* VIEW MODE 1: GRID CARDS (ROLODEX) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => {
            const lastSent = sentOffers[doc._id || doc.phone];
            const cleanPhone = (doc.phone || "").replace(/\D/g, "");

            return (
              <div
                key={doc._id || doc.id || doc.leadId}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  doc.isDisbursed ? 'bg-emerald-500' :
                  doc.isApproved ? 'bg-blue-500' :
                  doc.isRepeatClient ? 'bg-amber-500' : 'bg-teal-600'
                }`} />

                {/* Card Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/70 text-teal-700 flex items-center justify-center shrink-0 font-black shadow-2xs group-hover:bg-teal-600 group-hover:text-white transition-colors">
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                            {doc.fullName}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-slate-400" />
                          {doc.city || "Clinic / Hospital"} • {doc.loanType || "Doctor Loan"}
                        </p>
                      </div>
                    </div>

                    {/* Returning Doctor VIP Badge */}
                    {doc.isRepeatClient && (
                      <span className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        <Award size={12} className="text-amber-600" />
                        Returning
                      </span>
                    )}
                  </div>

                  {/* Status & Loan Financial Strip */}
                  <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loan Request</span>
                      <span className="text-sm font-black text-slate-900">
                        ₹ {Number(doc.loanAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Provider & Status:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">{doc.omsProvider || "Partner NBFC"}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          doc.isDisbursed ? 'bg-emerald-100 text-emerald-800' :
                          doc.isApproved ? 'bg-blue-100 text-blue-800' :
                          (doc.omsTicketStatus || '').toLowerCase().includes('reject') ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.displayStatus}
                        </span>
                      </div>
                    </div>

                    {doc.omsTicketId && (
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/50">
                        <span className="text-slate-400 text-[11px] font-semibold">Ticket ID:</span>
                        <a
                          href={`/track-loan?ticket=${doc.omsTicketId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline text-[11px]"
                        >
                          #{doc.omsTicketId}
                          <ArrowUpRight size={11} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Contact Info Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                    >
                      <Phone size={12} className="text-slate-500" />
                      {doc.phone}
                    </a>
                    {doc.email && (
                      <a
                        href={`mailto:${doc.email}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors truncate max-w-[180px]"
                        title={doc.email}
                      >
                        <Mail size={12} className="text-slate-500 shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Last Offer History Alert */}
                  {lastSent && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-800 text-[11px] font-bold">
                      <CheckCircle2 size={13} className="text-teal-600 shrink-0" />
                      <span>Sent &apos;{lastSent.template}&apos; on {lastSent.date}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveJourneyLeadId(doc._id || doc.id || doc.leadId)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <FileText size={13} />
                    Loan Journey
                  </button>

                  <button
                    onClick={() => handleOpenOfferModal(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-600/30 group/offer"
                  >
                    <Gift size={14} className="group-hover/offer:scale-110 transition-transform" />
                    Send Offer 🎁
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE DIRECTORY */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Doctor Profile</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Contact & City</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Loan Details</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Provider & Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Repeat Status</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center">Campaign Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => {
                  const lastSent = sentOffers[doc._id || doc.phone];
                  return (
                    <tr key={doc._id || doc.id || doc.leadId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center font-black shrink-0">
                            <Stethoscope size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{doc.fullName}</p>
                            <p className="text-xs text-slate-400 font-semibold">{doc.loanType || "Doctor Loan"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-xs text-slate-800">{doc.phone}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{doc.city || "Clinic"}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900">
                          ₹ {Number(doc.loanAmount || 0).toLocaleString("en-IN")}
                        </div>
                        {doc.omsTicketId && (
                          <a
                            href={`/track-loan?ticket=${doc.omsTicketId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono font-bold text-teal-600 hover:underline flex items-center gap-1"
                          >
                            Ticket #{doc.omsTicketId} <ArrowUpRight size={10} />
                          </a>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-xs mb-1">{doc.omsProvider || "Partner NBFC"}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          doc.isDisbursed ? 'bg-emerald-100 text-emerald-800' :
                          doc.isApproved ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {doc.displayStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {doc.isRepeatClient ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase">
                            <Award size={11} className="text-amber-600" />
                            ⭐ Repeat Client
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">First Time</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenOfferModal(doc)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-sm"
                          >
                            <Gift size={13} />
                            Send Offer
                          </button>
                          <button
                            onClick={() => setActiveJourneyLeadId(doc._id || doc.id || doc.leadId)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer"
                            title="View Loan Journey"
                          >
                            <FileText size={15} />
                          </button>
                        </div>
                        {lastSent && (
                          <div className="text-[10px] text-teal-600 font-semibold mt-1">
                            Offer sent {lastSent.date}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP OFFER CAMPAIGN MODAL */}
      <Dialog
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, overflow: 'hidden' }
        }}
      >
        {activeDoctor && (
          <div className="bg-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-200">
                  <Gift size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-teal-300">
                      WhatsApp Privilege Campaign Hub
                    </span>
                    {activeDoctor.isRepeatClient && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Repeat Doctor
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white">{activeDoctor.fullName}</h2>
                  <p className="text-xs text-teal-200 font-semibold">
                    📞 {activeDoctor.phone} • {activeDoctor.city || 'Clinic'} • Ticket #{activeDoctor.omsTicketId || 'N/A'}
                  </p>
                </div>
              </div>
              <IconButton
                onClick={() => setOfferModalOpen(false)}
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
              >
                <X size={18} />
              </IconButton>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Template Selector Grid */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Select Specialized Doctor Campaign Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {OFFER_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    const IconComponent = tmpl.icon;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <IconComponent size={16} />
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${tmpl.badgeColor}`}>
                            {tmpl.badge}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-black ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>
                            {tmpl.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {tmpl.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Inputs to Personalize Offer */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-teal-600" />
                  Personalize Financial Parameters for Dr. {activeDoctor.fullName}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      {selectedTemplateId === 'referral' ? 'Referral Reward (₹)' : 'Offer Sanction Amount (₹)'}
                    </label>
                    <input
                      type="text"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 25,00,000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {selectedTemplateId !== 'referral' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Special Interest Rate / APR
                      </label>
                      <input
                        type="text"
                        value={customRate}
                        onChange={(e) => setCustomRate(e.target.value)}
                        placeholder="e.g. 9.99% p.a."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Custom Agent Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="e.g. Approved under Bajaj Healthcare scheme with zero processing fee..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Live Bubble Preview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare size={13} className="text-emerald-600" />
                    WhatsApp Live Preview (Formatted Message)
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    Target: +91 {activeDoctor.phone}
                  </span>
                </div>

                <div className="bg-[#ECE5DD] p-4 rounded-3xl border border-slate-300 shadow-inner">
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 max-w-xl shadow-xs border border-[#dad2c7] text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed relative">
                    {currentMessage}
                    <div className="text-[10px] text-slate-400 text-right mt-2 font-semibold">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Toolbar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                {copiedSuccess ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Offer Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOfferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Send Offer via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* LEAD JOURNEY DIALOG (Full action history timeline) */}
      <LeadJourneyDialog
        open={!!activeJourneyLeadId}
        onClose={() => setActiveJourneyLeadId(null)}
        leadId={activeJourneyLeadId}
      />
    </div>
  );
}
