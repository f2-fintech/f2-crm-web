"use client";

import React, { useState } from "react";
import { Link2, Webhook, Zap, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

const integrationsData = [
  { id: "cibil", name: "CIBIL Bureau", category: "Credit Check", status: "connected", icon: "🏛️", desc: "Automatic credit score checks during underwriting." },
  { id: "equifax", name: "Equifax", category: "Credit Check", status: "disconnected", icon: "🏢", desc: "Alternative credit scoring integration." },
  { id: "razorpay", name: "RazorpayX", category: "Payments", status: "connected", icon: "💳", desc: "Automated loan disbursals directly to customer accounts." },
  { id: "twilio", name: "Twilio SMS", category: "Communications", status: "connected", icon: "💬", desc: "Send automated SMS alerts for application statuses." },
  { id: "sendgrid", name: "SendGrid", category: "Communications", status: "disconnected", icon: "📧", desc: "Email marketing and transactional emails." },
  { id: "karza", name: "Karza KYC", category: "Verification", status: "connected", icon: "🔍", desc: "Instant AI-powered PAN and Aadhaar verification." },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(integrationsData);

  const toggleStatus = (id: string) => {
    setIntegrations(prev => prev.map(int => 
      int.id === id ? { ...int, status: int.status === "connected" ? "disconnected" : "connected" } : int
    ));
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
        <div>
          <PageBreadcrumb pageTitle="Integrations & Automations" />
          <p className="mt-1 text-sm text-gray-500">Connect third-party Fintech services to automate your CRM pipelines.</p>
        </div>
        <button className="mt-4 md:mt-0 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
          <Webhook size={18} /> Add Custom Webhook
        </button>
      </div>

      {/* Automations Banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
            <Zap size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Active Workflows: 4 Running</h3>
            <p className="text-sm text-gray-600">The CRM is actively syncing with Karza KYC and RazorpayX.</p>
          </div>
        </div>
        <button className="mt-4 md:mt-0 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-gray-50 flex items-center gap-2">
          View Workflow Logs <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(int => (
          <div key={int.id} className={`rounded-2xl border ${int.status === 'connected' ? 'border-emerald-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50'} p-6 transition-all hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{int.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900">{int.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{int.category}</span>
                </div>
              </div>
              <div className="flex items-center">
                {int.status === "connected" ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle2 size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    <ShieldAlert size={12} /> Disconnected
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 min-h-[40px]">{int.desc}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button className="text-sm font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                <Link2 size={16} /> API Docs
              </button>
              
              <button 
                onClick={() => toggleStatus(int.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${int.status === 'connected' ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {int.status === "connected" ? "Disconnect" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
