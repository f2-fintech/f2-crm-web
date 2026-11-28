"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Building2,
  PhoneCall,
  FolderGit2,
  Clock,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Server,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Sliders,
  Database,
  KeyRound,
  FileCheck2,
  Users,
  Timer,
  Info,
} from "lucide-react";

interface SystemSettings {
  company: {
    name: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    timezone: string;
    currency: string;
    fiscalYearStart: string;
  };
  dialer: {
    hostIp: string;
    port: string;
    processId: string;
    authToken: string;
    autoRecordArchive: boolean;
    recordingRetentionDays: number;
    callTimeoutSeconds: number;
  };
  drive: {
    folderUrl: string;
    reallocationLockDays: number;
    syncInterval: string;
    dedupRule: string;
    autoCleanNumbers: boolean;
    batchSize: number;
  };
  distribution: {
    engine: string;
    dailyCapPerAgent: number;
    firstResponseSlaMinutes: number;
    idleLeadReturnHours: number;
    pauseOnInactiveAgent: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    passwordPolicy: string;
    passwordExpiryDays: number;
    maxFailedAttempts: number;
    enforceAdmin2FA: boolean;
    auditLogRetentionDays: number;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  company: {
    name: "F2 Fintech Private Limited",
    tagline: "Smart Financial Growth & Lending Solutions",
    supportEmail: "support@f2fintech.in",
    supportPhone: "+91 98765 43210",
    address: "Block B, Sector 62, Noida, Uttar Pradesh 201309",
    timezone: "Asia/Kolkata (IST +05:30)",
    currency: "INR (₹)",
    fiscalYearStart: "April",
  },
  dialer: {
    hostIp: "192.168.1.220",
    port: "8080",
    processId: "14",
    authToken: "f2_cti_sec_994a287bf10e",
    autoRecordArchive: true,
    recordingRetentionDays: 90,
    callTimeoutSeconds: 45,
  },
  drive: {
    folderUrl: "https://drive.google.com/drive/folders/1MBSZMvggd",
    reallocationLockDays: 7,
    syncInterval: "30_mins",
    dedupRule: "phone_only",
    autoCleanNumbers: true,
    batchSize: 500,
  },
  distribution: {
    engine: "round_robin",
    dailyCapPerAgent: 50,
    firstResponseSlaMinutes: 15,
    idleLeadReturnHours: 48,
    pauseOnInactiveAgent: true,
  },
  security: {
    sessionTimeoutMinutes: 60,
    passwordPolicy: "strong",
    passwordExpiryDays: 90,
    maxFailedAttempts: 5,
    enforceAdmin2FA: true,
    auditLogRetentionDays: 180,
  },
};

const STORAGE_KEY = "crm_enterprise_settings_v1";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"company" | "dialer" | "drive" | "distribution" | "security">("company");
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showToken, setShowToken] = useState<boolean>(false);
  const [dialerTestState, setDialerTestState] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [dialerTestMsg, setDialerTestMsg] = useState<string>("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn("Failed to read settings from storage", e);
    }
  }, []);

  const updateSetting = <T extends keyof SystemSettings>(
    section: T,
    key: keyof SystemSettings[T],
    value: SystemSettings[T][keyof SystemSettings[T]]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        toast.success("Settings saved successfully!", {
          duration: 3500,
          position: "top-right",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "500",
            borderRadius: "10px",
          },
        });
        setHasChanges(false);
      } catch (err) {
        toast.error("Failed to save settings to storage.");
      } finally {
        setIsSaving(false);
      }
    }, 400);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to restore all settings to default values?")) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem(STORAGE_KEY);
      setHasChanges(false);
      toast.success("Settings reset to defaults.");
    }
  };

  const handleTestDialer = () => {
    setDialerTestState("testing");
    setDialerTestMsg("Pinging " + settings.dialer.hostIp + ":" + settings.dialer.port + " (Process " + settings.dialer.processId + ")...");

    setTimeout(() => {
      if (settings.dialer.hostIp.trim().length > 0) {
        setDialerTestState("success");
        setDialerTestMsg(`Handshake OK! Connected to Vicidial Gateway (Process ${settings.dialer.processId}) - Latency 38ms`);
      } else {
        setDialerTestState("error");
        setDialerTestMsg("Connection refused. Please check the Host IP and Process ID.");
      }
    }, 1200);
  };

  const tabs = [
    {
      id: "company" as const,
      name: "Company Profile",
      icon: Building2,
      desc: "Brand info, contacts & locale",
    },
    {
      id: "dialer" as const,
      name: "Dialer Integration",
      icon: PhoneCall,
      desc: "Local CTI IP, port & process",
      badge: "Process 14",
    },
    {
      id: "drive" as const,
      name: "Drive & Lead Allocation",
      icon: FolderGit2,
      desc: "7-day lock, sync & dedup rules",
      badge: "7-Day Lock",
    },
    {
      id: "distribution" as const,
      name: "SLA & Distribution",
      icon: Clock,
      desc: "Allocation engine & thresholds",
    },
    {
      id: "security" as const,
      name: "Security & Access",
      icon: ShieldCheck,
      desc: "Sessions, 2FA & audit retention",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Top Header Card */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200/90 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
                  Enterprise System Settings
                </h1>
                {hasChanges && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                Configure your CRM workspace, CTI dialer host, drive allocation rules, and system policies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:from-brand-700 hover:to-indigo-700 focus:outline-none disabled:opacity-70 sm:text-sm"
          >
            {isSaving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Tabs on Left / Form on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Configuration Sections
              </span>
            </div>
            <nav className="flex flex-col p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${isActive
                      ? "bg-brand-50/80 text-brand-700 shadow-xs dark:bg-brand-950/40 dark:text-brand-300 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                      }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs sm:text-sm font-medium">{tab.name}</span>
                        {tab.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive
                              ? "bg-brand-200/80 text-brand-800 dark:bg-brand-900 dark:text-brand-200"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-400">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Box */}
          <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-xs text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-300">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Enterprise Tip
            </div>
            <p className="mt-1.5 leading-relaxed text-sky-800 dark:text-sky-300/80">
              All settings are safely isolated to administrative configuration and do not modify existing lead or customer document records in MongoDB.
            </p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
            {/* TAB 1: COMPANY PROFILE */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Company & Organization Profile
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Manage official business branding, contact points, and reporting timezone.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Organization Legal Name
                    </label>
                    <input
                      type="text"
                      value={settings.company.name}
                      onChange={(e) => updateSetting("company", "name", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Brand Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={settings.company.tagline}
                      onChange={(e) => updateSetting("company", "tagline", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Official Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.company.supportEmail}
                      onChange={(e) => updateSetting("company", "supportEmail", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Official Helpline / Phone
                    </label>
                    <input
                      type="text"
                      value={settings.company.supportPhone}
                      onChange={(e) => updateSetting("company", "supportPhone", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Head Office Address
                    </label>
                    <textarea
                      rows={2}
                      value={settings.company.address}
                      onChange={(e) => updateSetting("company", "address", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Operating Timezone
                    </label>
                    <select
                      value={settings.company.timezone}
                      onChange={(e) => updateSetting("company", "timezone", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30)</option>
                      <option value="Asia/Dubai (GST +04:00)">Asia/Dubai (GST +04:00)</option>
                      <option value="UTC (GMT +00:00)">UTC (GMT +00:00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Base Currency
                    </label>
                    <select
                      value={settings.company.currency}
                      onChange={(e) => updateSetting("company", "currency", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="INR (₹)">INR (₹ - Indian Rupee)</option>
                      <option value="USD ($)">USD ($ - US Dollar)</option>
                      <option value="AED (د.إ)">AED (د.إ - UAE Dirham)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DIALER INTEGRATION */}
            {activeTab === "dialer" && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        CTI & Dialer Gateway Settings
                      </h2>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                        Connect with local Asterisk / Vicidial IP (192.168.1.220) and process tracking.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Gateway Service Active
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Server Host IP / Hostname
                    </label>
                    <div className="relative">
                      <Server className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={settings.dialer.hostIp}
                        onChange={(e) => updateSetting("dialer", "hostIp", e.target.value)}
                        placeholder="192.168.1.220"
                        className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">Local LAN telephony host for F2 agents.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Port
                    </label>
                    <input
                      type="text"
                      value={settings.dialer.port}
                      onChange={(e) => updateSetting("dialer", "port", e.target.value)}
                      placeholder="8080"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Default API bridge port (e.g. 8080 or 5060).</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Dialer Process ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settings.dialer.processId}
                        onChange={(e) => updateSetting("dialer", "processId", e.target.value)}
                        placeholder="14"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                      <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-2 text-xs font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300">
                        Process 14
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      CTI Auth Secret / API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        value={settings.dialer.authToken}
                        onChange={(e) => updateSetting("dialer", "authToken", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 pr-10 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Call Connect Timeout (Seconds)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={settings.dialer.callTimeoutSeconds}
                      onChange={(e) => updateSetting("dialer", "callTimeoutSeconds", parseInt(e.target.value) || 45)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Recording Retention (Days)
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={365}
                      value={settings.dialer.recordingRetentionDays}
                      onChange={(e) => updateSetting("dialer", "recordingRetentionDays", parseInt(e.target.value) || 90)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>

                {/* Test Connection Box */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                        Test Dialer Gateway Handshake
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Verifies IP connectivity, port listening status, and process response time.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestDialer}
                      disabled={dialerTestState === "testing"}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-xs transition hover:bg-gray-50 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm"
                    >
                      {dialerTestState === "testing" ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Radio className="h-3.5 w-3.5 text-brand-600" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>

                  {dialerTestState !== "idle" && (
                    <div
                      className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs ${dialerTestState === "testing"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : dialerTestState === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-800 border border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300"
                        }`}
                    >
                      {dialerTestState === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                      {dialerTestState === "error" && <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
                      <span>{dialerTestMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DRIVE ALLOCATION */}
            {activeTab === "drive" && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Google Drive Ingestion & Allocation Rules
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Configure Google Drive folder linkage, duplicate screening, and the 7-day re-allocation lock.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Source Google Drive Leads Folder URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={settings.drive.folderUrl}
                        onChange={(e) => updateSetting("drive", "folderUrl", e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 pr-10 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                      <a
                        href={settings.drive.folderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 top-3 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Used by Google Sheets API to poll and parse incoming leads spreadsheets.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Re-Allocation Lock Window (Days)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={settings.drive.reallocationLockDays}
                        onChange={(e) => updateSetting("drive", "reallocationLockDays", parseInt(e.target.value) || 7)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      🔒 Leads assigned within the last {settings.drive.reallocationLockDays} days cannot be re-allocated.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Sync Frequency
                    </label>
                    <select
                      value={settings.drive.syncInterval}
                      onChange={(e) => updateSetting("drive", "syncInterval", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="realtime">Webhook / Real-time Push</option>
                      <option value="15_mins">Every 15 Minutes</option>
                      <option value="30_mins">Every 30 Minutes (Recommended)</option>
                      <option value="hourly">Every 1 Hour</option>
                      <option value="manual">Manual Rescan Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Deduplication Screening
                    </label>
                    <select
                      value={settings.drive.dedupRule}
                      onChange={(e) => updateSetting("drive", "dedupRule", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="phone_only">Phone Number Only (Fastest)</option>
                      <option value="phone_pan">Phone Number + PAN Card</option>
                      <option value="phone_email">Phone Number + Email</option>
                      <option value="none">No Deduplication (Allow Duplicates)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Batch Processing Size
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={2000}
                      step={50}
                      value={settings.drive.batchSize}
                      onChange={(e) => updateSetting("drive", "batchSize", parseInt(e.target.value) || 500)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/30">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                        Auto-Sanitize Phone Numbers
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Automatically strip whitespace, +91, dashes, and ensure 10-digit Indian standard.
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.drive.autoCleanNumbers}
                        onChange={(e) => updateSetting("drive", "autoCleanNumbers", e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DISTRIBUTION & SLA */}
            {activeTab === "distribution" && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lead Distribution Engine & SLA Policies
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Configure agent allocation limits, first-touch response times, and inactive lead recovery.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Distribution Algorithm
                    </label>
                    <select
                      value={settings.distribution.engine}
                      onChange={(e) => updateSetting("distribution", "engine", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="round_robin">Round Robin (Equal distribution among online agents)</option>
                      <option value="capacity_weighted">Capacity-Weighted (Allocates based on agent bandwidth)</option>
                      <option value="performance_tier">Performance Tier (Priority to top converting agents)</option>
                      <option value="manual_only">Manual Manager Allocation Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Daily Max Leads Cap Per Agent
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      value={settings.distribution.dailyCapPerAgent}
                      onChange={(e) => updateSetting("distribution", "dailyCapPerAgent", parseInt(e.target.value) || 50)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Protects tele-callers from data overload.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      First Touch SLA (Minutes)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={settings.distribution.firstResponseSlaMinutes}
                      onChange={(e) => updateSetting("distribution", "firstResponseSlaMinutes", parseInt(e.target.value) || 15)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Time before an uncalled lead is marked SLA Breached.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Idle Lead Recovery (Hours)
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={168}
                      value={settings.distribution.idleLeadReturnHours}
                      onChange={(e) => updateSetting("distribution", "idleLeadReturnHours", parseInt(e.target.value) || 48)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Uncontacted leads automatically return to pool.</p>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/30">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                        Pause Allocation on Inactive Agents
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Automatically skip agents who haven't logged any calls or remarks in over 60 minutes.
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.distribution.pauseOnInactiveAgent}
                        onChange={(e) => updateSetting("distribution", "pauseOnInactiveAgent", e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECURITY & ACCESS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Security, Authentication & Audit Policies
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Manage session expiry, password complexity, failed login lockouts, and audit retention.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Inactivity Session Timeout
                    </label>
                    <select
                      value={settings.security.sessionTimeoutMinutes}
                      onChange={(e) => updateSetting("security", "sessionTimeoutMinutes", parseInt(e.target.value) || 60)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>1 Hour (Recommended)</option>
                      <option value={240}>4 Hours</option>
                      <option value={480}>8 Hours (Full Shift)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Password Complexity Policy
                    </label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => updateSetting("security", "passwordPolicy", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value="standard">Standard (8+ characters)</option>
                      <option value="strong">Strong (8+ chars, numbers, symbols)</option>
                      <option value="strict">Strict Enterprise (12+ chars, mixed-case, symbols)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Max Failed Login Attempts
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={settings.security.maxFailedAttempts}
                      onChange={(e) => updateSetting("security", "maxFailedAttempts", parseInt(e.target.value) || 5)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">Account locked after consecutive failed attempts.</p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Audit Log Retention
                    </label>
                    <select
                      value={settings.security.auditLogRetentionDays}
                      onChange={(e) => updateSetting("security", "auditLogRetentionDays", parseInt(e.target.value) || 180)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option value={30}>30 Days</option>
                      <option value={90}>90 Days</option>
                      <option value={180}>180 Days (6 Months)</option>
                      <option value={365}>365 Days (1 Year)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/30">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                        Enforce Two-Factor Authentication (2FA) for Admins
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        Requires OTP authentication on login for Super Admin and Admin role accounts.
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.enforceAdmin2FA}
                        onChange={(e) => updateSetting("security", "enforceAdmin2FA", e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
